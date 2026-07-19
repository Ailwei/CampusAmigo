import ExamForm from "@/components/exam/ExamForm";
import COLORS from "@/constants/color";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { useExams } from "@/utils/useexam";
import { useState } from "react";
import ExamList from "@/components/exam/Examlist";

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

export default function ExamsScreen() {
  const { exams, loading, subjectOptions, subjectOptionsLoading, getProgress, addExam } = useExams();
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (data: { subjectId: string; date: string; venue: string }) => {
    const result = await addExam(data);
    if (result.success) {
      setShowForm(false);
    } else {
      
      Alert.alert("Error", result.message || "Failed to save exam");
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={styles.loadingText}>Loading exams...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FC" }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={styles.heading}>Upcoming Exams</Text>

          {!showForm ? (
            <ExamList exams={exams} getProgress={getProgress} />
          ) : (
            <ExamForm
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
              <Text style={styles.buttonText}>+ Add Exam</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Alert_showError(message?: string) {
  Alert.alert("Error", message || "Failed to save exam");
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