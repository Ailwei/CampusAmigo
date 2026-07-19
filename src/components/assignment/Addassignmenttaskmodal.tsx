import COLORS from "@/constants/color";
import { Topic, toDateString } from "@/utils/Assignmenttasks"
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  subject?: string;
  dueDate: Date;
  onCancel: () => void;
  onSave: (topics: Topic[]) => Promise<void>;
};

export default function AddAssignmentTaskModal({ visible, subject, dueDate, onCancel, onSave }: Props) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicInput, setTopicInput] = useState("");

  useEffect(() => {
    if (visible) {
      setTopics([]);
      setTopicInput("");
    }
  }, [visible]);

  const addTopic = () => {
    const value = topicInput.trim();
    if (!value || topics.some((t) => t.name === value)) return;
    setTopics((prev) => [...prev, { name: value, progress: 0 }]);
    setTopicInput("");
  };

  const removeTopic = (name: string) => {
    setTopics((prev) => prev.filter((t) => t.name !== name));
  };

  const handleSave = async () => {
    await onSave(topics);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>New Assignment Task</Text>
          <Pressable onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Subject</Text>
          <TextInput style={styles.input} value={subject || ""} editable={false} />

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
            <Ionicons name="calendar-outline" size={20} color={COLORS.blue} />
            <Text style={styles.dateButtonText}>{toDateString(dueDate)}</Text>
            <Ionicons name="lock-closed" size={18} color="#64748B" style={{ marginLeft: "auto" }} />
          </View>
        </ScrollView>

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Task</Text>
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
  inputRow: { flexDirection: "row", gap: scaleSize(10) },
  addTopicBtn: { backgroundColor: COLORS.blue, paddingHorizontal: scaleSize(20), borderRadius: scaleSize(12), justifyContent: "center" },
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
  saveButton: { backgroundColor: COLORS.blue, margin: scaleSize(20), padding: scaleSize(18), borderRadius: scaleSize(16), alignItems: "center" },
  saveButtonText: { color: "#fff", fontSize: moderateScale(17), fontWeight: "700" },
});