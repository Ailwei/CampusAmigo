import api from "@/utils/api";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, TextInput } from "react-native";
import { Subject, makeId } from "./Addclasstasks"

export function useAddClasses() {
  const [classes, setClasses] = useState<Subject[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSubject, setNewSubject] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const nameInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await api.get("/timetable/get-classes");
        if (res.data.success) {
          const loaded = (res.data.data.classes ?? []).map((c: any) => ({
            id: c.id ?? makeId(),
            name: c.name,
            code: c.code ?? "",
            room: c.room ?? "",
          }));
          setSubjects(loaded);
        }
      } catch (error: any) {
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  const toggleClass = (subject: Subject) => {
    const exists = classes.find((c) => c.name === subject.name);
    if (exists) {
      setClasses(classes.filter((c) => c.name !== subject.name));
    } else {
      setClasses([...classes, subject]);
    }
  };

  const addSubject = () => {
    const subject = newSubject.trim();
    if (!subject) {
      nameInputRef.current?.focus();
      return;
    }

    const duplicate = subjects.find(
      (item) => item.name.toLowerCase() === subject.toLowerCase()
    );

    if (duplicate) {
      setNewSubject("");
      setNewCode("");
      setNewRoom("");
      setJustAddedId(duplicate.id);
      setTimeout(() => setJustAddedId(null), 1200);
      return;
    }

    const newEntry: Subject = {
      id: makeId(),
      name: subject,
      code: newCode.trim(),
      room: newRoom.trim(),
    };

    setSubjects((prev) => [newEntry, ...prev]);
    setClasses([...classes, newEntry]);
    setNewSubject("");
    setNewCode("");
    setNewRoom("");

    setJustAddedId(newEntry.id);
    setTimeout(() => setJustAddedId(null), 1200);
  };

  const handleNext = async () => {
    try {
      if (classes.length === 0) {
        Alert.alert("Please select at least one class");
        return;
      }

      const res = await api.post("/timetable/add-subjects", { classes });

      if (res.data.success) {
        router.push("/screens/timetable/add-timetable");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to save classes");
    }
  };

  return {
    classes,
    subjects,
    loading,
    newSubject,
    newCode,
    newRoom,
    justAddedId,
    nameInputRef,
    setNewSubject,
    setNewCode,
    setNewRoom,
    toggleClass,
    addSubject,
    handleNext,
  };
}