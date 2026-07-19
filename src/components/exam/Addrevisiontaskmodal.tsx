import COLORS from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toDateString, Topic } from "@/utils/RevisionTasks"

type Props = {
  visible: boolean;
  subject?: string;
  subjectId?: string;
  dueDate: Date;
  onCancel: () => void;
  onSave: (topics: Topic[]) => void;
};

export default function AddRevisionTaskModal({
  visible,
  subject,
  subjectId,
  dueDate,
  onCancel,
  onSave,
}: Props) {
  const [subjectInput, setSubjectInput] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicInput, setTopicInput] = useState("");

  useEffect(() => {
    if (subject) setSubjectInput(subject);
  }, [subject]);

  const resetForm = () => {
    setTopicInput("");
    setTopics([]);
    setSubjectInput(subject || "");
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

  const handleSave = () => {
    if (!subjectInput || topics.length === 0) {
      Alert.alert("Missing Fields", "Subject and at least one topic are required.");
      return;
    }
    onSave(topics);
    resetForm();
  };

  const handleCancel = () => {
    onCancel();
    resetForm();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>New Revision</Text>
          <Pressable onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Subject</Text>
          {typeof subjectId === "string" ? (
            <Text style={styles.fixedSubject}>{subject || subjectId}</Text>
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Enter subject name"
              value={subjectInput}
              onChangeText={setSubjectInput}
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
            <Ionicons name="calendar-outline" size={20} color={COLORS.blue} />
            <Text style={styles.dateButtonText}>{toDateString(dueDate)}</Text>
            <Ionicons name="lock-closed" size={18} color="#64748B" style={{ marginLeft: "auto" }} />
          </View>
        </ScrollView>

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Revision</Text>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: "#F6F8FC" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: { fontSize: 22, fontWeight: "700", color: COLORS.navy },
  cancelText: { fontSize: 16, color: "#64748B" },
  modalContent: { flex: 1, padding: 20 },
  label: { fontSize: 15, fontWeight: "600", color: COLORS.navy, marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  fixedSubject: {
    fontSize: 16,
    padding: 14,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    color: COLORS.navy,
  },
  inputRow: { flexDirection: "row", gap: 10 },
  addTopicBtn: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: "center",
  },
  addTopicBtnText: { color: "#fff", fontWeight: "600" },
  chipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 12 },
  chip: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipText: { color: COLORS.navy, fontSize: 15 },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
  },
  dateButtonText: { fontSize: 16, color: COLORS.navy },
  saveButton: {
    backgroundColor: COLORS.blue,
    margin: 20,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});