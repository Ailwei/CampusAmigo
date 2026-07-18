import COLORS from "@/constants/color";
import api from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scaleSize, moderateScale, verticalScale } from "@/utils/responsive";
import { router } from "expo-router";
import TimetableGrid, { TimetableSlot } from "./timetablegrid";

const DAYS = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];

const toTimeString = (date: Date) => date.toTimeString().slice(0, 5);
const timeToDate = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

export default function EditClassScreen() {
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
      slot.id === editing.id
        ? { ...slot, day: newDay, startTime, endTime }
        : slot
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
        // Roll back if the server rejected the update
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

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={styles.loadingText}>Loading timetable...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={COLORS.navy} />
        </Pressable>
        <Text style={styles.title}>Edit Timetable</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.hintBanner}>
        <Ionicons name="create-outline" size={18} color={COLORS.blue} />
        <Text style={styles.hintBannerText}>Tap any class below to change its day or time</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TimetableGrid timetable={timetable} onSlotPress={openEditor} />
      </ScrollView>

      <Modal visible={!!editing} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit {editing?.subject?.name}</Text>
            <Pressable onPress={closeEditor}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Day</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {DAYS.map((day) => (
                <Pressable
                  key={day}
                  style={[styles.dayChip, newDay === day && styles.dayChipActive]}
                  onPress={() => setNewDay(day)}
                >
                  <Text style={[styles.dayChipText, newDay === day && styles.dayChipTextActive]}>
                    {day}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.label}>Start Time</Text>
            <Pressable style={styles.timeInput} onPress={() => setShowStartPicker(true)}>
              <Ionicons name="time-outline" size={18} color={COLORS.blue} />
              <Text style={styles.timeInputText}>{toTimeString(newStart)}</Text>
            </Pressable>
            {showStartPicker && (
              <DateTimePicker
                value={newStart}
                mode="time"
                is24Hour={true}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, selected) => {
                  if (Platform.OS === "android") setShowStartPicker(false);
                  if (selected) setNewStart(selected);
                }}
              />
            )}

            <Text style={styles.label}>End Time</Text>
            <Pressable style={styles.timeInput} onPress={() => setShowEndPicker(true)}>
              <Ionicons name="time-outline" size={18} color={COLORS.blue} />
              <Text style={styles.timeInputText}>{toTimeString(newEnd)}</Text>
            </Pressable>
            {showEndPicker && (
              <DateTimePicker
                value={newEnd}
                mode="time"
                is24Hour={true}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, selected) => {
                  if (Platform.OS === "android") setShowEndPicker(false);
                  if (selected) setNewEnd(selected);
                }}
              />
            )}
          </ScrollView>

          <Pressable style={styles.saveButton} onPress={saveSlot} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
          </Pressable>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7FC" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4F7FC" },
  loadingText: { marginTop: 12, fontSize: moderateScale(16), color: COLORS.navySoft },
  scrollContent: { flexGrow: 1, paddingBottom: verticalScale(1) },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: scaleSize(20) },
  title: { fontSize: moderateScale(20), fontWeight: "800", color: COLORS.navy },

  hintBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: scaleSize(8),
    backgroundColor: `${COLORS.blue}10`,
    marginHorizontal: scaleSize(20),
    marginBottom: verticalScale(10),
    padding: scaleSize(12),
    borderRadius: scaleSize(10),
  },
  hintBannerText: {
    color: COLORS.navy,
    fontSize: moderateScale(13),
    fontWeight: "600",
    flex: 1,
  },

  modalContainer: { flex: 1, backgroundColor: "#F6F8FC" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: scaleSize(20),
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: { fontSize: moderateScale(18), fontWeight: "700", color: COLORS.navy },
  cancelText: { color: "#64748B", fontSize: moderateScale(15) },
  modalContent: { flex: 1, padding: scaleSize(20) },
  label: { fontSize: moderateScale(14), fontWeight: "600", color: COLORS.navy, marginTop: verticalScale(16), marginBottom: verticalScale(8) },

  dayChip: {
    paddingHorizontal: scaleSize(14),
    paddingVertical: verticalScale(8),
    borderRadius: scaleSize(20),
    backgroundColor: "#EEF2FF",
    marginRight: scaleSize(8),
  },
  dayChipActive: { backgroundColor: COLORS.blue },
  dayChipText: { color: COLORS.navy, fontWeight: "600", fontSize: moderateScale(13) },
  dayChipTextActive: { color: "#fff" },

  timeInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: scaleSize(10),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scaleSize(12),
    padding: scaleSize(14),
    backgroundColor: "#fff",
  },
  timeInputText: { fontSize: moderateScale(16), color: COLORS.navy },

  saveButton: {
    backgroundColor: COLORS.blue,
    margin: scaleSize(20),
    padding: scaleSize(18),
    borderRadius: scaleSize(16),
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: moderateScale(16), fontWeight: "700" },
});