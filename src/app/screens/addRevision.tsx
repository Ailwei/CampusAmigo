import COLORS from "@/constants/color";
import { useUser } from "@/context/userContext";
import api from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scaleSize, moderateScale, verticalScale } from "@/utils/responsive";
import { useLocalSearchParams, useRouter } from "expo-router";
import Slider from "@react-native-community/slider";

type RawTopic = string | { name: string; progress?: number };

type Topic = {
  name: string;
  progress: number;
};

type RawRevisionItem = {
  _id?: string;
  createdAt: number;
  subjectId: string,
  date: string;
  subject: string;
  topics: Topic[];
};

type TopicTask = {
  key: string;
  revisionId: string | undefined;
  createdAt: number;
  subject: string;
  subjectId: string,
  date: string;
  topicIndex: number;
  topicName: string;
  progress: number;
};

type RevisionGroup = {
  key: string;
  revisionId: string | undefined;
  subjectId: string,
  createdAt: number;
  subject: string;
  date: string;
  topics: TopicTask[];
};

const toDateString = (date: Date) => date.toISOString().split("T")[0];

const daysUntil = (date: string) => {
  const today = new Date();
  const target = new Date(date);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const dueColor = (days: number) => {
  if (days <= 1) return "#EF4444";
  if (days <= 5) return "#F97316";
  return "#10B981";
};

const dueBannerColors = (days: number) => {
  if (days <= 1) return { bg: "#FEE2E2", text: "#B91C1C" };
  if (days <= 5) return { bg: "#FFEDD5", text: "#C2410C" };
  return { bg: "#DCFCE7", text: "#15803D" };
};

const getTopicName = (topic: RawTopic): string =>
  typeof topic === "string" ? topic : topic?.name ?? "";

const flattenToTasks = (items: RawRevisionItem[]): TopicTask[] => {
  const tasks: TopicTask[] = [];

  items.forEach((revision) => {
    const groupKey = (revision._id ?? revision.createdAt).toString();
    revision.topics.forEach((topic, index) => {
      tasks.push({
        key: `${groupKey}-${index}`,
        revisionId: revision._id,
        createdAt: revision.createdAt,
        subjectId: revision.subjectId,
        subject: revision.subject,
        date: revision.date,
        topicIndex: index,
        topicName: getTopicName(topic),
        progress: topic.progress ?? 0,
      });
    });
  });

  return tasks.sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
};

const groupTasks = (tasks: TopicTask[]): RevisionGroup[] => {
  const groups = new Map<string, RevisionGroup>();
  tasks.forEach((task) => {
    const groupKey = (task.revisionId ?? task.createdAt)?.toString();
    const existing = groups.get(groupKey);
    if (existing) {
      existing.topics.push(task);
    } else {
      groups.set(groupKey, {
        key: groupKey,
        revisionId: task.revisionId,
        createdAt: task.createdAt,
        subjectId: task.subjectId,
        subject: task.subject,
        date: task.date,
        topics: [task],
      });
    }
  });
  return Array.from(groups.values()).sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
};

export default function RevisionScreen() {
  const { user, loadUser } = useUser();
  const { examDate, subjectId, subject: examSubject } = useLocalSearchParams();
  const router = useRouter();


  const examSubjectStr = typeof examSubject === "string" ? examSubject : "";

  const [revisions, setRevisions] = useState<RawRevisionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [topics, setTopics] = useState<{ name: string; progress: number }[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const examDay =
    typeof examDate === "string"
      ? new Date(examDate)
      : new Date();

  const [date, setDate] = useState<Date>(examDay);

  const examDateStr = typeof examDate === "string" ? examDate : null;
  const daysToExam = examDateStr ? daysUntil(examDateStr) : null;

  useEffect(() => {
    if (!user) loadUser();
  }, [user, loadUser]);

  useEffect(() => {
    if (examSubjectStr) {
      setSubject(examSubjectStr);
    }
  }, [examSubjectStr]);

  useEffect(() => {
    if (typeof examDate === "string") {
      setDate(new Date(examDate));
    }
  }, [examDate]);

  useEffect(() => {
    const loadRevisions = async () => {
      try {
        const res = await api.get("/revision/get-revision");
        if (res.data.success && Array.isArray(res.data.data.revisions)) {
          setRevisions(res.data.data.revisions);
        }
      } catch (error: any) {
        Alert.alert("Error", error?.response?.data?.message || "Failed to load revisions");
      } finally {
        setLoading(false);
      }
    };
    loadRevisions();
  }, []);

  const resetForm = () => {
    setTopicInput("");
    setTopics([]);
    setDate(
      typeof examDate === "string"
        ? new Date(examDate)
        : new Date()
    );

    setSubject("");
  };

  const addTopic = () => {
    const value = topicInput.trim();
    if (!value || topics.some((t) => t.name === value)) return;
    setTopics((prev) => [...prev, { name: value, progress: 0 }]);
    setTopicInput("");
  };

  const removeTopic = (name: string) => {
    setTopics((prev) => prev.filter((t) => t.name !== name));
  };

  const handleAddRevision = async () => {
    if (!subject || topics.length === 0) {
      Alert.alert("Missing Fields", "Subject and at least one topic are required.");
      return;
    }

    try {
      const res = await api.post("/revision/add-revision", {
        subjectId,
        topics,
        date: toDateString(date),
      });

      if (res.data.success) {
        const updated = await api.get("/revision/get-revision");
        setRevisions(updated.data.data.revisions || []);
        setShowAddModal(false);
        resetForm();
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to save revision");
    }
  };

  const setTopicProgressLocal = (
    revisionId: string | undefined,
    createdAt: number,
    topicIndex: number,
    newProgress: number
  ) => {
    const clamped = Math.min(100, Math.max(0, newProgress));
    const matchGroupKey = (revisionId ?? createdAt)?.toString();

    setRevisions((prev) =>
      prev.map((item) => {
        const groupKey = (item._id ?? item.createdAt)?.toString();
        if (groupKey !== matchGroupKey) return item;

        return {
          ...item,
          topics: item.topics.map((t, idx) =>
            idx === topicIndex ? { ...t, progress: clamped } : t
          ),
        };
      })
    );
  };

  const updateTopicProgress = async (
    revisionId: string | undefined,
    createdAt: number,
    topicIndex: number,
    subject: string,
    topicName: string,
    newProgress: number
  ) => {
    const clamped = Math.min(100, Math.max(0, newProgress));

    setTopicProgressLocal(revisionId, createdAt, topicIndex, clamped);

    try {
      const res = await api.patch("/revision/update-progress", {
        subjectId,
        topic: topicName,
        progress: clamped,
      });

      if (res.data.success && Array.isArray(res.data.data.revisions)) {
        setRevisions(res.data.data.revisions);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to update progress");
    }
  };

  const filteredRevisions = useMemo(() => {
    const result =
      typeof subjectId === "string"
        ? revisions.filter((r) => r.subjectId === subjectId)
        : revisions;

    return groupTasks(flattenToTasks(result));
  }, [revisions, subjectId]);

  const examProgress = useMemo(() => {
    if (typeof subjectId !== "string") return null;
    const subjectRevisions = revisions.filter(
      (r) => r.subjectId === subjectId
    );
    const allTopics = subjectRevisions.flatMap((r) => r.topics);
    return { done: allTopics.filter((t) => t.progress >= 100).length, total: allTopics.length };
  }, [revisions, subjectId]);


  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={styles.loadingText}>Loading ...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Pressable style={styles.backRow} onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={COLORS.navy} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.breadcrumb}>{typeof subjectId === "string" ? "Exams Tasks" : "Home"}</Text>
              <Text style={styles.title}>
                {typeof subjectId === "string" ? (examSubjectStr || subjectId) : "Revisions"}
              </Text>
            </View>
          </Pressable>

          {examDateStr && daysToExam !== null && examProgress && (
            <View
              style={[
                styles.examBanner,
                { backgroundColor: dueBannerColors(daysToExam).bg },
              ]}
            >
              <Text style={[styles.examBannerText, { color: dueBannerColors(daysToExam).text }]}>
                {daysToExam <= 0 ? "Exam is today" : `Exam in ${daysToExam}d`}
              </Text>
              <Text style={[styles.examBannerText, { color: dueBannerColors(daysToExam).text }]}>
                {examProgress.done}/{examProgress.total} done
              </Text>
            </View>
          )}
        </View>

        <FlatList
          data={filteredRevisions}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={80} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No revisions found</Text>
              <Text style={styles.emptySubtitle}>Tap the + button below</Text>
            </View>
          }
          renderItem={({ item: group }) => {
            const left = daysUntil(group.date);
            const doneCount = group.topics.filter((t) => t.progress >= 100).length;

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.subjectTitle}>{group.subject}</Text>
                  <View style={[styles.badge, { backgroundColor: dueColor(left) }]}>
                    <Text style={styles.badgeText}>{left <= 0 ? "Due!" : `${left}d`}</Text>
                  </View>
                </View>

                <Text style={styles.dateText}>
                  Revision: {group.date} • {doneCount}/{group.topics.length} completed
                </Text>

                {examDateStr && (
                  <View style={styles.statusRow}>
                    <Ionicons
                      name={left <= daysToExam! ? "checkmark-circle" : "warning"}
                      size={16}
                      color={left <= daysToExam! ? "#10B981" : "#EF4444"}
                    />
                    <Text
                      style={{
                        marginLeft: 6,
                        color: left <= daysToExam! ? "#10B981" : "#EF4444",
                        fontSize: moderateScale(13),
                        fontWeight: "600",
                      }}
                    >
                      {left <= daysToExam!
                        ? "On track for exam"
                        : "revisions after exam"}
                    </Text>
                  </View>
                )}

                {group.topics.map((topic) => (
                  <View key={topic.key} style={styles.topicRow}>
                    <Pressable
                      style={styles.checkbox}
                      onPress={() => updateTopicProgress(topic.revisionId, topic.createdAt, topic.topicIndex, topic.subject, topic.topicName, topic.progress >= 100 ? 0 : 100)}
                    >
                      <Ionicons
                        name={topic.progress >= 100 ? "checkmark-circle" : "ellipse-outline"}
                        size={26}
                        color={topic.progress >= 100 ? "#10B981" : "#CBD5E1"}
                      />
                    </Pressable>

                    <Text style={[styles.topicName, topic.progress >= 100 && styles.strikethrough]}>
                      {topic.topicName}
                    </Text>

                    <View style={styles.progressContainer}>
                      <Slider
                        style={{ flex: 1, marginHorizontal: 12 }}
                        minimumValue={0}
                        maximumValue={100}
                        step={5}
                        value={topic.progress}
                        onValueChange={(val) => setTopicProgressLocal(topic.revisionId, topic.createdAt, topic.topicIndex, val)}
                        onSlidingComplete={(val) => updateTopicProgress(topic.revisionId, topic.createdAt, topic.topicIndex, topic.subject, topic.topicName, val)}
                        minimumTrackTintColor={COLORS.blue}
                        maximumTrackTintColor="#E5E7EB"
                        thumbTintColor={COLORS.blue}
                      />
                      <Text style={styles.progressText}>{Math.round(topic.progress)}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            );
          }}
        />

        <Pressable style={styles.fab} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={30} color="#fff" />
        </Pressable>

        <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Revision</Text>
              <Pressable onPress={() => { setShowAddModal(false); resetForm(); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
              <Text style={styles.label}>Subject</Text>
              {typeof subjectId === "string" ? (
                <Text style={styles.fixedSubject}>{examSubjectStr || subjectId}</Text>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="Enter subject name"
                  value={subject}
                  onChangeText={setSubject}
                />
              )}

              <Text style={styles.label}>Topics</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Type a topic"
                  value={topicInput}
                  onChangeText={setTopicInput}
                  onSubmitEditing={addTopic}
                />
                <Pressable style={styles.addTopicBtn} onPress={addTopic}>
                  <Text style={styles.addTopicBtnText}>Add</Text>
                </Pressable>
              </View>

              <View style={styles.chipsContainer}>
                {topics.map((t, i) => (
                  <View key={i} style={styles.chip}>
                    <Text style={styles.chipText}>{t.name}</Text>
                    <Pressable onPress={() => removeTopic(t.name)} hitSlop={8}>
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    </Pressable>
                  </View>
                ))}
              </View>

              <Text style={styles.label}>Exam Date</Text>

              <View style={styles.dateButton}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={COLORS.blue}
                />
                <Text style={styles.dateButtonText}>
                  {toDateString(date)}
                </Text>

                <Ionicons
                  name="lock-closed"
                  size={18}
                  color="#64748B"
                  style={{ marginLeft: "auto" }}
                />
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              )}
            </ScrollView>

            <Pressable style={styles.saveButton} onPress={handleAddRevision}>
              <Text style={styles.saveButtonText}>Save Revision</Text>
            </Pressable>
          </SafeAreaView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F6F8FC" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F6F8FC" },
  loadingText: { marginTop: 12, fontSize: moderateScale(16), color: COLORS.navySoft },

  header: { padding: scaleSize(20), paddingBottom: verticalScale(10) },
  backRow: { flexDirection: "row", alignItems: "center" },
  breadcrumb: { fontSize: moderateScale(13), color: "#94A3B8", fontWeight: "600" },
  title: { fontSize: moderateScale(24), fontWeight: "800", color: COLORS.navy },

  examBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: scaleSize(12),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scaleSize(14),
    marginTop: verticalScale(14),
  },
  examBannerText: { fontSize: moderateScale(14), fontWeight: "700" },

  listContent: { paddingHorizontal: scaleSize(20), paddingBottom: verticalScale(100) },

  card: {
    backgroundColor: "#fff",
    borderRadius: scaleSize(18),
    padding: scaleSize(18),
    marginBottom: verticalScale(16),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  subjectTitle: { fontSize: moderateScale(18), fontWeight: "700", color: COLORS.navy, flex: 1 },
  badge: { paddingHorizontal: scaleSize(12), paddingVertical: verticalScale(6), borderRadius: scaleSize(20) },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: moderateScale(13) },
  dateText: { color: "#687588", fontSize: moderateScale(14), marginTop: verticalScale(8) },

  topicRow: { flexDirection: "row", alignItems: "center", paddingVertical: verticalScale(12) },
  checkbox: { padding: scaleSize(4) },
  topicName: { flex: 1, fontSize: moderateScale(15.5), color: COLORS.navy, marginLeft: scaleSize(8) },
  strikethrough: { textDecorationLine: "line-through", color: "#94A3B8" },
  progressContainer: { flexDirection: "row", alignItems: "center", flex: 1.3 },
  progressText: { fontSize: moderateScale(13), fontWeight: "600", color: "#64748B", width: 42, textAlign: "right" },

  fab: {
    position: "absolute",
    bottom: verticalScale(24),
    right: scaleSize(24),
    backgroundColor: COLORS.blue,
    width: scaleSize(64),
    height: scaleSize(64),
    borderRadius: scaleSize(32),
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  modalContainer: { flex: 1, backgroundColor: "#F6F8FC" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: scaleSize(20),
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: { fontSize: moderateScale(22), fontWeight: "700", color: COLORS.navy },
  cancelText: { fontSize: moderateScale(16), color: "#64748B" },

  modalContent: { flex: 1, padding: scaleSize(20) },
  label: { fontSize: moderateScale(15), fontWeight: "600", color: COLORS.navy, marginTop: verticalScale(16), marginBottom: verticalScale(6) },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scaleSize(12),
    padding: scaleSize(14),
    fontSize: moderateScale(16),
    backgroundColor: "#fff",
  },
  fixedSubject: {
    fontSize: moderateScale(16),
    padding: scaleSize(14),
    backgroundColor: "#F1F5F9",
    borderRadius: scaleSize(12),
    color: COLORS.navy,
  },
  inputRow: { flexDirection: "row", gap: scaleSize(10) },
  addTopicBtn: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: scaleSize(20),
    borderRadius: scaleSize(12),
    justifyContent: "center",
  },
  addTopicBtnText: { color: "#fff", fontWeight: "600" },

  chipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: scaleSize(8), marginVertical: verticalScale(12) },
  chip: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: scaleSize(14),
    paddingVertical: verticalScale(8),
    borderRadius: scaleSize(20),
    flexDirection: "row",
    alignItems: "center",
    gap: scaleSize(6),
  },
  chipText: { color: COLORS.navy, fontSize: moderateScale(15) },

  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: scaleSize(10),
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scaleSize(12),
    padding: scaleSize(16),
  },
  dateButtonText: { fontSize: moderateScale(16), color: COLORS.navy },

  saveButton: {
    backgroundColor: COLORS.blue,
    margin: scaleSize(20),
    padding: scaleSize(18),
    borderRadius: scaleSize(16),
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: moderateScale(17), fontWeight: "700" },

  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: verticalScale(100) },
  emptyTitle: { fontSize: moderateScale(20), fontWeight: "600", color: COLORS.navy, marginTop: verticalScale(20) },
  emptySubtitle: { color: "#94A3B8", textAlign: "center", marginTop: 8 },
});