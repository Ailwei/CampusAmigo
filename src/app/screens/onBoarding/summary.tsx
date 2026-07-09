import COLORS from "@/constants/color";
import { ClassItem, ClassSlot } from "@/context/onboardingContext";
import api from "@/utils/api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { verticalScale, moderateScale, scaleSize } from "@/utils/responsive";
export default function Summary() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [timetable, setTimetable] = useState<ClassSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const res = await api.get("/onboarding/summary");
        if (res.data.success) {
          setClasses(res.data.data.classes || []);
          setTimetable(res.data.data.timetable || []);
        }
        console.log("sumary", res.data.data)
      } catch (error: any) {
        Alert.alert("Error", error?.response?.data?.message || "Failed to load summary");
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, []);

   const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
  const todaysClasses = timetable.filter((item) => item.day.startsWith(today));
 console.log("todays time tbamel", todaysClasses)

  if (loading) {
    return (
      <View style={styles.container}>
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
      <Text style={styles.subtitle}>Here’s a summary of your Student Diary.</Text>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="book-education" size={22} color={COLORS.blue} />
          <Text style={styles.sectionTitle}>Subjects</Text>
        </View>
        {classes.length === 0 ? (
          <Text style={styles.empty}>No subjects added.</Text>
        ) : (
          classes.map((subject, index) => (
            <View key={index} style={styles.subjectCard}>
              <Ionicons name="book-outline" size={20} color={COLORS.navySoft} />
              <Text style={styles.subjectText}>
                {subject.name} {subject.code || ""}
              </Text>

            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={22} color={COLORS.blue} />
          <Text style={styles.sectionTitle}>Today's Timetable</Text>
        </View>
        {todaysClasses.length === 0 ? (
          <Text style={styles.empty}>No classes scheduled.</Text>
        ) : (
          todaysClasses.map((item, index) => (
            <View key={index} style={styles.classCard}>
              <Text style={styles.classSubject}>
                {item.subject.name} {item.subject.code || ""}
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
          <Ionicons name="document-text-outline" size={22} color={COLORS.blue} />
          <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
        </View>
        <View style={styles.placeholderCard}>
          <Text style={styles.empty}>No deadlines added yet.</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="school-outline" size={22} color={COLORS.blue} />
          <Text style={styles.sectionTitle}>Exam Countdown</Text>
        </View>
        <View style={styles.placeholderCard}>
          <Text style={styles.empty}>No exams scheduled.</Text>
        </View>
      </View>

      <Pressable
        style={styles.startButton}
        onPress={() => router.replace("/screens/(tabs)/home")}
      >
        <Ionicons name="rocket-outline" size={22} color="#fff" />
        <Text style={styles.startButtonText}>Start Using CampusAmigo</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgTop },
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
    marginBottom: verticalScale(12),
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
    elevation: 1,
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
    elevation: 1,
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
    backgroundColor: "#fff",
    padding: scaleSize(14),
    borderRadius: scaleSize(12),
  },
  empty: { color: COLORS.navySoft, fontStyle: "italic", fontSize: moderateScale(14) },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.blue,
    padding: scaleSize(16),
    borderRadius: scaleSize(12),
    marginTop: verticalScale(20),
  },
  startButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(16),
    marginLeft: scaleSize(8),
  },
});