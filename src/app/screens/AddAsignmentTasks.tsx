import COLORS from "@/constants/color";
import { useUser } from "@/context/userContext";
import { useAssignmentTasks } from "@/utils/Useassignmenttasks";
import { daysUntil } from "@/utils/Assignmenttasks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AssignmentTaskHeader from "@/components/assignment/Assignmenttaskheader";
import AddAssignmentTaskModal from "@/components/assignment/Addassignmenttaskmodal";
import AssignmentTaskList from "@/components/assignment/Assigmnettasklist";

export default function AssignmentTaskScreen() {
  const { user, loadUser } = useUser();
  const { assignmentId, subjectId, title, subject, due } = useLocalSearchParams<{
    assignmentId?: string;
    subjectId?: string;
    title?: string;
    subject?: string;
    due?: string;
    progress?: string;
  }>();

  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);

  const assignmentDueDate = typeof due === "string" ? new Date(due) : new Date();
  const assignmentDateStr = typeof due === "string" ? due : null;
  const daysToAssignment = assignmentDateStr ? daysUntil(assignmentDateStr) : null;

  useEffect(() => {
    if (!user) loadUser();
  }, [user, loadUser]);

  const { loading, filteredTasks, assignmentProgress, addTask, setTopicProgressLocal, updateTopicProgress } =
    useAssignmentTasks(assignmentId);

  const handleSaveTask = async (topics: { name: string; progress: number }[]) => {
    const result = await addTask(topics);
    if (result.success) {
      setShowAddModal(false);
    }
  };

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
        <AssignmentTaskHeader
          title={title}
          subject={subject}
          onBack={() => router.back()}
          assignmentDateStr={assignmentDateStr}
          daysToAssignment={daysToAssignment}
          assignmentProgress={assignmentProgress}
        />

        <AssignmentTaskList
          data={filteredTasks}
          fallbackSubject={subject}
          assignmentDateStr={assignmentDateStr}
          daysToAssignment={daysToAssignment}
          onToggleComplete={({ taskId, createdAt, topicIndex, topicName, currentProgress }) =>
            updateTopicProgress(taskId, createdAt, topicIndex, topicName, currentProgress >= 100 ? 0 : 100)
          }
          onSlideChange={(taskId, createdAt, topicIndex, value) => setTopicProgressLocal(taskId, createdAt, topicIndex, value)}
          onSlideComplete={(taskId, createdAt, topicIndex, topicName, value) =>
            updateTopicProgress(taskId, createdAt, topicIndex, topicName, value)
          }
        />

        <Pressable style={styles.fab} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={30} color="#fff" />
        </Pressable>

        <AddAssignmentTaskModal
          visible={showAddModal}
          subject={subject}
          dueDate={assignmentDueDate}
          onCancel={() => setShowAddModal(false)}
          onSave={handleSaveTask}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F6F8FC" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F6F8FC" },
  loadingText: { marginTop: 12, fontSize: 16, color: COLORS.navySoft },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: COLORS.blue,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});