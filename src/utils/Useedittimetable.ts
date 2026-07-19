import api from "@/utils/api";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { TimetableSlot } from "@/app/screens/timetable/timetablegrid";

export const DAYS = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];

const toTimeString = (date: Date) => date.toTimeString().slice(0, 5);

const timeToDate = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

export function useEditTimetable() {
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<TimetableSlot | null>(null);
  const [newDay, setNewDay] = useState(DAYS[0]);
  const [newStart, setNewStart] = useState(new Date());
  const [newEnd, setNewEnd] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadTimetable = useCallback(async () => {
    try {
      const res = await api.get("/timetable/view-time-table");
      if (res.data.success && Array.isArray(res.data.data.timetable)) {
        setTimetable(res.data.data.timetable);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to load timetable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTimetable();
  }, [loadTimetable]);

  const openEditor = (slot: TimetableSlot) => {
    setEditing(slot);
    setNewDay(slot.day);
    setNewStart(timeToDate(slot.startTime));
    setNewEnd(timeToDate(slot.endTime));
  };

  const closeEditor = () => setEditing(null);

  const handleStartChange = (_: any, selected?: Date) => {
    setShowStartPicker(false);
    if (selected) setNewStart(selected);
  };

  const handleEndChange = (_: any, selected?: Date) => {
    setShowEndPicker(false);
    if (selected) setNewEnd(selected);
  };

  const saveSlot = async () => {
    if (!editing) return;

    const startTime = toTimeString(newStart);
    const endTime = toTimeString(newEnd);

    if (startTime >= endTime) {
      Alert.alert("Invalid time", "End time must be after start time");
      return;
    }

    const previousTimetable = timetable;
    const optimisticTimetable = timetable.map((slot) =>
      slot.id === editing.id ? { ...slot, day: newDay, startTime, endTime } : slot
    );
    setTimetable(optimisticTimetable);
    closeEditor();

    setSaving(true);
    try {
      const res = await api.put("/timetable/update-class-slot", {
        id: editing.id,
        day: newDay,
        startTime,
        endTime,
      });

      if (!res.data.success) {
        setTimetable(previousTimetable);
        Alert.alert("Error", res.data.message || "Failed to update class");
      }
    } catch (error: any) {
      setTimetable(previousTimetable);
      Alert.alert("Error", error?.response?.data?.message || "Failed to update class");
    } finally {
      setSaving(false);
    }
  };

  return {
    timetable,
    loading,
    editing,
    newDay,
    newStart,
    newEnd,
    showStartPicker,
    showEndPicker,
    saving,
    setNewDay,
    setShowStartPicker,
    setShowEndPicker,
    handleStartChange,
    handleEndChange,
    openEditor,
    closeEditor,
    saveSlot,
    toTimeString,
  };
}