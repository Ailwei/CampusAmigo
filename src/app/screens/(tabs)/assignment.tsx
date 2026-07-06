import COLORS from "@/constants/color";
import { useUser } from "@/context/userContext";
import api from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

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

  const getDefaultSubject = () => {
    const classOptions = user?.classes || [];
    const firstClass = classOptions[0];
    const fromClasses = typeof firstClass === "string" ? firstClass : firstClass?.name || "";

    if (fromClasses) {
      return fromClasses;
    }

    const lastAssignmentSubject = assignments.find((item: any) => item?.subject)?.subject;
    return lastAssignmentSubject || "";
  };

  useEffect(() => {
    if (!user) {
      loadUser();
    }
  }, [user, loadUser]);

  useEffect(() => {
    const loadSubjectOptions = async () => {
      try {
        const profileClasses = (user?.classes || []).map((item: any) => {
          if (typeof item === "string") return item;
          return item?.name || "";
        }).filter(Boolean);

        const summaryRes = await api.get("/onboarding/summary");
        const summaryClasses = (summaryRes?.data?.data?.classes || [])
          .map((item: any) => item?.name || "")
          .filter(Boolean);

        const previousSubjects = (assignments || [])
          .map((item: any) => item?.subject)
          .filter(Boolean);

        const merged = [...new Set([...profileClasses, ...summaryClasses, ...previousSubjects])];
        setSubjectOptions(merged);
      } catch (error) {
        const fallbackSubjects = (user?.classes || [])
          .map((item: any) => typeof item === "string" ? item : item?.name || "")
          .filter(Boolean);
        setSubjectOptions(fallbackSubjects);
      }
    };

    loadSubjectOptions();
  }, [user, assignments]);

  useEffect(() => {
    if (showForm && !newSubject && subjectOptions.length) {
      const subjectName = getDefaultSubject();
      if (subjectName) {
        setNewSubject(subjectName);
      }
    }
  }, [showForm, subjectOptions, newSubject]);

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
    try {
      const res = await api.post("/assignment/add-assignment", {
        title: newTitle,
        subject: newSubject,
        due: newDue ? newDue.toISOString().split("T")[0] : null,
      });
      if (res.data.success) {
        const updated = await api.get("/assignment/get-assignment");
        if (updated.data.success && Array.isArray(updated.data.data.assignments)) {
          setAssignments(updated.data.data.assignments);
        }
        setShowForm(false);
        setShowSubjectPicker(false);
        setNewTitle("");
        setNewDue(null);
        setNewSubject("");
      } else {
        Alert.alert("Error", res.data.message || "Failed to save assignment");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to save assignment");
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewDue(selectedDate);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Loading assignments...</Text>
      </View>
    );
  }

  const sorted = assignments.length > 0
    ? [...assignments].sort((a, b) => daysLeft(a.due) - daysLeft(b.due))
    : [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Upcoming Assignments</Text>

      {!showForm ? (
        <>
          {sorted.length === 0 ? (
            <Text style={styles.empty}>No assignments found.</Text>
          ) : (
            sorted.map((item) => {
              const left = daysLeft(item.due);
              return (
                <View key={item.createdAt} style={styles.card}>
                  <View style={styles.topRow}>
                    <View>
                      <Text style={styles.subject}>{item.subject}</Text>
                      <Text style={styles.title}>{item.title}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: countdownColor(left) }]}>
                      <Text style={styles.badgeText}>{left <= 0 ? "Due!" : `${left} days`}</Text>
                    </View>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#687588" style={styles.icon} />
                    <Text style={styles.info}>{item.due}</Text>
                  </View>
                  <View style={styles.progressBackground}>
                    <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>Progress {item.progress}%</Text>
                </View>
              );
            })
          )}
          <Pressable style={styles.button} onPress={() => setShowForm(true)}>
            <Text style={styles.buttonText}>+ Add Assignment</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.form}>
          <TextInput placeholder="Title" value={newTitle} onChangeText={setNewTitle} style={styles.input} />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Subject</Text>
            <Pressable
              style={[styles.pickerTrigger, newSubject ? styles.readOnlyField : null]}
              onPress={() => {
                if (!newSubject) {
                  setShowSubjectPicker((value) => !value);
                }
              }}
              disabled={!!newSubject}
            >
              <Text style={styles.pickerText}>{newSubject || "Select a subject"}</Text>
              {!newSubject ? (
                <Ionicons name={showSubjectPicker ? "chevron-up" : "chevron-down"} size={18} color={COLORS.navySoft} />
              ) : null}
            </Pressable>
            {showSubjectPicker && !newSubject && (
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
            <Text>{newDue ? newDue.toISOString().split("T")[0] : "Select Due Date"}</Text>
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
  subject: { fontSize: 16, fontWeight: "700", color: COLORS.navy },
  title: { fontSize: 14, color: "#7A8599", marginTop: 2 },
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
