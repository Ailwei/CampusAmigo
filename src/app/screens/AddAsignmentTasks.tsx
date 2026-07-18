import COLORS from "@/constants/color";
import { useUser } from "@/context/userContext";
import api from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
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

type RawTaskItem = {
    _id?: string;
    createdAt: number;
    date: string;
    assignmentId: string,
    subject: string;
    subjectId: string;
    topics: Topic[];
};

type TopicTask = {
    key: string;
    taskId: string | undefined;
    createdAt: number;
    subject: string;
    assignmentId: string,
    subjectId: string;
    date: string;
    topicIndex: number;
    topicName: string;
    progress: number;
};

type TaskGroup = {
    key: string;
    taskId: string | undefined;
    createdAt: number;
    assignmentId: string,
    subject: string;
    subjectId: string;
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

const flattenToTasks = (items: RawTaskItem[]): TopicTask[] => {
    const tasks: TopicTask[] = [];

    items.forEach((task) => {
        const groupKey = (task._id ?? task.createdAt).toString();

        task.topics.forEach((topic, index) => {
            tasks.push({
                key: `${groupKey}-${index}`,
                assignmentId: task.assignmentId,
                taskId: task._id,
                createdAt: task.createdAt,
                subject: task.subject,
                subjectId: task.subjectId,
                date: task.date,
                topicIndex: index,
                topicName: getTopicName(topic),
                progress: topic.progress ?? 0,
            });
        });
    });

    return tasks.sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
};

const groupTasks = (tasks: TopicTask[]): TaskGroup[] => {
    const groups = new Map<string, TaskGroup>();

    tasks.forEach((task) => {
        const key = task.assignmentId;

        if (!groups.has(key)) {
            groups.set(key, {
                key,
                assignmentId: key,
                subject: task.subject,
                subjectId: task.subjectId,
                date: task.date,
                topics: [],
                taskId: undefined,
                createdAt: 0
            });
        }

        groups.get(key)!.topics.push(task);
    });

    return Array.from(groups.values()).sort(
        (a, b) => daysUntil(a.date) - daysUntil(b.date)
    );
};

export default function AssignmentTaskScreen() {
    const { user, loadUser } = useUser();
    const {
        assignmentId,
        subjectId,
        title,
        subject,
        due,
        progress,
    } = useLocalSearchParams<{
        assignmentId?: string;
        subjectId?: string;
        title?: string;
        subject?: string;
        due?: string;
        progress?: string;
    }>();

    useEffect(() => {
    }, [assignmentId, subjectId, title, subject, due, progress]);

    const hasFixedSubject = typeof subjectId === "string" && subjectId.length > 0;

    const [assignmetTasks, setAssignmetTasks] = useState<RawTaskItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [topics, setTopics] = useState<{ name: string; progress: number }[]>([]);
    const [topicInput, setTopicInput] = useState("");

    const assignmentDueDate = typeof due === "string" ? new Date(due) : new Date();
    const [date, setDate] = useState<Date>(assignmentDueDate);

    const assignmentDateStr = typeof due === "string" ? due : null;
    const router = useRouter();
    const daysToAssignment = assignmentDateStr ? daysUntil(assignmentDateStr) : null;

    useEffect(() => {
        if (!user) loadUser();
    }, [user, loadUser]);

    useEffect(() => {
        const loadTask = async () => {
            try {
                const res = await api.get("/assignment/get-tasks");
                if (res.data.success && Array.isArray(res.data.data.assignmentTasks)) {
                    setAssignmetTasks(res.data.data.assignmentTasks);
                }
            } catch (error: any) {
                Alert.alert("Error", error?.response?.data?.message || "Failed to load revisions");
            } finally {
                setLoading(false);
            }
        };
        loadTask();
    }, []);

    const resetForm = () => {
        setTopicInput("");
        setTopics([]);
        setDate(assignmentDueDate);
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

    const handleAddTask = async () => {


        try {
            const res = await api.post("/assignment/add-task", {
                assignmentId,
                topics,
            });
            if (res.data.success) {
                const updated = await api.get("/assignment/get-tasks");
                setAssignmetTasks(updated.data.data.assignmentTasks || []);
                setShowAddModal(false);
                resetForm();
            }
        } catch (error: any) {
            Alert.alert("Error", error?.response?.data?.message || "Failed to save revision");
        }
    };

    const setTopicProgressLocal = (
        taskId: string | undefined,
        createdAt: number,
        topicIndex: number,
        newProgress: number
    ) => {
        const clamped = Math.min(100, Math.max(0, newProgress));
        const matchGroupKey = (taskId ?? createdAt)?.toString();

        setAssignmetTasks((prev) =>
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
    taskId: string | undefined,
    createdAt: number,
    topicIndex: number,
    taskAssignmentId: string,
    topicName: string,
    newProgress: number
) => {
    const clamped = Math.min(100, Math.max(0, newProgress));

    setTopicProgressLocal(taskId, createdAt, topicIndex, clamped);

    try {
        const res = await api.patch("/assignment/update-task-progress", {
            assignmentId,
            topic: topicName,
            progress: clamped,
        });

        if (
            res.data.success &&
            Array.isArray(res.data.data.assignmentTasks) &&
            res.data.data.assignmentTasks.length > 0
        ) {
            setAssignmetTasks(res.data.data.assignmentTasks);
        }
    } catch (error: any) {
        Alert.alert("Error", error?.response?.data?.message || "Failed to update progress");
    }
};

    const hasAssignmentId = typeof assignmentId === "string" && assignmentId.length > 0;

    const filteredTasks = useMemo(() => {
        const result = hasAssignmentId
            ? assignmetTasks.filter((r) => r.assignmentId === assignmentId)
            : assignmetTasks;

        return groupTasks(flattenToTasks(result));
    }, [assignmetTasks, hasAssignmentId, assignmentId]);

    const assignmentProgress = useMemo(() => {
        if (!hasAssignmentId) return null;
        const subjectAsignmentTask = assignmetTasks.filter((r) => r.assignmentId === assignmentId);
        const allTopics = subjectAsignmentTask.flatMap((r) => r.topics);
        return { done: allTopics.filter((t) => t.progress >= 100).length, total: allTopics.length };
    }, [assignmetTasks, hasAssignmentId, assignmentId]);

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
                            <Text style={styles.title}>
                                {title || "Assignment"}
                            </Text>
                            <Text style={styles.breadcrumb}>
                                {subject || "Subject"}
                            </Text>
                        </View>
                    </Pressable>

                    {assignmentDateStr && daysToAssignment !== null && assignmentProgress && (
                        <View
                            style={[
                                styles.examBanner,
                                { backgroundColor: dueBannerColors(daysToAssignment).bg },
                            ]}
                        >
                            <Text style={[styles.examBannerText, { color: dueBannerColors(daysToAssignment).text }]}>
                                {daysToAssignment <= 0 ? "Assigment  is due today" : `Due in ${daysToAssignment}d`}
                            </Text>
                            <Text style={[styles.examBannerText, { color: dueBannerColors(daysToAssignment).text }]}>
                                {assignmentProgress.done}/{assignmentProgress.total} done
                            </Text>
                        </View>
                    )}
                </View>

                <FlatList
                    data={filteredTasks}
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
                                    <Text style={styles.subjectTitle}>{group.subject || subject}</Text>
                                    <View style={[styles.badge, { backgroundColor: dueColor(left) }]}>
                                        <Text style={styles.badgeText}>{left <= 0 ? "Due!" : `${left}d`}</Text>
                                    </View>
                                </View>

                                <Text style={styles.dateText}>
                                    tasks: {group.date} • {doneCount}/{group.topics.length} completed
                                </Text>

                                {assignmentDateStr && (
                                    <View style={styles.statusRow}>
                                        <Ionicons
                                            name={left <= daysToAssignment! ? "checkmark-circle" : "warning"}
                                            size={16}
                                            color={left <= daysToAssignment! ? "#10B981" : "#EF4444"}
                                        />
                                        <Text
                                            style={{
                                                marginLeft: 6,
                                                color: left <= daysToAssignment! ? "#10B981" : "#EF4444",
                                                fontSize: moderateScale(13),
                                                fontWeight: "600",
                                            }}
                                        >
                                            {left <= daysToAssignment!
                                                ? "On track for assignment"
                                                : "Task after assignment"}
                                        </Text>
                                    </View>
                                )}

                                {group.topics.map((topic) => (
                                    <View key={topic.key} style={styles.topicRow}>
                                        <Pressable
                                            style={styles.checkbox}
                                            onPress={() => updateTopicProgress(topic.taskId, topic.createdAt, topic.topicIndex, topic.subjectId, topic.topicName, topic.progress >= 100 ? 0 : 100)}
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
                                                onValueChange={(val) => setTopicProgressLocal(topic.taskId, topic.createdAt, topic.topicIndex, val)}
                                                onSlidingComplete={(val) => updateTopicProgress(topic.taskId, topic.createdAt, topic.topicIndex, topic.subjectId, topic.topicName, val)}
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
                            <Text style={styles.modalTitle}>New Assignment Task</Text>
                            <Pressable onPress={() => { setShowAddModal(false); resetForm(); }}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </Pressable>
                        </View>

                        <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
                            <Text style={styles.label}>Subject</Text>


                            <TextInput
                                style={styles.input}
                                value={subject || ""}
                                editable={false}
                            />

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

                            <Text style={styles.label}>Due Date</Text>

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

                        </ScrollView>

                        <Pressable style={styles.saveButton} onPress={handleAddTask}>
                            <Text style={styles.saveButtonText}>Save Task</Text>
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
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    saveButtonText: { color: "#fff", fontSize: moderateScale(17), fontWeight: "700" },

    emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: verticalScale(100) },
    emptyTitle: { fontSize: moderateScale(20), fontWeight: "600", color: COLORS.navy, marginTop: verticalScale(20) },
    emptySubtitle: { color: "#94A3B8", textAlign: "center", marginTop: 8 },
});