import COLORS from "@/constants/color";
import { ClassItem, useOnboarding } from "@/context/onboardingContext";
import api from "@/utils/api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
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

export default function Timetable() {
  const { classes, timetable, setTimetable } = useOnboarding();

  const [subject, setSubject] = useState<ClassItem | null>(null);
  const [day, setDay] = useState<string>("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleNext = () => {
    const missingSubjects = classes.filter(
      (cls) =>
        !timetable.some(
          (slot) =>
            slot.subject.name === cls.name &&
            slot.subject.code === cls.code
        )
    );

    if (missingSubjects.length > 0) {
      Alert.alert(
        "Incomplete Timetable",
        `Please add these subjects to your timetable before continuing:\n\n${missingSubjects
          .map((subject) => `• ${subject.name}`)
          .join("\n")}`
      );
      return;
    }

    router.push("/screens/onBoarding/summary");
  };

  useEffect(() => {
    const loadTimetable = async () => {
      try {
        const res = await api.get("/onboarding/view-time-table");
        if (res.data.success) {
          setTimetable(res.data.data.timetable);
        }
      } catch (error: any) {
        Alert.alert("Error", error?.response?.data?.message || "Failed to load timetable");
      }
    };
    loadTimetable();
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

  const addClassSlot = async () => {
    if (!subject || !day || !startTime || !endTime) {
      Alert.alert("Please complete all fields.");
      return;
    }
    try {
      const res = await api.post("/onboarding/add-time-table", {
        subject,
        day,
        startTime,
        endTime,
      });
      if (res.data.success) {
        console.log(res.data);

        setTimetable(res.data.data.timetable);
        setStartTime("");
        setEndTime("");
        Alert.alert("Success", "Class slot added");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to add class slot");
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
            <Text style={styles.title}>Create Your Weekly Timetable</Text>
            <Text style={styles.subtitle}>Add each class to your weekly schedule.</Text>

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
            <Text style={styles.label}>Code</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{subject?.code || "N/A"}</Text>
            </View>

            <Text style={styles.label}>Day</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={day} onValueChange={(value) => setDay(value)}>
                <Picker.Item label="Select day" value="" color={COLORS.navySoft} />
                {DAYS.map((d) => (
                  <Picker.Item key={d} label={d} value={d} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Start Time</Text>
            <Pressable style={styles.timeButton} onPress={() => setShowStartPicker(true)}>
              <Ionicons name="time-outline" size={18} color={COLORS.navySoft} />
              <Text style={styles.timeButtonText}>{startTime || "Select start time"}</Text>
            </Pressable>
            {showStartPicker && (
              <DateTimePicker
                value={toDate(startTime || "08:00")}
                mode="time"
                is24Hour={true}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleStartChange}
              />
            )}

            <Text style={styles.label}>End Time</Text>
            <Pressable style={styles.timeButton} onPress={() => setShowEndPicker(true)}>
              <Ionicons name="time-outline" size={18} color={COLORS.navySoft} />
              <Text style={styles.timeButtonText}>{endTime || "Select end time"}</Text>
            </Pressable>
            {showEndPicker && (
              <DateTimePicker
                value={toDate(endTime || "09:00")}
                mode="time"
                is24Hour={true}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleEndChange}
              />
            )}

            <Pressable style={styles.addButton} onPress={addClassSlot}>
              <Ionicons name="add-circle-outline" size={22} color="#fff" />
              <Text style={styles.addButtonText}>Add Class</Text>
            </Pressable>

            <Text style={styles.heading}>Your Timetable</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="book-open-page-variant" size={20} color={COLORS.blue} />
              <Text style={styles.subject}>{item.subject.name}({item.subject.code})</Text>
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
        )}
        ListFooterComponent={
          <Pressable style={styles.nextButton} onPress={handleNext}>
            <Ionicons name="arrow-forward-circle" size={22} color="#fff" />
            <Text style={styles.nextButtonText}>Next</Text>
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
    borderColor: COLORS.navySoft,
    borderRadius: scaleSize(10),
    backgroundColor: "#fff",
    marginBottom: verticalScale(10),
  },

  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.navySoft,
    borderRadius: scaleSize(10),
    padding: scaleSize(12),
    backgroundColor: "#fff",
    marginBottom: verticalScale(10),
  },
  timeButtonText: {
    fontSize: moderateScale(16),
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
    marginTop: verticalScale(10),
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(15),
    marginLeft: scaleSize(8),
  },

  heading: {
    marginTop: verticalScale(25),
    marginBottom: verticalScale(10),
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: COLORS.navy,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: scaleSize(12),
    padding: scaleSize(14),
    marginBottom: verticalScale(10),
    elevation: 2,
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
  codeBox: {
    borderWidth: 1,
    borderColor: COLORS.navySoft,
    borderRadius: scaleSize(10),
    backgroundColor: "#F9FAFB",
    paddingVertical: verticalScale(12),
    paddingHorizontal: scaleSize(14),
    marginBottom: verticalScale(10),
  },
  codeText: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: COLORS.navy,
  },

  nextButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(16),
    marginLeft: scaleSize(8),
  },
});