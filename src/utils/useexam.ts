import { useUser } from "@/context/userContext";
import api from "@/utils/api";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { RevisionItem, SubjectOption, daysLeft, toSubjectOption } from "./exam";

export function useExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
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

        const previousSubjects: SubjectOption[] = exams
          .map((item: any) => toSubjectOption(item.subject))
          .filter((s: SubjectOption | null): s is SubjectOption => !!s);

        const merged = [...profileClasses, ...summaryClasses, ...previousSubjects];
        const deduped = Array.from(new Map(merged.map((s) => [s.id, s])).values());

        if (deduped.length === 0) {
          console.warn(
            "[useExams] subjectOptions is empty after mapping. Raw user.subjects:",
            JSON.stringify(user?.subjects),
            "Raw summary subjects:",
            JSON.stringify(summaryRes?.data?.data?.subjects)
          );
        }

        setSubjectOptions(deduped);
      } catch (error) {
        const fallback: SubjectOption[] = (user?.classes || [])
          .map((item: any) => (typeof item === "string" ? { id: "", name: item, code: "" } : toSubjectOption(item)))
          .filter((s: SubjectOption | null): s is SubjectOption => !!s && !!s.name);
        setSubjectOptions(fallback);
      } finally {
        setSubjectOptionsLoading(false);
      }
    };

    loadSubjectOptions();
  }, [user, exams]);

  const loadExams = useCallback(async () => {
    try {
      const res = await api.get("/exam/get-exam");
      if (res.data.success && Array.isArray(res.data.data.exams)) {
        setExams(res.data.data.exams);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to load exams");
    }
  }, []);

  const loadRevisions = useCallback(async () => {
    try {
      const res = await api.get("/revision/get-revision");
      if (res.data.success && Array.isArray(res.data.data.revisions)) {
        setRevisions(res.data.data.revisions);
      }
    } catch (error) {
      console.error("Failed to load revisions", error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadExams(), loadRevisions()]);
      setLoading(false);
    };
    init();
  }, [loadExams, loadRevisions]);

  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      loadExams();
      loadRevisions();
    }, [loadExams, loadRevisions])
  );

  const subjectProgress = useMemo(() => {
    const map = new Map<string, number>();
    const bySubject = new Map<string, { name: string; progress: number }[]>();

    revisions.forEach((r) => {
      const key = (r.subject || "").toLowerCase();
      const existing = bySubject.get(key) || [];
      bySubject.set(key, [...existing, ...(r.topics || [])]);
    });

    bySubject.forEach((topics, key) => {
      if (topics.length === 0) {
        map.set(key, 0);
        return;
      }
      const avg = topics.reduce((sum, t) => sum + (t.progress || 0), 0) / topics.length;
      map.set(key, Math.round(avg));
    });

    return map;
  }, [revisions]);

  const getProgress = useCallback(
    (subjectName?: string) => {
      if (!subjectName) return 0;
      return subjectProgress.get(subjectName.toLowerCase()) ?? 0;
    },
    [subjectProgress]
  );

  const sortedExams = useMemo(() => {
    return [...exams].sort((a, b) => daysLeft(a.date) - daysLeft(b.date));
  }, [exams]);

  const addExam = useCallback(
    async (params: { subjectId: string; date: string; venue: string }) => {
      try {
        const res = await api.post("/exam/add-exam", params);
        if (res.data.success) {
          const updated = await api.get("/exam/get-exam");
          if (updated.data.success) {
            setExams(updated.data.data.exams || []);
          }
          return { success: true as const };
        }
        return { success: false as const, message: res.data.message as string | undefined };
      } catch (error: any) {
        return { success: false as const, message: error?.response?.data?.message || "Failed to save exam" };
      }
    },
    []
  );

  return {
    exams: sortedExams,
    loading,
    subjectOptions,
    subjectOptionsLoading,
    getProgress,
    addExam,
  };
}