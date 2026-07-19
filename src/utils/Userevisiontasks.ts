import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import api from "@/utils/api";
import {
  RawRevisionItem,
  Topic,
  flattenToTasks,
  groupTasks,
  toDateString,
} from "./RevisionTasks"


export function useRevisionTasks(subjectId?: string) {
  const [revisions, setRevisions] = useState<RawRevisionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRevisions = async () => {
      try {
        const res = await api.get("/revision/get-revision");
        if (res.data.success && Array.isArray(res.data.data.revisions)) {
          setRevisions(res.data.data.revisions);
        }
      } catch (error: any) {
        Alert.alert("Error", error?.response?.data?.message || "Failed to load revisions");
      } finally {
        setLoading(false);
      }
    };
    loadRevisions();
  }, []);

  const filteredRevisions = useMemo(() => {
    const result =
      typeof subjectId === "string"
        ? revisions.filter((r) => r.subjectId === subjectId)
        : revisions;

    return groupTasks(flattenToTasks(result));
  }, [revisions, subjectId]);

  const examProgress = useMemo(() => {
    if (typeof subjectId !== "string") return null;
    const subjectRevisions = revisions.filter((r) => r.subjectId === subjectId);
    const allTopics = subjectRevisions.flatMap((r) => r.topics);
    return { done: allTopics.filter((t) => t.progress >= 100).length, total: allTopics.length };
  }, [revisions, subjectId]);

  const addRevision = async (topics: Topic[], date: Date) => {
    try {
      const res = await api.post("/revision/add-revision", {
        subjectId,
        topics,
        date: toDateString(date),
      });

      if (res.data.success) {
        const updated = await api.get("/revision/get-revision");
        setRevisions(updated.data.data.revisions || []);
        return { success: true };
      }
      return { success: false };
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to save revision");
      return { success: false };
    }
  };

  const setTopicProgressLocal = (
    revisionId: string | undefined,
    createdAt: number,
    topicIndex: number,
    newProgress: number
  ) => {
    const clamped = Math.min(100, Math.max(0, newProgress));
    const matchGroupKey = (revisionId ?? createdAt)?.toString();

    setRevisions((prev) =>
      prev.map((item) => {
        const groupKey = (item._id ?? item.createdAt)?.toString();
        if (groupKey !== matchGroupKey) return item;

        return {
          ...item,
          topics: item.topics.map((t, idx) =>
            idx === topicIndex ? { ...t, progress: clamped } : t
          ),
        };
      })
    );
  };

  const updateTopicProgress = async (
    revisionId: string | undefined,
    createdAt: number,
    topicIndex: number,
    topicName: string,
    newProgress: number
  ) => {
    const clamped = Math.min(100, Math.max(0, newProgress));

    setTopicProgressLocal(revisionId, createdAt, topicIndex, clamped);

    try {
      const res = await api.patch("/revision/update-progress", {
        subjectId,
        topic: topicName,
        progress: clamped,
      });

      if (res.data.success && Array.isArray(res.data.data.revisions)) {
        setRevisions(res.data.data.revisions);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to update progress");
    }
  };

  return {
    loading,
    filteredRevisions,
    examProgress,
    addRevision,
    setTopicProgressLocal,
    updateTopicProgress,
  };
}