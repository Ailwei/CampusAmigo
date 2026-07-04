import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import COLORS from "@/constants/color";
import { useOnboarding } from "@/app/context/onboardingContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import api from "@/utils/api";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

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

  const [subject, setSubject] = useState(classes[0] || "");
  const [day, setDay] = useState("Monday");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

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
    if (!subject || !startTime || !endTime) {
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
              console.log(res.data)

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
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Weekly Timetable</Text>
      <Text style={styles.subtitle}>Add each class to your weekly schedule.</Text>

      <Text style={styles.label}>Subject</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={subject} onValueChange={(value) => setSubject(value)}>
          {classes.map((item) => (
            <Picker.Item key={item} label={item} value={item} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Day</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={day} onValueChange={(value) => setDay(value)}>
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
      <FlatList
        data={timetable}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="book-open-page-variant" size={20} color={COLORS.blue} />
              <Text style={styles.subject}>{item.subject}</Text>
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
      />

      <Pressable
        style={styles.nextButton}
        onPress={() => router.push("/screens/onBoarding/summary")}
      >
        <Ionicons name="arrow-forward-circle" size={22} color="#fff" />
        <Text style={styles.nextButtonText}>Next</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: COLORS.bgTop },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.navy },
  subtitle: { marginTop: 10, marginBottom: 20, color: COLORS.navySoft },

  label: { fontWeight: "700", marginBottom: 6, marginTop: 12, color: COLORS.navy },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.navySoft,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
  },

  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.navySoft,
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  timeButtonText: { fontSize: 16, fontWeight: "600", color: COLORS.navy, marginLeft: 8 },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.blue,
    padding: 14,
    borderRadius: 10,
    justifyContent: "center",
    marginTop: 10,
  },
  addButtonText: { color: "#fff", fontWeight: "700", marginLeft: 8 },

  heading: { marginTop: 25, marginBottom: 10, fontSize: 18, fontWeight: "700", color: COLORS.navy },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  subject: { fontSize: 16, fontWeight: "700", color: COLORS.navy, marginLeft: 8 },
  cardRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  details: { marginLeft: 6, color: COLORS.navySoft },

  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.orange,
    padding: 14,
    borderRadius: 10,
    justifyContent: "center",
    marginTop: 20,
  },
  nextButtonText: { color: "#fff", fontWeight: "700", fontSize: 16, marginLeft: 8 },
});
