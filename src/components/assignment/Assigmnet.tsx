import COLORS from "@/constants/color";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { useAssignments } from "@/utils/useassigment";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AssignmentForm from "./AssignmentForm";
import AssignmentsList from "./AssignmetList";

export default function AssignmentsScreen() {
  const { assignments, loading, subjectOptions, subjectOptionsLoading, getProgress, addAssignment } = useAssignments();
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (data: { title: string; subjectId: string; due: string }) => {
    const result = await addAssignment(data);
    if (result.success) {
      setShowForm(false);
    } else {
      Alert.alert("Error", result.message || "Failed to save assignment");
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={styles.loadingText}>Loading assignments...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FC" }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={styles.heading}>Upcoming Assignments</Text>

          {!showForm ? (
            <AssignmentsList assignments={assignments} getProgress={getProgress} />
          ) : (
            <AssignmentForm
              subjectOptions={subjectOptions}
              subjectOptionsLoading={subjectOptionsLoading}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          )}
        </ScrollView>

        {!showForm && (
          <View style={styles.bottomButtonContainer}>
            <Pressable style={styles.button} onPress={() => setShowForm(true)}>
              <Text style={styles.buttonText}>+ Add Assignment</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FC", padding: scaleSize(20) },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F6F8FC" },
  loadingText: { marginTop: verticalScale(12), fontSize: moderateScale(16), color: COLORS.navySoft },
  heading: { fontSize: moderateScale(26), fontWeight: "800", color: COLORS.navy, marginBottom: verticalScale(20), textAlign: "center" },
  bottomButtonContainer: { position: "absolute", bottom: verticalScale(20), left: scaleSize(20), right: scaleSize(20) },
  button: { backgroundColor: COLORS.blue, borderRadius: scaleSize(14), padding: scaleSize(16), alignItems: "center", marginTop: verticalScale(10) },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: moderateScale(16) },
});