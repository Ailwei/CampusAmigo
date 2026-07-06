import COLORS from "@/constants/color";
import { useUser } from "@/context/userContext";
import api from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const daysLeft = (date: string) => {
  const today = new Date();
  const examDate = new Date(date);
  const diff = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff < 0 ? 0 : diff;
};

const countdownColor = (days: number) => {
  if (days <= 3) return "#EF4444";
  if (days <= 7) return "#F97316";
  return "#10B981";
};

export default function ExamsScreen() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [newSubject, setNewSubject] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [newVenue, setNewVenue] = useState("");
  const [subjectOptions, setSubjectOptions] = useState<{ name: string; code: string }[]>([]);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const { user, loadUser } = useUser();

  useEffect(() => {
    if (!user) {
      loadUser();
    }
  }, [user, loadUser]);

  useEffect(() => {
    const loadSubjectOptions = async () => {
      try {
        const profileClasses = (user?.classes || [])
          .map((item: any) => {
            if (typeof item === "string") return { name: item, code: "" };
            return { name: item?.name || "", code: item?.code || "" };
          })
          .filter((item: { name: string; code: string }) => item.name);

        const summaryRes = await api.get("/onboarding/summary");
        const summaryClasses = (summaryRes?.data?.data?.classes || [])
          .map((item: any) => ({ name: item?.name || "", code: item?.code || "" }))
          .filter((item: { name: string; code: string }) => item.name);

        const merged = [...new Map([...profileClasses, ...summaryClasses].map((item) => [item.name, item])).values()];
        setSubjectOptions(merged);
      } catch (error) {
        const fallback = (user?.classes || [])
          .map((item: any) => {
            if (typeof item === "string") return { name: item, code: "" };
            return { name: item?.name || "", code: item?.code || "" };
          })
          .filter((item: { name: string; code: string }) => item.name);
        setSubjectOptions(fallback);
      }
    };

    loadSubjectOptions();
  }, [user]);

  useEffect(() => {
    if (!newSubject && subjectOptions.length) {
      const firstOption = subjectOptions[0];
      if (firstOption?.name) {
        setNewSubject(firstOption.name);
        setNewCode(firstOption.code || "");
      }
    }
  }, [subjectOptions, newSubject]);

  useEffect(() => {
    const loadExams = async () => {
      try {
        const res = await api.get("/exam/get-exam");
        if (res.data.success && Array.isArray(res.data.data.exams)) {
          setExams(res.data.data.exams);
        }
      } catch (error: any) {
        Alert.alert("Error", error?.response?.data?.message || "Failed to load exams");
      } finally {
        setLoading(false);
      }
    };
    loadExams();
  }, []);

  const handleAdd = async () => {
    if (!newSubject.trim() || !newDate || !newVenue.trim()) {
      Alert.alert("Please fill all required fields", "Subject, date, and venue are required.");
      return;
    }

    try {
      const payload: Record<string, any> = {
        subject: newSubject.trim(),
        date: newDate.toISOString().split("T")[0],
        venue: newVenue.trim(),
      };

      if (newCode) {
        payload.code = newCode;
      }

      const res = await api.post("/exam/add-exam", payload);

      if (res.data.success) {
        const updated = await api.get("/exam/get-exam");
        if (updated.data.success && Array.isArray(updated.data.data.exams)) {
          setExams(updated.data.data.exams);
        }
        setShowForm(false);
        setShowSubjectPicker(false);
        setNewSubject("");
        setNewCode("");
        setNewDate(null);
        setNewVenue("");
      } else {
        Alert.alert("Error", res.data.message || "Failed to save exam");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to save exam");
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewDate(selectedDate);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Loading exams...</Text>
      </View>
    );
  }

  const sorted = exams.length > 0
    ? [...exams].sort((a, b) => daysLeft(a.date) - daysLeft(b.date))
    : [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Upcoming Exams</Text>

      {!showForm ? (
        <>
          {sorted.length === 0 ? (
            <Text style={styles.empty}>No exams found.</Text>
          ) : (
            sorted.map((exam, index) => {
              const left = daysLeft(exam.date);
              return (
                <View key={`${exam.code || exam.createdAt}-${index}`} style={styles.card}>
                  <View style={styles.topRow}>
                    <View>
                      <Text style={styles.subject}>{exam.subject}</Text>
                      <Text style={styles.code}>{exam.code}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: countdownColor(left) }]}>
                      <Text style={styles.badgeText}>{left} days</Text>
                    </View>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#687588" style={styles.icon} />
                    <Text style={styles.info}>{exam.date}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={16} color="#687588" style={styles.icon} />
                    <Text style={styles.info}>{exam.venue}</Text>
                  </View>
                  <View style={styles.progressBackground}>
                    <View style={[styles.progressFill, { width: `${exam.progress || 0}%` }]} />
                  </View>
                  <Text style={styles.progressText}>Revision {exam.progress || 0}%</Text>
                </View>
              );
            })
          )}
          <Pressable style={styles.button} onPress={() => setShowForm(true)}>
            <Text style={styles.buttonText}>+ Add Exam</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Subject</Text>
            <Pressable
              style={styles.pickerTrigger}
              onPress={() => setShowSubjectPicker((value) => !value)}
            >
              <Text style={styles.pickerText}>{newSubject || "Select a subject"}</Text>
              <Ionicons name={showSubjectPicker ? "chevron-up" : "chevron-down"} size={18} color={COLORS.navySoft} />
            </Pressable>
            {showSubjectPicker && (
              <View style={styles.pickerBox}>
                {subjectOptions.length > 0 ? (
                  subjectOptions.map((option) => (
                    <Pressable
                      key={option.name}
                      style={[styles.optionRow, newSubject === option.name && styles.optionRowActive]}
                      onPress={() => {
                        setNewSubject(option.name);
                        setNewCode(option.code || "");
                        setShowSubjectPicker(false);
                      }}
                    >
                      <Text style={styles.optionText}>{option.name}</Text>
                    </Pressable>
                  ))
                ) : (
                  <Text style={styles.optionText}>No subjects available</Text>
                )}
              </View>
            )}
          </View>
          <TextInput placeholder="Code" value={newCode} editable={false} style={[styles.input, styles.readOnlyField]} />

          {/* Date Picker */}
          <Pressable style={styles.input} onPress={() => setShowDatePicker(true)}>
            <Text>{newDate ? newDate.toISOString().split("T")[0] : "Select Exam Date"}</Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={newDate || new Date()}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}

          <TextInput placeholder="Venue" value={newVenue} onChangeText={setNewVenue} style={styles.input} />

          <Pressable style={styles.button} onPress={handleAdd}>
            <Text style={styles.buttonText}>Save Exam</Text>
          </Pressable>
          <Pressable style={[styles.button, { backgroundColor: "#7A8599" }]} onPress={() => setShowForm(false)}>
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FC", padding: 20 },
  heading: { fontSize: 26, fontWeight: "800", color: COLORS.navy, marginBottom: 20 },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 18, marginBottom: 18, elevation: 3 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  subject: { fontSize: 18, fontWeight: "700", color: COLORS.navy },
  code: { color: "#7A8599", marginTop: 2 },
  badge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  badgeText: { color: "#fff", fontWeight: "700" },
  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  icon: { marginRight: 6 },
  info: { color: "#687588" },
  progressBackground: { height: 10, backgroundColor: "#E5E7EB", borderRadius: 5, overflow: "hidden", marginTop: 18 },
  progressFill: { height: 10, backgroundColor: COLORS.blue, borderRadius: 5 },
  progressText: { marginTop: 8, fontWeight: "600", color: COLORS.navy },
  empty: { color: COLORS.navySoft, fontStyle: "italic" },
  button: { marginTop: 20, backgroundColor: COLORS.blue, borderRadius: 14, padding: 16, alignItems: "center", marginBottom: 10 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  form: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 12 },
  inputContainer: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "600", color: COLORS.navy, marginBottom: 6 },
  pickerTrigger: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  pickerText: { color: COLORS.navy, fontSize: 14 },
  readOnlyField: { backgroundColor: "#F3F4F6" },
  pickerBox: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingVertical: 4, marginTop: 6 },
  optionRow: { paddingHorizontal: 12, paddingVertical: 10 },
  optionRowActive: { backgroundColor: "#E8F1FF" },
  optionText: { color: COLORS.navy, fontSize: 14 },
});
