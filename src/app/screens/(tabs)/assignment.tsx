import COLORS from "@/constants/color";
import { useUser } from "@/context/userContext";
import api from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { router, useFocusEffect } from "expo-router";

type AssignmentTopic = { name: string; progress: number };
type TaskItem = { assignmentId: string; subject: string; topics: AssignmentTopic[] };
type SubjectOption = { id: string; name: string };


const extractId = (item: any): string | undefined =>
  item?._id || item?.id || item?.subjectId || undefined;

const toSubjectOption = (item: any): SubjectOption | null => {
  if (!item || typeof item === "string") return null;
  const id = extractId(item);
  const name = item?.name;
  if (!id || !name) return null;
  return { id: String(id), name: String(name) };
};

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
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  const [newTitle, setNewTitle] = useState("");
  const [newDue, setNewDue] = useState<Date | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);
  const [subjectOptionsLoading, setSubjectOptionsLoading] = useState(true);
  const [newSubject, setNewSubject] = useState<SubjectOption | null>(null);

  const { user, loadUser } = useUser();

  useEffect(() => {
    if (!user) loadUser();
  }, [user, loadUser]);

  useEffect(() => {
    const loadSubjectOptions = async () => {
      setSubjectOptionsLoading(true);
      try {
        const profileClasses: SubjectOption[] = (user?.subjects || [])
          .map(toSubjectOption)
          .filter((s: SubjectOption | null): s is SubjectOption => !!s);

        const summaryRes = await api.get("/onboarding/summary");
        const summaryClasses: SubjectOption[] = (summaryRes?.data?.data?.subjects || [])
          .map(toSubjectOption)
          .filter((s: SubjectOption | null): s is SubjectOption => !!s);

        const previousSubjects: SubjectOption[] = assignments
          .map((item: any) => toSubjectOption(item.subject))
          .filter((s: SubjectOption | null): s is SubjectOption => !!s);

        const merged = [...profileClasses, ...summaryClasses, ...previousSubjects];
        const deduped = Array.from(new Map(merged.map((s) => [s.id, s])).values());

        if (deduped.length === 0) {
          console.warn(
            "[assignment.tsx] subjectOptions is empty after mapping. Raw user.subjects:",
            JSON.stringify(user?.subjects),
            "Raw summary subjects:",
            JSON.stringify(summaryRes?.data?.data?.subjects)
          );
        }

        setSubjectOptions(deduped);
      } catch (error) {
        const fallback: SubjectOption[] = (user?.classes || [])
          .map(toSubjectOption)
          .filter((s: SubjectOption | null): s is SubjectOption => !!s);
        setSubjectOptions(fallback);
      } finally {
        setSubjectOptionsLoading(false);
      }
    };

    loadSubjectOptions();
  }, [user, assignments]);

  const loadAssignments = useCallback(async () => {
    try {
      const res = await api.get("/assignment/get-assignment");
      if (res.data.success) {
        setAssignments(res.data.data.assignments);
      }
      

    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to load assignments");
    }
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const res = await api.get("/assignment/get-tasks");

      if (res.data.success && Array.isArray(res.data.data.assignmentTasks)) {
        setTasks(res.data.data.assignmentTasks);
      }
    } catch (error) {
      console.error("Failed to load tasks", error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadAssignments(), loadTasks()]);
      setLoading(false);
    };
    init();
  }, [loadAssignments, loadTasks]);

  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      loadAssignments();
      loadTasks();
    }, [loadAssignments, loadTasks])
  );

 const assignmentProgress = useMemo(() => {
  const map = new Map<string, number>();
  const byAssignment = new Map<string, AssignmentTopic[]>();

  tasks.forEach((r) => {
    const key = r.assignmentId;
    if (!key) return;
    const existing = byAssignment.get(key) || [];
    byAssignment.set(key, [...existing, ...(r.topics || [])]);
  });

  byAssignment.forEach((topics, key) => {
    if (topics.length === 0) {
      map.set(key, 0);
      return;
    }
    const avg = topics.reduce((sum, t) => sum + (t.progress || 0), 0) / topics.length;
    map.set(key, Math.round(avg));
  });

  return map;
}, [tasks]);

const getProgress = (assignmentId?: string) => {
  if (!assignmentId) return 0;
  return assignmentProgress.get(assignmentId) ?? 0;
};

  const handleAdd = async () => {
    if (!newSubject) {
      Alert.alert("Error", "Please select a subject");
      return;
    }
    if (!newTitle.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }
    if (!newDue) {
      Alert.alert("Error", "Please select a due date");
      return;
    }

    try {
      const res = await api.post("/assignment/add-assignment", {
        title: newTitle.trim(),
        subjectId: newSubject.id,
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
    setNewSubject(null);
    setNewDue(null);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "dismissed") return;

    if (selectedDate) {
      setNewDue(selectedDate);
    }
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
                sorted.map((assignment, index) => {
                  const left = daysLeft(assignment.due);
                  const subjectName =
                    typeof assignment.subject === "string"
                      ? assignment.subject
                      : assignment.subject?.name;

                  const progress = getProgress(assignment.id);

                  return (
                    <View key={assignment._id || assignment.createdAt || index} style={styles.card}>
                      <Pressable
                        onPress={() => {
                          const navParams = {
                            assignmentId: assignment.id || assignment.createdAt,
                            title: assignment.title,
                            subject:
                              typeof assignment.subject === "string"
                                ? assignment.subject
                                : assignment.subject?.name || "",
                            subjectId:
                              typeof assignment.subject === "string"
                                ? ""
                                : assignment.subject?._id ||
                                  assignment.subject?.id ||
                                  "",
                            due: assignment.due,
                            progress: String(assignment.progress || 0),
                          };
                          router.push({
                            pathname: "/screens/AddAsignmentTasks",
                            params: navParams,
                          });
                        }}
                        style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                      >
                        <View style={styles.topRow}>
                          <View>
                            <Text style={styles.subject}>
                              {typeof assignment.subject === "string"
                                ? assignment.subject
                                : assignment.subject?.name}
                            </Text>
                            <Text style={styles.title}>{assignment.title}</Text>
                          </View>
                          <View style={[styles.badge, { backgroundColor: countdownColor(left) }]}>
                            <Text style={styles.badgeText}>{left <= 0 ? "Due!" : `${left} days`}</Text>
                          </View>
                        </View>

                        <View style={styles.infoRow}>
                          <Ionicons name="calendar-outline" size={16} color="#687588" />
                          <Text style={styles.info}>{assignment.due}</Text>
                        </View>

                        <View style={styles.progressBackground}>
                          <View style={[styles.progressFill, { width: `${progress}%` }]} />
                        </View>

                        <Text style={styles.progressText}>Revision {progress}%</Text>
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
                  <Text style={styles.pickerText}>
                    {newSubject?.name || "Select a subject"}
                  </Text>
                  <Ionicons
                    name={showSubjectPicker ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={COLORS.navySoft}
                  />
                </Pressable>

                {showSubjectPicker && (
                  <View style={styles.pickerBox}>
                    {subjectOptionsLoading ? (
                      <View style={{ padding: scaleSize(14) }}>
                        <ActivityIndicator size="small" color={COLORS.blue} />
                      </View>
                    ) : subjectOptions.length > 0 ? (
                      subjectOptions.map((option) => (
                        <Pressable
                          key={option.id}
                          style={[
                            styles.optionRow,
                            newSubject?.id === option.id && styles.optionRowActive,
                          ]}
                          onPress={() => {
                            setNewSubject(option);
                            setShowSubjectPicker(false);
                          }}
                        >
                          <Text style={styles.optionText}>{option.name}</Text>
                        </Pressable>
                      ))
                    ) : (
                      <Text style={[styles.optionText, { padding: scaleSize(14) }]}>
                        No subjects available
                      </Text>
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
                  value={newDue ?? new Date()}
                  mode="date"
                  minimumDate={new Date()}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
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
    textAlign: "center",
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
  progressText: {
    marginTop: verticalScale(8),
    fontWeight: "600",
    color: COLORS.navy,
    fontSize: moderateScale(14),
  },

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
  label: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: COLORS.navy,
    marginBottom: verticalScale(6),
  },
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