import COLORS from "@/constants/color";
import { SubjectOption } from "@/utils/Assignment";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  subjectOptions: SubjectOption[];
  subjectOptionsLoading: boolean;
  onSubmit: (data: { title: string; subjectId: string; due: string }) => Promise<void>;
  onCancel: () => void;
};

export default function AssignmentForm({ subjectOptions, subjectOptionsLoading, onSubmit, onCancel }: Props) {
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState<SubjectOption | null>(null);
  const [newDue, setNewDue] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (event.type === "dismissed") return;
    if (selectedDate) setNewDue(selectedDate);
  };

  const handleSave = async () => {
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

    await onSubmit({
      title: newTitle.trim(),
      subjectId: newSubject.id,
      due: newDue.toISOString().split("T")[0],
    });
  };

  return (
    <View style={styles.form}>
      <TextInput placeholder="Assignment Title" value={newTitle} onChangeText={setNewTitle} style={styles.input} />

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Subject</Text>
        <Pressable style={styles.pickerTrigger} onPress={() => setShowSubjectPicker(!showSubjectPicker)}>
          <Text style={styles.pickerText}>{newSubject?.name || "Select a subject"}</Text>
          <Ionicons name={showSubjectPicker ? "chevron-up" : "chevron-down"} size={18} color={COLORS.navySoft} />
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
                  style={[styles.optionRow, newSubject?.id === option.id && styles.optionRowActive]}
                  onPress={() => {
                    setNewSubject(option);
                    setShowSubjectPicker(false);
                  }}
                >
                  <Text style={styles.optionText}>{option.name}</Text>
                </Pressable>
              ))
            ) : (
              <Text style={[styles.optionText, { padding: scaleSize(14) }]}>No subjects available</Text>
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

      <Pressable style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Assignment</Text>
      </Pressable>

      <Pressable style={[styles.button, { backgroundColor: "#7A8599" }]} onPress={onCancel}>
        <Text style={styles.buttonText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { backgroundColor: "#fff", padding: scaleSize(20), borderRadius: scaleSize(16), marginTop: verticalScale(10) },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: scaleSize(10), padding: scaleSize(14), marginBottom: verticalScale(14) },
  inputContainer: { marginBottom: verticalScale(16) },
  label: { fontSize: moderateScale(14), fontWeight: "600", color: COLORS.navy, marginBottom: verticalScale(6) },
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
  pickerBox: { borderWidth: 1, borderColor: "#ccc", borderRadius: scaleSize(10), marginTop: verticalScale(6), backgroundColor: "#fff" },
  optionRow: { padding: scaleSize(14), borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  optionRowActive: { backgroundColor: "#E8F1FF" },
  optionText: { color: COLORS.navy, fontSize: moderateScale(16) },
  button: { backgroundColor: COLORS.blue, borderRadius: scaleSize(14), padding: scaleSize(16), alignItems: "center", marginTop: verticalScale(10) },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: moderateScale(16) },
});