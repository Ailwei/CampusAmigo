import DeadlineList from "@/components/deadline-list";
import ExamList from "@/components/exam-list";
import COLORS from "@/constants/color";
import { ClassItem, ClassSlot } from "@/context/onboardingContext";
import api from "@/utils/api";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";


export default function Home() {
  const { width } = useWindowDimensions();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [timetable, setTimetable] = useState<ClassSlot[]>([]);

  const [loading, setLoading] = useState(true);
  const isCompact = width < 380;

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const res = await api.get("/onboarding/summary");
        console.log(res.data.data)
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


  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.greeting}>...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Text style={styles.greeting}>Welcome Back Ailwei</Text>
      <Text style={styles.notification}>
        You have {todaysClasses.length} class{todaysClasses.length !== 1 ? "es" : ""} today.
      </Text>

      <View style={[styles.statsContainer, isCompact && styles.statsContainerCompact]}>
        <View style={styles.card}>
          <MaterialCommunityIcons name="book-education" size={moderateScale(28, 0.4, width)} color={COLORS.blue} />
          <Text style={styles.number}>{classes.length}</Text>
          <Text style={styles.label}>Subjects</Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="calendar-outline" size={moderateScale(28, 0.4, width)} color={COLORS.orange} />
          <Text style={styles.number}>{timetable.length}</Text>
          <Text style={styles.label}>Classes</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Classes</Text>
        {todaysClasses.length === 0 ? (
          <Text style={styles.empty}>No classes today</Text>
        ) : (
          todaysClasses.map((item, index) => (
            <View key={index} style={styles.classCard}>
              <View style={styles.classHeader}>
                <MaterialCommunityIcons name="book-open-page-variant" size={20} color={COLORS.blue} />
                <Text style={styles.subject}>
                  {item.subject.name}     {item.subject.code}
                </Text>

              </View>
              <View style={styles.timeRow}>
                <Feather name="clock" size={16} color={COLORS.navySoft} />
                <Text style={styles.time}>{item.startTime} - {item.endTime}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.banner}>
        <Ionicons name="notifications-outline" size={22} color={COLORS.orange} />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.bannerTitle}>Today's Schedule</Text>
          <Text style={styles.bannerText}>
            You have {todaysClasses.length} class{todaysClasses.length !== 1 ? "es" : ""} today.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
        <DeadlineList />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Exams</Text>
        <ExamList />
      </View>

      <Pressable style={styles.scheduleButton} onPress={() => router.push("/screens/weeklyTimeTable")}>
        <Ionicons name="calendar" size={22} color="#fff" />
        <Text style={styles.scheduleButtonText}>View Weekly Timetable</Text>
      </Pressable>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgTop, paddingHorizontal: scaleSize(20), paddingTop: verticalScale(20), paddingBottom: verticalScale(24) },
  greeting: { fontSize: moderateScale(28), fontWeight: "800", color: COLORS.navy, textAlign: "center" },
  notification: { marginTop: verticalScale(8), alignItems: "center", color: COLORS.orange, fontWeight: "600", marginBottom: verticalScale(20), textAlign: "center" },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: verticalScale(25), gap: scaleSize(10) },
  statsContainerCompact: { flexDirection: "column" },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    padding: moderateScale(16),
    borderRadius: scaleSize(12),
    alignItems: "center",
    minHeight: verticalScale(110),
    justifyContent: "center",
  },
  number: { fontSize: moderateScale(24), fontWeight: "700", color: COLORS.blue, marginTop: verticalScale(6) },
  label: { marginTop: verticalScale(4), color: COLORS.navySoft, textAlign: "center" },
  section: { marginBottom: verticalScale(24) },
  sectionTitle: { fontSize: moderateScale(18), fontWeight: "700", color: COLORS.blue, marginBottom: verticalScale(10) },
  classCard: { backgroundColor: "#fff", padding: moderateScale(14), borderRadius: scaleSize(12), marginBottom: verticalScale(10) },
  classHeader: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(6) },
  subject: { fontSize: moderateScale(15), fontWeight: "700", color: COLORS.navy, marginLeft: scaleSize(8), flexShrink: 1 },
  timeRow: { flexDirection: "row", alignItems: "center" },
  time: { marginLeft: scaleSize(6), color: COLORS.navySoft, flexShrink: 1 },
  empty: { color: COLORS.navySoft, fontStyle: "italic" },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: moderateScale(14),
    borderRadius: scaleSize(12),
    marginBottom: verticalScale(24),
  },
  bannerTitle: { fontSize: moderateScale(15), fontWeight: "700", color: COLORS.navy },
  bannerText: { fontSize: moderateScale(13), color: COLORS.navySoft, marginTop: verticalScale(2) },
  scheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.blue,
    borderRadius: scaleSize(14),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scaleSize(16),
    marginTop: verticalScale(10),
  },
  scheduleButtonText: { color: "#fff", fontWeight: "700", fontSize: moderateScale(15), marginLeft: scaleSize(8) },
});
