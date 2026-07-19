import COLORS from "@/constants/color";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { RefObject } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
nameInputRef: RefObject<TextInput | null>;
  newSubject: string;
  newCode: string;
  newRoom: string;
  onChangeSubject: (value: string) => void;
  onChangeCode: (value: string) => void;
  onChangeRoom: (value: string) => void;
  onAddSubject: () => void;
};

export default function AddSubjectForm({
  nameInputRef,
  newSubject,
  newCode,
  newRoom,
  onChangeSubject,
  onChangeCode,
  onChangeRoom,
  onAddSubject,
}: Props) {
  return (
    <View style={styles.formCard}>
      <TextInput
        ref={nameInputRef}
        style={styles.input}
        placeholder="Subject name (e.g. CS 101)"
        placeholderTextColor={COLORS.navySoft}
        value={newSubject}
        onChangeText={onChangeSubject}
        returnKeyType="next"
        numberOfLines={1}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.inputHalf]}
          placeholder="Code (optional)"
          placeholderTextColor={COLORS.navySoft}
          value={newCode}
          onChangeText={onChangeCode}
        />
        <TextInput
          style={[styles.input, styles.inputHalf]}
          placeholder="Room (optional)"
          placeholderTextColor={COLORS.navySoft}
          value={newRoom}
          onChangeText={onChangeRoom}
          returnKeyType="done"
          onSubmitEditing={onAddSubject}
        />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.addButton,
          pressed && styles.addButtonPressed,
          !newSubject.trim() && styles.addButtonDisabled,
        ]}
        onPress={onAddSubject}
        disabled={!newSubject.trim()}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add Subject</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(14),
    padding: scaleSize(16),
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: "#E7ECF4",
  },
  inputRow: {
    flexDirection: "row",
    gap: scaleSize(10),
  },
  inputHalf: {
    flex: 1,
  },
  input: {
    borderWidth: scaleSize(1),
    borderColor: "#E2E8F2",
    borderRadius: moderateScale(10),
    paddingHorizontal: scaleSize(14),
    paddingVertical: verticalScale(12),
    backgroundColor: "#F8FAFD",
    marginBottom: verticalScale(10),
    fontSize: moderateScale(15),
    color: COLORS.navy,
    height: verticalScale(46),
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.blue,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    justifyContent: "center",
  },
  addButtonPressed: {
    opacity: 0.85,
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: scaleSize(8),
    fontSize: moderateScale(15),
  },
});