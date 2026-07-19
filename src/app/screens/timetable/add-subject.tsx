import COLORS from "@/constants/color";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useAddClasses } from "@/utils/useAddclasses"
import AddSubjectForm from "@/components/classes/Addsubjectfor";
import SubjectsList from "@/components/classes/Subjectslist";

export default function AddClasses() {
  const {
    classes,
    subjects,
    loading,
    newSubject,
    newCode,
    newRoom,
    justAddedId,
    nameInputRef,
    setNewSubject,
    setNewCode,
    setNewRoom,
    toggleClass,
    addSubject,
    handleNext,
  } = useAddClasses();

  const selectedCount = classes.length;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
    >
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Add each subject you're taking this term
        </Text>

        <AddSubjectForm
          nameInputRef={nameInputRef}
          newSubject={newSubject}
          newCode={newCode}
          newRoom={newRoom}
          onChangeSubject={setNewSubject}
          onChangeCode={setNewCode}
          onChangeRoom={setNewRoom}
          onAddSubject={addSubject}
        />

        <View style={styles.listHeader}>
          <Text style={styles.listHeaderText}>Your subjects</Text>
          {selectedCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{selectedCount} selected</Text>
            </View>
          )}
        </View>

        <SubjectsList
          loading={loading}
          subjects={subjects}
          classes={classes}
          justAddedId={justAddedId}
          onToggle={toggleClass}
        />

        <Pressable
          style={({ pressed }) => [
            styles.nextButton,
            pressed && styles.nextButtonPressed,
            selectedCount === 0 && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {selectedCount === 0 ? "Select a subject to continue" : "Next"}
          </Text>
          <Ionicons name="arrow-forward-circle" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: scaleSize(24),
    backgroundColor: COLORS.bgTop,
  },
  subtitle: {
    marginTop: verticalScale(6),
    marginBottom: verticalScale(16),
    color: COLORS.navySoft,
    fontSize: moderateScale(14),
    textAlign: "center",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(8),
  },
  listHeaderText: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: COLORS.navy,
  },
  countBadge: {
    backgroundColor: "#EAF3FF",
    paddingHorizontal: scaleSize(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(20),
  },
  countBadgeText: {
    color: COLORS.blue,
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.orange,
    paddingVertical: verticalScale(14),
    paddingHorizontal: scaleSize(20),
    borderRadius: moderateScale(10),
    justifyContent: "center",
    marginTop: verticalScale(16),
  },
  nextButtonPressed: {
    opacity: 0.85,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "700",
    marginRight: scaleSize(8),
    fontSize: moderateScale(15),
  },
});