import COLORS from "@/constants/color";
import api from "@/utils/api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scaleSize, moderateScale, verticalScale } from "@/utils/responsive";

export const DAYS = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];

export interface ClassItem {
  name: string;
  code?: string;
}

interface TimetableSlot {
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

export default function Timetable() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);

  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<ClassItem | null>(null);
  const [day, setDay] = useState<string>("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [justAddedKey, setJustAddedKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleNext = () => {
    if (timetable.length === 0) {
      Alert.alert("Add at least one class before continuing.");
      return;
    }

    router.push("/screens/timetable/summaryTimetable");
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [classesRes, timetableRes] = await Promise.all([
          api.get("/classes/list"),
          api.get("/timetable/view-time-table"),
        ]);

        if (classesRes.data.success) {
          setClasses(classesRes.data.data.classes);
        }
        if (timetableRes.data.success) {
          setTimetable(timetableRes.data.data.timetable);
        }
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
    if (!canAdd) {
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
        const key = `${subject?.name}-${day}-${startTime}`;
        setJustAddedKey(key);
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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <FlatList
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 24 }}
        data={timetable}
        keyExtractor={(_, index) => index.toString()}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Your Weekly Timetable</Text>
            <Text style={styles.subtitle}>Add each class to your weekly schedule.</Text>

            <View style={styles.formCard}>
              <Text style={styles.label}>Subject</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={subject}
                  onValueChange={(value) => setSubject(value)}
                >
                  <Picker.Item label="Select subject" value={null} color={COLORS.navySoft} />
                  {classes.map((item) => (
                    <Picker.Item key={item.name} label={item.name} value={item} />
                  ))}
                </Picker>
              </View>

              {subject?.code ? (
                <View style={styles.codeBox}>
                  <Text style={styles.codeText}>{subject.code}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>Day</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={day} onValueChange={(value) => setDay(value)}>
                  <Picker.Item label="Select day" value="" color={COLORS.navySoft} />
                  {DAYS.map((d) => (
                    <Picker.Item key={d} label={d} value={d} />
                  ))}
                </Picker>
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeCol}>
                  <Text style={styles.label}>Start Time</Text>
                  <Pressable style={styles.timeButton} onPress={() => setShowStartPicker(true)}>
                    <Ionicons name="time-outline" size={18} color={COLORS.navySoft} />
                    <Text style={styles.timeButtonText}>{startTime || "Select"}</Text>
                  </Pressable>
                </View>
                <View style={styles.timeCol}>
                  <Text style={styles.label}>End Time</Text>
                  <Pressable style={styles.timeButton} onPress={() => setShowEndPicker(true)}>
                    <Ionicons name="time-outline" size={18} color={COLORS.navySoft} />
                    <Text style={styles.timeButtonText}>{endTime || "Select"}</Text>
                  </Pressable>
                </View>
              </View>

              {showStartPicker && (
                <DateTimePicker
                  value={toDate(startTime || "08:00")}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleStartChange}
                />
              )}
              {showEndPicker && (
                <DateTimePicker
                  value={toDate(endTime || "09:00")}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleEndChange}
                />
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.addButtonPressed,
                  (!canAdd || saving) && styles.addButtonDisabled,
                ]}
                onPress={addClassSlot}
                disabled={!canAdd || saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    <Text style={styles.addButtonText}>Add Class</Text>
                  </>
                )}
              </Pressable>
            </View>

            <Text style={styles.heading}>Your Timetable</Text>

            {loading && (
              <View style={styles.centerFill}>
                <ActivityIndicator size="small" color={COLORS.blue} />
              </View>
            )}

            {!loading && timetable.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="calendar-blank-outline"
                  size={32}
                  color={COLORS.navySoft}
                />
                <Text style={styles.emptyStateText}>
                  No classes scheduled yet — add one above
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => {
          const key = `${item.subject.name}-${item.day}-${item.startTime}`;
          const isJustAdded = key === justAddedKey;
          return (
            <View style={[styles.card, isJustAdded && styles.cardHighlight]}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="book-open-page-variant" size={20} color={COLORS.blue} />
                <Text style={styles.subject}>
                  {item.subject.name}
                  {item.subject.code ? ` (${item.subject.code})` : ""}
                </Text>
              </View>
              <View style={styles.cardRow}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.navySoft} />
                <Text style={styles.details}>{item.day}</Text>
              </View>
              <View style={styles.cardRow}>
                <Ionicons name="time-outline" size={16} color={COLORS.navySoft} />
                <Text style={styles.details}>{item.startTime} - {item.endTime}</Text>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <Pressable
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.nextButtonPressed,
            ]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward-circle" size={20} color="#fff" />
          </Pressable>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bgTop },
  container: {
    flex: 1,
    paddingHorizontal: scaleSize(24),
    paddingTop: verticalScale(24),
    backgroundColor: COLORS.bgTop,
  },
  title: { fontSize: moderateScale(24), fontWeight: "800", color: COLORS.navy },
  subtitle: {
    marginTop: verticalScale(10),
    marginBottom: verticalScale(20),
    fontSize: moderateScale(14),
    color: COLORS.navySoft,
    textAlign: "center"
  },

  formCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(14),
    padding: scaleSize(16),
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: "#E7ECF4",
  },

  label: {
    fontWeight: "700",
    fontSize: moderateScale(14),
    marginBottom: verticalScale(6),
    marginTop: verticalScale(12),
    color: COLORS.navy,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E2E8F2",
    borderRadius: scaleSize(10),
    backgroundColor: "#F8FAFD",
    marginBottom: verticalScale(4),
  },

  timeRow: {
    flexDirection: "row",
    gap: scaleSize(10),
  },
  timeCol: {
    flex: 1,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F2",
    borderRadius: scaleSize(10),
    padding: scaleSize(12),
    backgroundColor: "#F8FAFD",
    marginBottom: verticalScale(10),
  },
  timeButtonText: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: COLORS.navy,
    marginLeft: scaleSize(8),
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.blue,
    padding: scaleSize(14),
    borderRadius: scaleSize(10),
    justifyContent: "center",
    marginTop: verticalScale(6),
    minHeight: verticalScale(48),
  },
  addButtonPressed: {
    opacity: 0.85,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(15),
    marginLeft: scaleSize(8),
  },

  heading: {
    marginTop: verticalScale(10),
    marginBottom: verticalScale(10),
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: COLORS.navy,
  },

  centerFill: {
    paddingVertical: verticalScale(24),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(28),
    paddingHorizontal: scaleSize(20),
  },
  emptyStateText: {
    marginTop: verticalScale(10),
    color: COLORS.navySoft,
    fontSize: moderateScale(14),
    textAlign: "center",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: scaleSize(12),
    padding: scaleSize(14),
    marginBottom: verticalScale(10),
    borderWidth: 1,
    borderColor: "#E7ECF4",
  },

  cardHighlight: {
    borderColor: COLORS.blue,
    borderWidth: 2,
    backgroundColor: "#F0F8FF",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(6),
  },
  subject: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: COLORS.navy,
    marginLeft: scaleSize(8),
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(4),
  },
  details: {
    marginLeft: scaleSize(6),
    fontSize: moderateScale(14),
    color: COLORS.navySoft,
  },

  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.orange,
    padding: scaleSize(14),
    borderRadius: scaleSize(10),
    justifyContent: "center",
    marginTop: verticalScale(20),
  },
  nextButtonPressed: {
    opacity: 0.85,
  },
  codeBox: {
    borderWidth: 1,
    borderColor: "#E2E8F2",
    borderRadius: scaleSize(10),
    backgroundColor: "#F8FAFD",
    paddingVertical: verticalScale(10),
    paddingHorizontal: scaleSize(14),
    marginBottom: verticalScale(4),
    alignSelf: "flex-start",
  },
  codeText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: COLORS.navy,
  },

  nextButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(16),
    marginRight: scaleSize(8),
  },
});