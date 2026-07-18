import COLORS from "@/constants/color";
import { ClassItem, ClassSlot, useOnboarding } from "@/context/onboardingContext";
import api from "@/utils/api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { verticalScale, moderateScale, scaleSize } from "@/utils/responsive";

const matchesToday = (day: string) => {
  const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
  return day.startsWith(today);
};

export default function Summary() {
  const [subjects, setSubjects] = useState<ClassItem[]>([]);
  const [timetable, setTimetable] = useState<ClassSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { resetOnboarding } = useOnboarding();

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/onboarding/summary");
      if (res.data.success) {
        setSubjects(res.data.data.subjects || []);
        setTimetable(res.data.data.timetable || []);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load summary");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const todaysClasses = timetable.filter((item) => matchesToday(item.day));

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerScreen}>
        <Ionicons name="alert-circle-outline" size={40} color={COLORS.navySoft} />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadSummary}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>You're All Set!</Text>
      <Text style={styles.subtitle}>Here's a summary of your Student Diary.</Text>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <MaterialCommunityIcons name="book-education" size={22} color={COLORS.blue} />
            <Text style={styles.sectionTitle}>Subjects</Text>
          </View>
        </View>
        {subjects.length === 0 ? (
          <Text style={styles.empty}>No subjects added.</Text>
        ) : (
          subjects.map((subject, index) => (
            <View key={index} style={styles.subjectCard}>
              <Ionicons name="book-outline" size={20} color={COLORS.navySoft} />
              <Text style={styles.subjectText}>
                {subject.name}
                {subject.code ? ` (${subject.code})` : ""}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="calendar-outline" size={22} color={COLORS.blue} />
            <Text style={styles.sectionTitle}>Today's Timetable</Text>
          </View>
        </View>
        {todaysClasses.length === 0 ? (
          <Text style={styles.empty}>No classes scheduled.</Text>
        ) : (
          todaysClasses.map((item, index) => (
            <View key={index} style={styles.classCard}>
              <Text style={styles.classSubject}>
                {item.subject?.name}
                {item.subject?.code ? ` (${item.subject?.code})` : ""}
              </Text>

              <View style={styles.classInfoRow}>
                <Ionicons name="time-outline" size={16} color={COLORS.navySoft} />
                <Text style={styles.classInfo}>
                  {item.day} • {item.startTime} - {item.endTime}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="document-text-outline" size={22} color={COLORS.blue} />
            <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
          </View>
        </View>
        <View style={styles.placeholderCard}>
          <Text style={styles.empty}>No deadlines added yet.</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="school-outline" size={22} color={COLORS.blue} />
            <Text style={styles.sectionTitle}>Exam Countdown</Text>
          </View>
        </View>
        <View style={styles.placeholderCard}>
          <Text style={styles.empty}>No exams scheduled.</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.startButton, pressed && styles.startButtonPressed]}
        onPress={() => {
          resetOnboarding();
          router.replace("/screens/(tabs)/home")
        }}

      >
        <Text style={styles.startButtonText}>Start Using CampusAmigo</Text>
        <Ionicons name="rocket-outline" size={20} color="#fff" />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgTop },
  centerScreen: {
    flex: 1,
    backgroundColor: COLORS.bgTop,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scaleSize(32),
  },
  errorText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
    color: COLORS.navySoft,
    textAlign: "center",
  },
  retryButton: {
    marginTop: verticalScale(16),
    backgroundColor: COLORS.blue,
    paddingVertical: verticalScale(10),
    paddingHorizontal: scaleSize(20),
    borderRadius: scaleSize(10),
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(14),
  },

  content: {
    padding: scaleSize(24),
    paddingBottom: verticalScale(50),
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: "800",
    color: COLORS.navy,
    textAlign: "center",
  },
  subtitle: {
    marginTop: verticalScale(8),
    marginBottom: verticalScale(24),
    fontSize: moderateScale(15),
    color: COLORS.navySoft,
    textAlign: "center",
  },
  section: { marginBottom: verticalScale(24) },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(12),
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: COLORS.blue,
    marginLeft: scaleSize(8),
  },

  subjectCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: scaleSize(12),
    borderRadius: scaleSize(12),
    marginBottom: verticalScale(10),
    borderWidth: 1,
    borderColor: "#E7ECF4",
  },
  subjectText: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: COLORS.navy,
    marginLeft: scaleSize(8),
  },
  classCard: {
    backgroundColor: "#fff",
    padding: scaleSize(14),
    borderRadius: scaleSize(12),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: "#E7ECF4",
  },
  classSubject: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: COLORS.navy,
    marginBottom: verticalScale(6),
  },
  classInfoRow: { flexDirection: "row", alignItems: "center" },
  classInfo: {
    fontSize: moderateScale(14),
    color: COLORS.navySoft,
    marginLeft: scaleSize(6),
  },
  placeholderCard: {
    backgroundColor: "#F8FAFD",
    padding: scaleSize(14),
    borderRadius: scaleSize(12),
    borderWidth: 1,
    borderColor: "#E7ECF4",
    borderStyle: "dashed",
  },
  empty: { color: COLORS.navySoft, fontStyle: "italic", fontSize: moderateScale(14) },

  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.orange,
    padding: scaleSize(16),
    borderRadius: scaleSize(12),
    marginTop: verticalScale(20),
  },
  startButtonPressed: {
    opacity: 0.85,
  },
  startButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(16),
    marginRight: scaleSize(8),
  },
});