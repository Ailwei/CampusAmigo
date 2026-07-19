import api from "@/utils/api";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

export const DAYS = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];

export interface ClassItem {
  name: string;
  code?: string;
}

export interface TimetableSlot {
  subject: ClassItem;
  day: string;
  startTime: string;
  endTime: string;
}

export const toDate = (time: string) => {
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

const slotKey = (subjectName: string, day: string, startTime: string) => `${subjectName}-${day}-${startTime}`;

export function useWeeklyTimetable() {
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
    const loadData = async () => {
      try {
        const [classesRes, timetableRes] = await Promise.all([
          api.get("/classes/list"),
          api.get("/timetable/view-time-table"),
        ]);

        if (classesRes.data.success) setClasses(classesRes.data.data.classes);
        if (timetableRes.data.success) setTimetable(timetableRes.data.data.timetable);
      } catch (error: any) {
        Alert.alert("Error", error?.response?.data?.message || "Failed to load timetable");
      } finally {
        setLoading(false);
      }
    };
    loadData();
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
        subject,
        day,
        startTime,
        endTime,
      });
      if (res.data.success) {
        setTimetable(res.data.data.timetable);
        setJustAddedKey(slotKey(subject.name, day, startTime));
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
    if (timetable.length === 0) {
      Alert.alert("Add at least one class before continuing.");
      return;
    }
    router.push("/screens/timetable/summaryTimetable");
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
  };
}