import COLORS from "@/constants/color";
import { useUser } from "@/context/userContext";
import { useRevisionTasks } from "@/utils/Userevisiontasks";
import { daysUntil } from "@/utils/RevisionTasks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AddRevisionTaskModal from "@/components/exam/Addrevisiontaskmodal";

import RevisionTaskHeader from "@/components/exam/Revisiontaskheader";
import RevisionTaskList from "@/components/exam/RevisionTasklist";

export default function RevisionScreen() {
  const { user, loadUser } = useUser();
  const { examDate, subjectId, subject: examSubject } = useLocalSearchParams<{
    examDate?: string;
    subjectId?: string;
    subject?: string;
  }>();

  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);

  const examSubjectStr = typeof examSubject === "string" ? examSubject : "";
  const examDueDate = typeof examDate === "string" ? new Date(examDate) : new Date();
  const examDateStr = typeof examDate === "string" ? examDate : null;
  const daysToExam = examDateStr ? daysUntil(examDateStr) : null;

  useEffect(() => {
    if (!user) loadUser();
  }, [user, loadUser]);

  const { loading, filteredRevisions, examProgress, addRevision, setTopicProgressLocal, updateTopicProgress } =
    useRevisionTasks(subjectId);

  const handleSaveRevision = async (topics: { name: string; progress: number }[]) => {
    const result = await addRevision(topics, examDueDate);
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
        <RevisionTaskHeader
          subjectId={subjectId}
          examSubjectStr={examSubjectStr}
          onBack={() => router.back()}
          examDateStr={examDateStr}
          daysToExam={daysToExam}
          examProgress={examProgress}
        />

        <RevisionTaskList
          data={filteredRevisions}
          examDateStr={examDateStr}
          daysToExam={daysToExam}
          onToggleComplete={({ revisionId, createdAt, topicIndex, topicName, currentProgress }) =>
            updateTopicProgress(revisionId, createdAt, topicIndex, topicName, currentProgress >= 100 ? 0 : 100)
          }
          onSlideChange={(revisionId, createdAt, topicIndex, value) =>
            setTopicProgressLocal(revisionId, createdAt, topicIndex, value)
          }
          onSlideComplete={(revisionId, createdAt, topicIndex, topicName, value) =>
            updateTopicProgress(revisionId, createdAt, topicIndex, topicName, value)
          }
        />

        <Pressable style={styles.fab} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={30} color="#fff" />
        </Pressable>

        <AddRevisionTaskModal
          visible={showAddModal}
          subject={examSubjectStr}
          subjectId={subjectId}
          dueDate={examDueDate}
          onCancel={() => setShowAddModal(false)}
          onSave={handleSaveRevision}
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