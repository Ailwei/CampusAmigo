import { useUser } from "@/context/userContext";
import api from "@/utils/api";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { daysLeft, SubjectOption, TaskItem, toSubjectOption } from "./Assignment";

export function useAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);
  const [subjectOptionsLoading, setSubjectOptionsLoading] = useState(true);

  const { user, loadUser } = useUser();

  useEffect(() => {
    if (!user) loadUser();
  }, [user, loadUser]);


  useEffect(() => {
    const loadSubjectOptions = async () => {
      setSubjectOptionsLoading(true);
      try {
        const profileClasses: SubjectOption[] = (user?.subjects || [])
          .map(toSubjectOption)
          .filter((s: SubjectOption | null): s is SubjectOption => !!s);

        const summaryRes = await api.get("/onboarding/summary");
        const summaryClasses: SubjectOption[] = (summaryRes?.data?.data?.subjects || [])
          .map(toSubjectOption)
          .filter((s: SubjectOption | null): s is SubjectOption => !!s);

        const previousSubjects: SubjectOption[] = assignments
          .map((item: any) => toSubjectOption(item.subject))
          .filter((s: SubjectOption | null): s is SubjectOption => !!s);

        const merged = [...profileClasses, ...summaryClasses, ...previousSubjects];
        const deduped = Array.from(new Map(merged.map((s) => [s.id, s])).values());

        if (deduped.length === 0) {
          console.warn(
            "[useAssignments] subjectOptions is empty after mapping. Raw user.subjects:",
            JSON.stringify(user?.subjects),
            "Raw summary subjects:",
            JSON.stringify(summaryRes?.data?.data?.subjects)
          );
        }

        setSubjectOptions(deduped);
      } catch (error) {
        const fallback: SubjectOption[] = (user?.classes || [])
          .map(toSubjectOption)
          .filter((s: SubjectOption | null): s is SubjectOption => !!s);
        setSubjectOptions(fallback);
      } finally {
        setSubjectOptionsLoading(false);
      }
    };

    loadSubjectOptions();
  }, [user, assignments]);

  const loadAssignments = useCallback(async () => {
    try {
      const res = await api.get("/assignment/get-assignment");
      if (res.data.success) {
        setAssignments(res.data.data.assignments);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to load assignments");
    }
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const res = await api.get("/assignment/get-tasks");
      if (res.data.success && Array.isArray(res.data.data.assignmentTasks)) {
        setTasks(res.data.data.assignmentTasks);
      }
    } catch (error) {
      console.error("Failed to load tasks", error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadAssignments(), loadTasks()]);
      setLoading(false);
    };
    init();
  }, [loadAssignments, loadTasks]);

  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      loadAssignments();
      loadTasks();
    }, [loadAssignments, loadTasks])
  );

  const assignmentProgress = useMemo(() => {
    const map = new Map<string, number>();
    const byAssignment = new Map<string, { name: string; progress: number }[]>();

    tasks.forEach((r) => {
      const key = r.assignmentId;
      if (!key) return;
      const existing = byAssignment.get(key) || [];
      byAssignment.set(key, [...existing, ...(r.topics || [])]);
    });

    byAssignment.forEach((topics, key) => {
      if (topics.length === 0) {
        map.set(key, 0);
        return;
      }
      const avg = topics.reduce((sum, t) => sum + (t.progress || 0), 0) / topics.length;
      map.set(key, Math.round(avg));
    });

    return map;
  }, [tasks]);

  const getProgress = useCallback(
    (assignmentId?: string) => {
      if (!assignmentId) return 0;
      return assignmentProgress.get(assignmentId) ?? 0;
    },
    [assignmentProgress]
  );

  const sortedAssignments = useMemo(() => {
    return [...assignments].sort((a, b) => daysLeft(a.due) - daysLeft(b.due));
  }, [assignments]);

  const addAssignment = useCallback(
    async (params: { title: string; subjectId: string; due: string }) => {
      try {
        const res = await api.post("/assignment/add-assignment", params);
        if (res.data.success) {
          const updated = await api.get("/assignment/get-assignment");
          if (updated.data.success) {
            setAssignments(updated.data.data.assignments || []);
          }
          return { success: true as const };
        }
        return { success: false as const, message: res.data.message as string | undefined };
      } catch (error: any) {
        return { success: false as const, message: error?.response?.data?.message || "Failed to save assignment" };
      }
    },
    []
  );

  return {
    assignments: sortedAssignments,
    loading,
    subjectOptions,
    subjectOptionsLoading,
    getProgress,
    addAssignment,
  };
}