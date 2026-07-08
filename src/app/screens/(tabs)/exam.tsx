import COLORS from "@/constants/color";
import { useUser } from "@/context/userContext";
import api from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
    if (!user) loadUser();
  }, [user, loadUser]);

  useEffect(() => {
    const loadSubjectOptions = async () => {
      try {
        const profileClasses = (user?.classes || [])
          .map((item: any) => ({
            name: typeof item === "string" ? item : item?.name || "",
            code: typeof item === "string" ? "" : item?.code || "",
          }))
          .filter((item: any) => item.name);

        const summaryRes = await api.get("/onboarding/summary");
        const summaryClasses = (summaryRes?.data?.data?.classes || [])
          .map((item: any) => ({
            name: item?.name || "",
            code: item?.code || "",
          }))
          .filter((item: any) => item.name);

        const merged = [...new Map([...profileClasses, ...summaryClasses].map((item) => [item.name, item])).values()];
        setSubjectOptions(merged);
      } catch (error) {
        const fallback = (user?.classes || [])
          .map((item: any) => ({
            name: typeof item === "string" ? item : item?.name || "",
            code: "",
          }))
          .filter((item: any) => item.name);
        setSubjectOptions(fallback);
      }
    };

    if (user) loadSubjectOptions();
  }, [user]);

  useEffect(() => {
    if (!newSubject && subjectOptions.length > 0) {
      const first = subjectOptions[0];
      setNewSubject(first.name);
      setNewCode(first.code || "");
    }
  }, [subjectOptions, newSubject]);

  useEffect(() => {
    const loadExams = async () => {
      try {
        const res = await api.get("/exam/get-exam");
        if (res.data.success && Array.isArray(res.data.data.exams)) {
          setExams(res.data.data.exams);
        }
        console.log("exams", res.data.data)

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
      Alert.alert("Missing Fields", "Subject, date, and venue are required.");
      return;
    }

    try {
      const payload = {
        subject: newSubject.trim(),
        date: newDate.toISOString().split("T")[0],
        venue: newVenue.trim(),
        ...(newCode && { code: newCode }),
      };

      const res = await api.post("/exam/add-exam", payload);

      if (res.data.success) {
        const updated = await api.get("/exam/get-exam");
        if (updated.data.success) {
          setExams(updated.data.data.exams || []);
        }
        resetForm();
      } else {
        Alert.alert("Error", res.data.message || "Failed to save exam");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to save exam");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setShowSubjectPicker(false);
    setNewSubject("");
    setNewCode("");
    setNewDate(null);
    setNewVenue("");
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setNewDate(selectedDate);
  };

  const sortedExams = [...exams].sort((a, b) => daysLeft(a.date) - daysLeft(b.date));

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={styles.loadingText}>Loading exams...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FC" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={styles.heading}>Upcoming Exams</Text>

          {!showForm ? (
            <>
              {sortedExams.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="calendar-outline" size={60} color="#CBD5E1" />
                  <Text style={styles.empty}>No exams found.</Text>
                  <Text style={styles.emptySub}>Add your first exam below</Text>
                </View>
              ) : (
                sortedExams.map((exam, index) => {
                  const left = daysLeft(exam.date);
                  return (
                    <Pressable
                      onPress={() => console.log("Card clicked:", exam.code)}
                      style={({ pressed }) => [
                        pressed && { opacity: 0.7 }
                      ]}
                    >
                      <View key={`${exam.code || exam.createdAt}-${index}`} style={styles.card}>

                        <View style={styles.topRow}>
                          <View>
                            <Text style={styles.subject}>
                              {exam.subject?.name} {exam.subject?.code ? `(${exam.subject.code})` : ""}
                              {exam.subject?.room ? ` • Room ${exam.subject.room}` : ""}
                            </Text>
                            {exam.code && <Text style={styles.code}>{exam.code}</Text>}
                          </View>
                          <View style={[styles.badge, { backgroundColor: countdownColor(left) }]}>
                            <Text style={styles.badgeText}>{left} days</Text>
                          </View>
                        </View>

                        <View style={styles.infoRow}>
                          <Ionicons name="calendar-outline" size={16} color="#687588" />
                          <Text style={styles.info}>{exam.date}</Text>
                        </View>

                        <View style={styles.infoRow}>
                          <Ionicons name="location-outline" size={16} color="#687588" />
                          <Text style={styles.info}>{exam.venue}</Text>
                        </View>

                        <View style={styles.progressBackground}>
                          <View style={[styles.progressFill, { width: `${exam.progress || 0}%` }]} />
                        </View>
                        <Text style={styles.progressText}>Revision {exam.progress || 0}%</Text>
                      </View>
                    </Pressable>

                  );
                })
              )}
            </>
          ) : (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Subject</Text>
                <Pressable style={styles.pickerTrigger} onPress={() => setShowSubjectPicker(!showSubjectPicker)}>
                  <Text style={styles.pickerText}>{newSubject || "Select a subject"}</Text>
                  <Ionicons
                    name={showSubjectPicker ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={COLORS.navySoft}
                  />
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

              <TextInput
                placeholder="Code (optional)"
                value={newCode}
                editable={false}
                style={[styles.input, styles.readOnlyField]}
              />

              <Pressable style={styles.input} onPress={() => setShowDatePicker(true)}>
                <Text style={{ color: newDate ? COLORS.navy : "#9CA3AF" }}>
                  {newDate ? newDate.toISOString().split("T")[0] : "Select Exam Date"}
                </Text>
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  value={newDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}

              <TextInput
                placeholder="Venue"
                value={newVenue}
                onChangeText={setNewVenue}
                style={styles.input}
              />

              <Pressable style={styles.button} onPress={handleAdd}>
                <Text style={styles.buttonText}>Save Exam</Text>
              </Pressable>

              <Pressable style={[styles.button, { backgroundColor: "#7A8599" }]} onPress={resetForm}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        {!showForm && (
          <View style={styles.bottomButtonContainer}>
            <Pressable style={styles.button} onPress={() => setShowForm(true)}>
              <Text style={styles.buttonText}>+ Add Exam</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F8FC",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.navySoft,
  },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.navy,
    marginBottom: 20,
    textAlign: "center"
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  subject: { fontSize: 18, fontWeight: "700", color: COLORS.navy },
  code: { color: "#7A8599", marginTop: 2 },
  badge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  badgeText: { color: "#fff", fontWeight: "700" },
  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  info: { color: "#687588", marginLeft: 6 },
  progressBackground: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 18,
  },
  progressFill: { height: 10, backgroundColor: COLORS.blue, borderRadius: 5 },
  progressText: { marginTop: 8, fontWeight: "600", color: COLORS.navy },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  empty: {
    color: COLORS.navySoft,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySub: {
    color: "#94A3B8",
    marginTop: 8,
  },

  form: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginTop: 10,
  },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: COLORS.navy, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    backgroundColor: "#fff",
  },
  readOnlyField: { backgroundColor: "#F3F4F6" },
  pickerTrigger: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  pickerText: { color: COLORS.navy, fontSize: 16 },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginTop: 6,
    backgroundColor: "#fff",
  },
  optionRow: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  optionRowActive: { backgroundColor: "#E8F1FF" },
  optionText: { color: COLORS.navy, fontSize: 16 },

  button: {
    backgroundColor: COLORS.blue,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  bottomButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
});