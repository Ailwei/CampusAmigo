import COLORS from "@/constants/color";
import { useUser } from "@/context/userContext";
import api from "@/utils/api";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
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

import { router, useFocusEffect } from "expo-router";

type RevisionTopic = { name: string; progress: number };
type RevisionItem = { subject: string; topics: RevisionTopic[] };
type SubjectOption = { id: string; name: string; code: string };

const extractId = (item: any): string | undefined =>
  item?._id || item?.id || item?.subjectId || undefined;

const toSubjectOption = (item: any): SubjectOption | null => {
  if (!item || typeof item === "string") return null;
  const id = extractId(item);
  const name = item?.name;
  if (!id || !name) return null;
  return { id: String(id), name: String(name), code: item?.code ? String(item.code) : "" };
};

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

const truncateName = (name?: string, max = 20) => {
  if (!name) return "";
  return name.length > max ? `${name.slice(0, max).trimEnd()}...` : name;
};

export default function ExamsScreen() {
  const [exams, setExams] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [newSubject, setNewSubject] = useState<SubjectOption | null>(null);
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [newVenue, setNewVenue] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);
  const [subjectOptionsLoading, setSubjectOptionsLoading] = useState(true);

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

        const previousSubjects: SubjectOption[] = exams
          .map((item: any) => toSubjectOption(item.subject))
          .filter((s: SubjectOption | null): s is SubjectOption => !!s);

        const merged = [...profileClasses, ...summaryClasses, ...previousSubjects];
        const deduped = Array.from(new Map(merged.map((s) => [s.id, s])).values());

        if (deduped.length === 0) {
          console.warn(
            "[exams.tsx] subjectOptions is empty after mapping. Raw user.subjects:",
            JSON.stringify(user?.subjects),
            "Raw summary subjects:",
            JSON.stringify(summaryRes?.data?.data?.subjects)
          );
        }

        setSubjectOptions(deduped);
      } catch (error) {
        const fallback: SubjectOption[] = (user?.classes || [])
          .map((item: any) =>
            typeof item === "string"
              ? { id: "", name: item, code: "" }
              : toSubjectOption(item)
          )
          .filter((s: SubjectOption | null): s is SubjectOption => !!s && !!s.name);
        setSubjectOptions(fallback);
      } finally {
        setSubjectOptionsLoading(false);
      }
    };

    loadSubjectOptions();
  }, [user, exams]);

  const loadExams = useCallback(async () => {
    try {
      const res = await api.get("/exam/get-exam");
      if (res.data.success && Array.isArray(res.data.data.exams)) {
        setExams(res.data.data.exams);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to load exams");
    }
  }, []);

  const loadRevisions = useCallback(async () => {
    try {
      const res = await api.get("/revision/get-revision");
      if (res.data.success && Array.isArray(res.data.data.revisions)) {
        setRevisions(res.data.data.revisions);
      }
    } catch (error) {
      console.error("Failed to load revisions", error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadExams(), loadRevisions()]);
      setLoading(false);
    };
    init();
  }, [loadExams, loadRevisions]);

  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      loadExams();
      loadRevisions();
    }, [loadExams, loadRevisions])
  );

  const subjectProgress = useMemo(() => {
    const map = new Map<string, number>();
    const bySubject = new Map<string, RevisionTopic[]>();

    revisions.forEach((r) => {
      const key = (r.subject || "").toLowerCase();
      const existing = bySubject.get(key) || [];
      bySubject.set(key, [...existing, ...(r.topics || [])]);
    });

    bySubject.forEach((topics, key) => {
      if (topics.length === 0) {
        map.set(key, 0);
        return;
      }
      const avg = topics.reduce((sum, t) => sum + (t.progress || 0), 0) / topics.length;
      map.set(key, Math.round(avg));
    });

    return map;
  }, [revisions]);

  const getProgress = (subjectName?: string) => {
    if (!subjectName) return 0;
    return subjectProgress.get(subjectName.toLowerCase()) ?? 0;
  };

  const handleAdd = async () => {
    if (!newSubject) {
      Alert.alert("Error", "Please select a subject");
      return;
    }
    if (!newDate) {
      Alert.alert("Error", "Please select an exam date");
      return;
    }
    if (!newVenue.trim()) {
      Alert.alert("Error", "Please enter a venue");
      return;
    }

    try {
      const res = await api.post("/exam/add-exam", {
        subjectId: newSubject.id,
        date: newDate.toISOString().split("T")[0],
        venue: newVenue.trim(),
      });

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
    setNewSubject(null);
    setNewDate(null);
    setNewVenue("");
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "dismissed") return;

    if (selectedDate) {
      setNewDate(selectedDate);
    }
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
                  const subjectName =
                    typeof exam.subject === "string" ? exam.subject : exam.subject?.name;
                  const progress = getProgress(subjectName);

                  return (
                    <Pressable
                      key={exam._id || `${exam.code}-${subjectName}-${exam.date}-${index}`}
                      onPress={() => {
                        const params = {
                          examId: exam.id,
                          subject: subjectName,
                          subjectId: exam.subjectId,
                          examDate: exam.date,
                          venue: exam.venue,
                        };

                        router.push({
                          pathname: "/screens/addRevision",
                          params,
                        });
                      }}
                      style={({ pressed }) => [
                        styles.card,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <View style={styles.topRow}>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <View style={styles.subjectRow}>
                            <Text
                              style={styles.subject}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {truncateName(subjectName)}
                            </Text>
                          </View>

                          {!!exam.subject?.code && (
                            <View style={styles.codeRow}>
                              <Text style={styles.code}>{exam.subject.code}</Text>
                            </View>
                          )}

                          {!!exam.code && (
                            <View style={styles.codeRow}>
                              <Ionicons name="barcode-outline" size={13} color="#7A8599" />
                              <Text style={styles.code}>{exam.code}</Text>
                            </View>
                          )}
                        </View>

                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: countdownColor(left) },
                          ]}
                        >
                          <Text style={styles.badgeText}>
                            {left === 0 ? "Today" : `${left} days`}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons
                          name="calendar-outline"
                          size={16}
                          color="#687588"
                        />
                        <Text style={styles.info}>{exam.date}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons
                          name="location-outline"
                          size={16}
                          color="#687588"
                        />
                        <Text style={styles.info}>
                          {exam.venue || "No venue"}
                        </Text>
                      </View>

                      <View style={styles.progressBackground}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${progress}%` },
                          ]}
                        />
                      </View>

                      <Text style={styles.progressText}>
                        Revision {progress}%
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </>
          ) : (
            <View style={styles.form}>
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

              <TextInput
                placeholder="Code (optional)"
                value={newSubject?.code || ""}
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
                  value={newDate ?? new Date()}
                  mode="date"
                  minimumDate={new Date()}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
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
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scaleSize(6),
    minWidth: 0,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scaleSize(4),
    marginTop: verticalScale(4),
  },
  subject: { fontSize: moderateScale(18), fontWeight: "700", color: COLORS.navy, flexShrink: 1 },
  code: { color: "#7A8599", fontSize: moderateScale(14) },
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
  inputContainer: { marginBottom: verticalScale(16) },
  label: { fontSize: moderateScale(14), fontWeight: "600", color: COLORS.navy, marginBottom: verticalScale(6) },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: scaleSize(10),
    padding: scaleSize(14),
    marginBottom: verticalScale(14),
    backgroundColor: "#fff",
  },
  readOnlyField: { backgroundColor: "#F3F4F6" },
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