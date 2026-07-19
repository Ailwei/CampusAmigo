import api from "@/utils/api";
import { RawTaskItem, Topic, flattenToTasks, groupTasks } from "@/utils/Assignmenttasks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

export function useAssignmentTasks(assignmentId?: string) {
  const [assignmentTasks, setAssignmentTasks] = useState<RawTaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  const hasAssignmentId = typeof assignmentId === "string" && assignmentId.length > 0;

  const loadTasks = useCallback(async () => {
    try {
      const res = await api.get("/assignment/get-tasks");
      if (res.data.success && Array.isArray(res.data.data.assignmentTasks)) {
        setAssignmentTasks(res.data.data.assignmentTasks);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to load revisions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const filteredTasks = useMemo(() => {
    const result = hasAssignmentId ? assignmentTasks.filter((r) => r.assignmentId === assignmentId) : assignmentTasks;
    return groupTasks(flattenToTasks(result));
  }, [assignmentTasks, hasAssignmentId, assignmentId]);

  const assignmentProgress = useMemo(() => {
    if (!hasAssignmentId) return null;
    const subjectAssignmentTasks = assignmentTasks.filter((r) => r.assignmentId === assignmentId);
    const allTopics = subjectAssignmentTasks.flatMap((r) => r.topics);
    return { done: allTopics.filter((t) => t.progress >= 100).length, total: allTopics.length };
  }, [assignmentTasks, hasAssignmentId, assignmentId]);

  const addTask = useCallback(
    async (topics: Topic[]) => {
      try {
        const res = await api.post("/assignment/add-task", { assignmentId, topics });
        if (res.data.success) {
          const updated = await api.get("/assignment/get-tasks");
          setAssignmentTasks(updated.data.data.assignmentTasks || []);
          return { success: true as const };
        }
        return { success: false as const };
      } catch (error: any) {
        Alert.alert("Error", error?.response?.data?.message || "Failed to save revision");
        return { success: false as const };
      }
    },
    [assignmentId]
  );

  const setTopicProgressLocal = useCallback(
    (taskId: string | undefined, createdAt: number, topicIndex: number, newProgress: number) => {
      const clamped = Math.min(100, Math.max(0, newProgress));
      const matchGroupKey = (taskId ?? createdAt)?.toString();

      setAssignmentTasks((prev) =>
        prev.map((item) => {
          const groupKey = (item._id ?? item.createdAt)?.toString();
          if (groupKey !== matchGroupKey) return item;

          return {
            ...item,
            topics: item.topics.map((t, idx) => (idx === topicIndex ? { ...t, progress: clamped } : t)),
          };
        })
      );
    },
    []
  );

  const updateTopicProgress = useCallback(
    async (taskId: string | undefined, createdAt: number, topicIndex: number, topicName: string, newProgress: number) => {
      const clamped = Math.min(100, Math.max(0, newProgress));

      setTopicProgressLocal(taskId, createdAt, topicIndex, clamped);

      try {
        const res = await api.patch("/assignment/update-task-progress", {
          assignmentId,
          topic: topicName,
          progress: clamped,
        });

        if (res.data.success && Array.isArray(res.data.data.assignmentTasks) && res.data.data.assignmentTasks.length > 0) {
          setAssignmentTasks(res.data.data.assignmentTasks);
        }
      } catch (error: any) {
        Alert.alert("Error", error?.response?.data?.message || "Failed to update progress");
      }
    },
    [assignmentId, setTopicProgressLocal]
  );

  return {
    loading,
    filteredTasks,
    assignmentProgress,
    addTask,
    setTopicProgressLocal,
    updateTopicProgress,
  };
}