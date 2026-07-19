import COLORS from "@/constants/color";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TimetableSlot } from "@/app/screens/timetable/timetablegrid";
import { DAYS } from "@/utils/Usetimetable";

interface EditSlotModalProps {
  visible: boolean;
  editing: TimetableSlot | null;
  newDay: string;
  newStart: Date;
  newEnd: Date;
  showStartPicker: boolean;
  showEndPicker: boolean;
  saving: boolean;
  onChangeDay: (day: string) => void;
  onOpenStartPicker: () => void;
  onOpenEndPicker: () => void;
  onStartChange: (_: any, date?: Date) => void;
  onEndChange: (_: any, date?: Date) => void;
  onClose: () => void;
  onSave: () => void;
  toTimeString: (date: Date) => string;
}

export default function EditSlotModal({
  visible,
  editing,
  newDay,
  newStart,
  newEnd,
  showStartPicker,
  showEndPicker,
  saving,
  onChangeDay,
  onOpenStartPicker,
  onOpenEndPicker,
  onStartChange,
  onEndChange,
  onClose,
  onSave,
  toTimeString,
}: EditSlotModalProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit {editing?.subject?.name}</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.label}>Day</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {DAYS.map((day) => (
              <Pressable
                key={day}
                style={[styles.dayChip, newDay === day && styles.dayChipActive]}
                onPress={() => onChangeDay(day)}
              >
                <Text style={[styles.dayChipText, newDay === day && styles.dayChipTextActive]}>{day}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.label}>Start Time</Text>
          <Pressable style={styles.timeInput} onPress={onOpenStartPicker}>
            <Ionicons name="time-outline" size={18} color={COLORS.blue} />
            <Text style={styles.timeInputText}>{toTimeString(newStart)}</Text>
          </Pressable>
          {showStartPicker && (
            <DateTimePicker
              value={newStart}
              mode="time"
              is24Hour
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onStartChange}
            />
          )}

          <Text style={styles.label}>End Time</Text>
          <Pressable style={styles.timeInput} onPress={onOpenEndPicker}>
            <Ionicons name="time-outline" size={18} color={COLORS.blue} />
            <Text style={styles.timeInputText}>{toTimeString(newEnd)}</Text>
          </Pressable>
          {showEndPicker && (
            <DateTimePicker
              value={newEnd}
              mode="time"
              is24Hour
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onEndChange}
            />
          )}
        </ScrollView>

        <Pressable style={styles.saveButton} onPress={onSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
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
  modalTitle: { fontSize: moderateScale(18), fontWeight: "700", color: COLORS.navy },
  cancelText: { color: "#64748B", fontSize: moderateScale(15) },
  modalContent: { flex: 1, padding: scaleSize(20) },
  label: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: COLORS.navy,
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
  },

  dayChip: {
    paddingHorizontal: scaleSize(14),
    paddingVertical: verticalScale(8),
    borderRadius: scaleSize(20),
    backgroundColor: "#EEF2FF",
    marginRight: scaleSize(8),
  },
  dayChipActive: { backgroundColor: COLORS.blue },
  dayChipText: { color: COLORS.navy, fontWeight: "600", fontSize: moderateScale(13) },
  dayChipTextActive: { color: "#fff" },

  timeInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: scaleSize(10),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scaleSize(12),
    padding: scaleSize(14),
    backgroundColor: "#fff",
  },
  timeInputText: { fontSize: moderateScale(16), color: COLORS.navy },

  saveButton: {
    backgroundColor: COLORS.blue,
    margin: scaleSize(20),
    padding: scaleSize(18),
    borderRadius: scaleSize(16),
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: moderateScale(16), fontWeight: "700" },
});