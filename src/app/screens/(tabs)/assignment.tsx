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
import { scaleSize, moderateScale, verticalScale } from "@/utils/responsive";

const daysLeft = (date: string) => {
  const today = new Date();
  const dueDate = new Date(date);
  return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const countdownColor = (days: number) => {
  if (days <= 1) return "#EF4444";
  if (days <= 5) return "#F97316";
  return "#10B981";
};

export default function AssignmentsScreen() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newDue, setNewDue] = useState<Date | null>(null);
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const { user, loadUser } = useUser();

  useEffect(() => {
    if (!user) loadUser();
  }, [user, loadUser]);

  useEffect(() => {
    const loadSubjectOptions = async () => {
      try {
        const profileClasses = (user?.classes || [])
          .map((item: any) => (typeof item === "string" ? item : item?.name || ""))
          .filter(Boolean);

        const summaryRes = await api.get("/onboarding/summary");
        const summaryClasses = (summaryRes?.data?.data?.classes || [])
          .map((item: any) => item?.name || "")
          .filter(Boolean);

        const previousSubjects = assignments.map((item: any) => item?.subject).filter(Boolean);

        const merged = [...new Set([...profileClasses, ...summaryClasses, ...previousSubjects])];
        setSubjectOptions(merged);
      } catch (error) {
        const fallback = (user?.classes || [])
          .map((item: any) => (typeof item === "string" ? item : item?.name || ""))
          .filter(Boolean);
        setSubjectOptions(fallback);
      }
    };

    loadSubjectOptions();
  }, [user, assignments]);

  useEffect(() => {
    if (showForm && !newSubject && subjectOptions.length > 0) {
      const defaultSubject = user?.classes?.[0]
        ? typeof user.classes[0] === "string"
          ? user.classes[0]
          : user.classes[0]?.name || ""
        : (() => {
          const found = assignments.find((a) => a?.subject)?.subject;
          return typeof found === "string" ? found : found?.name || "";
        })();

      if (defaultSubject) setNewSubject(defaultSubject);
    }
  }, [showForm, subjectOptions, newSubject, user, assignments]);
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const res = await api.get("/assignment/get-assignment");
        if (res.data.success && Array.isArray(res.data.data.assignments)) {
          setAssignments(res.data.data.assignments);
        }
      } catch (error: any) {
        Alert.alert("Error", error?.response?.data?.message || "Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };
    loadAssignments();
  }, []);

  const handleAdd = async () => {
    if (!newTitle.trim() || !newSubject || !newDue) {
      Alert.alert("Missing Fields", "Title, subject, and due date are required.");
      return;
    }

    try {
      const res = await api.post("/assignment/add-assignment", {
        title: newTitle.trim(),
        subject: newSubject,
        due: newDue.toISOString().split("T")[0],
      });

      if (res.data.success) {
        const updated = await api.get("/assignment/get-assignment");
        if (updated.data.success) {
          setAssignments(updated.data.data.assignments || []);
        }
        resetForm();
      } else {
        Alert.alert("Error", res.data.message || "Failed to save assignment");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to save assignment");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setShowSubjectPicker(false);
    setNewTitle("");
    setNewSubject("");
    setNewDue(null);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setNewDue(selectedDate);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={styles.loadingText}>Loading assignments...</Text>
      </View>
    );
  }

  const sorted = [...assignments].sort((a, b) => daysLeft(a.due) - daysLeft(b.due));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FC" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={styles.heading}>Upcoming Assignments</Text>

          {!showForm ? (
            <>
              {sorted.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="clipboard-outline" size={60} color="#CBD5E1" />
                  <Text style={styles.empty}>No assignments found.</Text>
                  <Text style={styles.emptySub}>Add your first assignment below</Text>
                </View>
              ) : (
                sorted.map((item) => {
                  const left = daysLeft(item.due);
                  return (
                    <View key={item.createdAt} style={styles.card}>
                      <Pressable
                        onPress={() => console.log("Card clicked:", item.code)}
                        style={({ pressed }) => [
                          pressed && { opacity: 0.7 }
                        ]}
                      >                      
                      <View style={styles.topRow}>
                          <View>
                            <Text style={styles.subject}>{item.subject.name}</Text>
                            <Text style={styles.title}>{item.title}</Text>
                          </View>
                          <View style={[styles.badge, { backgroundColor: countdownColor(left) }]}>
                            <Text style={styles.badgeText}>{left <= 0 ? "Due!" : `${left} days`}</Text>
                          </View>
                        </View>

                        <View style={styles.infoRow}>
                          <Ionicons name="calendar-outline" size={16} color="#687588" />
                          <Text style={styles.info}>{item.due}</Text>
                        </View>

                        <View style={styles.progressBackground}>
                          <View style={[styles.progressFill, { width: `${item.progress || 0}%` }]} />
                        </View>

                        <Text style={styles.progressText}>Progress {item.progress || 0}%</Text>
                      </Pressable>

                    </View>
                  );
                })
              )}
            </>
          ) : (
            <View style={styles.form}>
              <TextInput
                placeholder="Assignment Title"
                value={newTitle}
                onChangeText={setNewTitle}
                style={styles.input}
              />

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Subject</Text>
                <Pressable
                  style={styles.pickerTrigger}
                  onPress={() => setShowSubjectPicker(!showSubjectPicker)}
                >
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
                          key={option}
                          style={[styles.optionRow, newSubject === option && styles.optionRowActive]}
                          onPress={() => {
                            setNewSubject(option);
                            setShowSubjectPicker(false);
                          }}
                        >
                          <Text style={styles.optionText}>{option}</Text>
                        </Pressable>
                      ))
                    ) : (
                      <Text style={styles.optionText}>No subjects available</Text>
                    )}
                  </View>
                )}
              </View>

              <Pressable style={styles.input} onPress={() => setShowDatePicker(true)}>
                <Text style={{ color: newDue ? COLORS.navy : "#9CA3AF" }}>
                  {newDue ? newDue.toISOString().split("T")[0] : "Select Due Date"}
                </Text>
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  value={newDue || new Date()}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}

              <Pressable style={styles.button} onPress={handleAdd}>
                <Text style={styles.buttonText}>Save Assignment</Text>
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
              <Text style={styles.buttonText}>+ Add Assignment</Text>
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
    padding: scaleSize(20),
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F8FC",
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(16),
    color: COLORS.navySoft,
  },
  heading: {
    fontSize: moderateScale(26),
    fontWeight: "800",
    color: COLORS.navy,
    marginBottom: verticalScale(20),
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: scaleSize(18),
    padding: scaleSize(18),
    marginBottom: verticalScale(18),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(8),
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },
  subject: { fontSize: moderateScale(16), fontWeight: "700", color: COLORS.navy },
  title: { fontSize: moderateScale(14), color: "#7A8599", marginTop: verticalScale(2) },
  badge: {
    paddingHorizontal: scaleSize(14),
    paddingVertical: verticalScale(8),
    borderRadius: scaleSize(20),
  },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: moderateScale(14) },
  infoRow: { flexDirection: "row", alignItems: "center", marginTop: verticalScale(5) },
  info: { color: "#687588", marginLeft: scaleSize(6), fontSize: moderateScale(14) },
  progressBackground: {
    height: verticalScale(10),
    backgroundColor: "#E5E7EB",
    borderRadius: scaleSize(5),
    overflow: "hidden",
    marginTop: verticalScale(18),
  },
  progressFill: { height: verticalScale(10), backgroundColor: COLORS.blue, borderRadius: scaleSize(5) },
  progressText: { marginTop: verticalScale(8), fontWeight: "600", color: COLORS.navy, fontSize: moderateScale(14) },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(80),
  },
  empty: {
    color: COLORS.navySoft,
    fontSize: moderateScale(18),
    fontWeight: "600",
    marginTop: verticalScale(16),
  },
  emptySub: {
    color: "#94A3B8",
    marginTop: verticalScale(8),
    fontSize: moderateScale(14),
  },

  form: {
    backgroundColor: "#fff",
    padding: scaleSize(20),
    borderRadius: scaleSize(16),
    marginTop: verticalScale(10),
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: scaleSize(10),
    padding: scaleSize(14),
    marginBottom: verticalScale(14),
  },
  inputContainer: { marginBottom: verticalScale(16) },
  label: { fontSize: moderateScale(14), fontWeight: "600", color: COLORS.navy, marginBottom: verticalScale(6) },
  pickerTrigger: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: scaleSize(10),
    padding: scaleSize(14),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  pickerText: { color: COLORS.navy, fontSize: moderateScale(16) },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: scaleSize(10),
    marginTop: verticalScale(6),
    backgroundColor: "#fff",
  },
  optionRow: { padding: scaleSize(14), borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  optionRowActive: { backgroundColor: "#E8F1FF" },
  optionText: { color: COLORS.navy, fontSize: moderateScale(16) },

  button: {
    backgroundColor: COLORS.blue,
    borderRadius: scaleSize(14),
    padding: scaleSize(16),
    alignItems: "center",
    marginTop: verticalScale(10),
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: moderateScale(16) },

  bottomButtonContainer: {
    position: "absolute",
    bottom: verticalScale(20),
    left: scaleSize(20),
    right: scaleSize(20),
  },
});