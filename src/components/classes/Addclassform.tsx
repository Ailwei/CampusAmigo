import COLORS from "@/constants/color";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { ClassItem, DAYS } from "@/utils/Usetimetable"
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";

interface AddClassFormProps {
  classes: ClassItem[];
  subject: ClassItem | null;
  day: string;
  startTime: string;
  endTime: string;
  showStartPicker: boolean;
  showEndPicker: boolean;
  saving: boolean;
  canAdd: boolean;
  onChangeSubject: (subject: ClassItem | null) => void;
  onChangeDay: (day: string) => void;
  onOpenStartPicker: () => void;
  onOpenEndPicker: () => void;
  onStartChange: (_: any, date?: Date) => void;
  onEndChange: (_: any, date?: Date) => void;
  onAddClass: () => void;
  toDate: (time: string) => Date;
}

export default function AddClassForm({
  classes,
  subject,
  day,
  startTime,
  endTime,
  showStartPicker,
  showEndPicker,
  saving,
  canAdd,
  onChangeSubject,
  onChangeDay,
  onOpenStartPicker,
  onOpenEndPicker,
  onStartChange,
  onEndChange,
  onAddClass,
  toDate,
}: AddClassFormProps) {
  return (
    <View style={styles.formCard}>
      <Text style={styles.label}>Subject</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={subject} onValueChange={onChangeSubject}>
          <Picker.Item label="Select subject" value={null} color={COLORS.navySoft} />
          {classes.map((item) => (
            <Picker.Item key={item.id} label={item.name} value={item} />
          ))}
        </Picker>
      </View>

      {subject?.code ? (
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{subject.code}</Text>
        </View>
      ) : null}

      <Text style={styles.label}>Day</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={day} onValueChange={onChangeDay}>
          <Picker.Item label="Select day" value="" color={COLORS.navySoft} />
          {DAYS.map((d) => (
            <Picker.Item key={d} label={d} value={d} />
          ))}
        </Picker>
      </View>

      <View style={styles.timeRow}>
        <View style={styles.timeCol}>
          <Text style={styles.label}>Start Time</Text>
          <Pressable style={styles.timeButton} onPress={onOpenStartPicker}>
            <Ionicons name="time-outline" size={18} color={COLORS.navySoft} />
            <Text style={styles.timeButtonText}>{startTime || "Select"}</Text>
          </Pressable>
        </View>
        <View style={styles.timeCol}>
          <Text style={styles.label}>End Time</Text>
          <Pressable style={styles.timeButton} onPress={onOpenEndPicker}>
            <Ionicons name="time-outline" size={18} color={COLORS.navySoft} />
            <Text style={styles.timeButtonText}>{endTime || "Select"}</Text>
          </Pressable>
        </View>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={toDate(startTime || "08:00")}
          mode="time"
          is24Hour
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onStartChange}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={toDate(endTime || "09:00")}
          mode="time"
          is24Hour
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onEndChange}
        />
      )}

      <Pressable
        style={({ pressed }) => [
          styles.addButton,
          pressed && styles.addButtonPressed,
          (!canAdd || saving) && styles.addButtonDisabled,
        ]}
        onPress={onAddClass}
        disabled={!canAdd || saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Class</Text>
          </>
        )}
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
  label: {
    fontWeight: "700",
    fontSize: moderateScale(14),
    marginBottom: verticalScale(6),
    marginTop: verticalScale(12),
    color: COLORS.navy,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E2E8F2",
    borderRadius: scaleSize(10),
    backgroundColor: "#F8FAFD",
    marginBottom: verticalScale(4),
  },
  codeBox: {
    borderWidth: 1,
    borderColor: "#E2E8F2",
    borderRadius: scaleSize(10),
    backgroundColor: "#F8FAFD",
    paddingVertical: verticalScale(10),
    paddingHorizontal: scaleSize(14),
    marginBottom: verticalScale(4),
    alignSelf: "flex-start",
  },
  codeText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: COLORS.navy,
  },
  timeRow: {
    flexDirection: "row",
    gap: scaleSize(10),
  },
  timeCol: {
    flex: 1,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F2",
    borderRadius: scaleSize(10),
    padding: scaleSize(12),
    backgroundColor: "#F8FAFD",
    marginBottom: verticalScale(10),
  },
  timeButtonText: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: COLORS.navy,
    marginLeft: scaleSize(8),
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.blue,
    padding: scaleSize(14),
    borderRadius: scaleSize(10),
    justifyContent: "center",
    marginTop: verticalScale(6),
    minHeight: verticalScale(48),
  },
  addButtonPressed: {
    opacity: 0.85,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(15),
    marginLeft: scaleSize(8),
  },
});