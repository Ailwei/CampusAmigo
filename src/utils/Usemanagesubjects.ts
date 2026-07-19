import api from "@/utils/api";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Alert } from "react-native";

export interface Subject {
  id: string;
  name: string;
  code: string;
  room?: string;
}

export function useManageSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/subjects/get-subjects");
      if (res.data.success) {
        setSubjects(res.data.data.subjects || []);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to load subjects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSubjects();
    }, [loadSubjects])
  );

  const deleteSubject = (subject: Subject) => {
    Alert.alert("Delete Subject", `Delete ${subject.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const previousSubjects = subjects;
          setSubjects((prev) => prev.filter((s) => s.id !== subject.id));
          try {
            await api.delete("/subjects/delete-subject", { data: { id: subject.id } });
          } catch (error: any) {
            setSubjects(previousSubjects);
            Alert.alert("Error", error?.response?.data?.message || "Unable to delete subject.");
          }
        },
      },
    ]);
  };

  return { subjects, loading, loadSubjects, deleteSubject };
}