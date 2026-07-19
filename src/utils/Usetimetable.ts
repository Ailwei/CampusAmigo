import api from "@/utils/api";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

export const DAYS = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];

export interface ClassItem {
  id: string;
  name: string;
  code?: string;
  room?: string;
}

export interface TimetableSlot {
  id: any;
  subject: ClassItem;
  day: string;
  startTime: string;
  endTime: string;
}

const toDate = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h || 8, m || 0, 0, 0);
  return d;
};

const toTimeString = (date: Date) => {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

const isAfter = (a: string, b: string) => {
  if (!a || !b) return true;
  return a > b;
};

const slotKey = (subject: ClassItem, day: string, startTime: string) =>
  `${subject.name}-${day}-${startTime}`;

export function useTimetable() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState<ClassItem | null>(null);
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [justAddedKey, setJustAddedKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadTimetable = async () => {
      try {
        const res = await api.get("/timetable/view-time-table");
        if (res.data.success) setTimetable(res.data.data.timetable);
      } catch (error: any) {
        Alert.alert("Error", error?.response?.data?.message || "Failed to load timetable");
      } finally {
        setLoading(false);
      }
    };
    loadTimetable();
  }, []);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await api.get("/subjects/get-subjects");
        if (res.data.success) setClasses(res.data.data.subjects);
      } catch (error: any) {
        Alert.alert("Error", error?.response?.data?.message || "Failed to load subjects");
      }
    };
    loadSubjects();
  }, []);

  const handleStartChange = (_: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === "ios");
    if (selectedDate) setStartTime(toTimeString(selectedDate));
    if (Platform.OS === "android") setShowStartPicker(false);
  };

  const handleEndChange = (_: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === "ios");
    if (selectedDate) setEndTime(toTimeString(selectedDate));
    if (Platform.OS === "android") setShowEndPicker(false);
  };

  const canAdd = !!subject && !!day && !!startTime && !!endTime;

  const addClassSlot = async () => {
    if (!canAdd || !subject) {
      Alert.alert("Please complete all fields.");
      return;
    }
    if (!isAfter(endTime, startTime)) {
      Alert.alert("Check your times", "End time must be after start time.");
      return;
    }

    setSaving(true);
    try {
      const res = await api.post("/timetable/add-classes", {
        subjectId: subject.id,
        day,
        startTime,
        endTime,
      });
      if (res.data.success) {
        setTimetable(res.data.data.timetable);
        setJustAddedKey(slotKey(subject, day, startTime));
        setTimeout(() => setJustAddedKey(null), 1200);
        setStartTime("");
        setEndTime("");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to add class slot");
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    router.push("/screens/onBoarding/summary");
  };

  return {
    classes,
    timetable,
    loading,
    subject,
    day,
    startTime,
    endTime,
    showStartPicker,
    showEndPicker,
    justAddedKey,
    saving,
    canAdd,
    setSubject,
    setDay,
    setShowStartPicker,
    setShowEndPicker,
    handleStartChange,
    handleEndChange,
    addClassSlot,
    handleNext,
    toDate,
    slotKey,
  };
}