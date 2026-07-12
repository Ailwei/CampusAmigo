import COLORS from "@/constants/color";
import { useUser } from "@/context/userContext";
import api from "@/utils/api";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
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
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
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
                  const progress = getProgress(exam.subject?.name);

                  console.log("examsprogress", progress)

                  return (
                    <Pressable
                      key={`${exam.code}-${exam.subject?.name}-${exam.date}-${index}`}
                      onPress={() =>
                        router.push({
                          pathname: "/screens/addRevision",
                          params: {
                            subject: exam.subject?.name,
                            examDate: exam.date,

                          },
                        })
                      }
                      style={({ pressed }) => [
                        styles.card,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <View style={styles.topRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.subject}>
                            {exam.subject?.name}
                            {exam.subject?.code ? ` (${exam.subject.code})` : ""}
                          </Text>

                          {!!exam.subject?.room && (
                            <Text style={styles.code}>Room {exam.subject.room}</Text>
                          )}

                          {!!exam.code && (
                            <Text style={styles.code}>{exam.code}</Text>
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
                  minimumDate={new Date()}

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
  subject: { fontSize: moderateScale(18), fontWeight: "700", color: COLORS.navy },
  code: { color: "#7A8599", marginTop: verticalScale(2), fontSize: moderateScale(14) },
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