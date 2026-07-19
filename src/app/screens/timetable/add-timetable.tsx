import COLORS from "@/constants/color";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useTimetable } from "@/utils/Usetimetable"
import AddClassForm from "@/components/classes/Addclassform";
import TimetableList from "@/components/classes/Timetablelist";


export default function Timetable() {
  const {
    classes,
    timetable,
    loading,
    subject,
    day,
    startTime,
    endTime,
    showStartPicker,
    showEndPicker,
    justAddedKey,
    saving,
    canAdd,
    setSubject,
    setDay,
    setShowStartPicker,
    setShowEndPicker,
    handleStartChange,
    handleEndChange,
    addClassSlot,
    handleNext,
    toDate,
  } = useTimetable();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.subtitle}>Add each class to your weekly schedule.</Text>

        <AddClassForm
          classes={classes}
          subject={subject}
          day={day}
          startTime={startTime}
          endTime={endTime}
          showStartPicker={showStartPicker}
          showEndPicker={showEndPicker}
          saving={saving}
          canAdd={canAdd}
          onChangeSubject={setSubject}
          onChangeDay={setDay}
          onOpenStartPicker={() => setShowStartPicker(true)}
          onOpenEndPicker={() => setShowEndPicker(true)}
          onStartChange={handleStartChange}
          onEndChange={handleEndChange}
          onAddClass={addClassSlot}
          toDate={toDate}
        />

        <Text style={styles.heading}>Your Timetable</Text>

        <TimetableList loading={loading} timetable={timetable} justAddedKey={justAddedKey} />

        <Pressable
          style={({ pressed }) => [styles.nextButton, pressed && styles.nextButtonPressed]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward-circle" size={20} color="#fff" />
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scaleSize(24),
    paddingTop: verticalScale(24),
    backgroundColor: COLORS.bgTop,
  },
  subtitle: {
    marginTop: verticalScale(10),
    marginBottom: verticalScale(20),
    fontSize: moderateScale(14),
    color: COLORS.navySoft,
    textAlign: "center",
  },
  heading: {
    marginTop: verticalScale(10),
    marginBottom: verticalScale(10),
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: COLORS.navy,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.orange,
    padding: scaleSize(14),
    borderRadius: scaleSize(10),
    justifyContent: "center",
    marginTop: verticalScale(20),
  },
  nextButtonPressed: {
    opacity: 0.85,
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(16),
    marginRight: scaleSize(8),
  },
});