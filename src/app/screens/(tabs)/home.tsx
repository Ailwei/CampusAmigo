import DeadlineList from "@/components/deadline-list";
import ExamList from "@/components/exam-list";
import COLORS from "@/constants/color";
import { ClassItem, ClassSlot } from "@/context/onboardingContext";
import { useUser } from "@/context/userContext";
import api from "@/utils/api";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function Home() {
  const { width } = useWindowDimensions();
  const { user, loading: userLoading } = useUser();
  const [subjects, setSubjects] = useState<ClassItem[]>([]);
  const [timetable, setTimetable] = useState<ClassSlot[]>([]);

  const [loading, setLoading] = useState(true);
  const isCompact = width < 380;

  const loadSummary = async () => {
  try {
    setLoading(true);

    const res = await api.get("/timetable/summary");

    if (res.data.success) {
      setSubjects(res.data.data.subjects || []);
      setTimetable(res.data.data.timetable || []);
    }
  } catch (error: any) {
    Alert.alert(
      "Error",
      error?.response?.data?.message || "Failed to load summary"
    );
  } finally {
    setLoading(false);
  }
};

useFocusEffect(
  useCallback(() => {
    loadSummary();
  }, [])
);

  const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
  const todaysClasses = timetable.filter((item) => item.day.startsWith(today));

  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const upcomingClasses = [...todaysClasses]
    .filter((item) => toMinutes(item.startTime) > nowMinutes)
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  const nextClass = upcomingClasses[0];


  const relevantClasses = [...todaysClasses]
    .filter((item) => toMinutes(item.endTime) > nowMinutes)
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  const currentClass = relevantClasses.find(
    (item) => toMinutes(item.startTime) <= nowMinutes && toMinutes(item.endTime) > nowMinutes
  );

  type ClassStatus = "now" | "soon" | "later";

  const getClassStatus = (item: ClassSlot): ClassStatus => {
    const start = toMinutes(item.startTime);
    const end = toMinutes(item.endTime);
    if (start <= nowMinutes && nowMinutes < end) return "now";
    if (start - nowMinutes <= 30) return "soon";
    return "later";
  };

  const statusColor = (status: ClassStatus) => {
    if (status === "now") return COLORS.green;
    if (status === "soon") return "#D97706";
    return COLORS.blue;
  };

  const statusLabel = (item: ClassSlot, status: ClassStatus) => {
    if (status === "now") return "NOW";
    if (status === "soon") return `IN ${toMinutes(item.startTime) - nowMinutes}M`;
    return item.startTime;
  };


 if (loading || userLoading) {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>...</Text>
    </View>
  );
}

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Text style={styles.greeting}>Welcome Back, {user?.firstName || user?.name}</Text>
      <Text style={styles.notification}>
        You have {todaysClasses.length} class{todaysClasses.length !== 1 ? "es" : ""} today.
      </Text>

      <View style={[styles.statsContainer, isCompact && styles.statsContainerCompact]}>
        <View style={styles.card}>
          <MaterialCommunityIcons name="book-education" size={moderateScale(28, 0.4, width)} color={COLORS.blue} />
          <Text style={styles.number}>{subjects.length}</Text>
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
        ) : relevantClasses.length === 0 ? (
          <View style={styles.doneCard}>
            <MaterialCommunityIcons name="check-circle-outline" size={28} color={COLORS.green} />
            <Text style={styles.doneText}>You're done for today!</Text>
          </View>
        ) : (
          relevantClasses.map((item, index) => {
            const status = getClassStatus(item);
            const color = statusColor(status);
            return (
              <View key={index} style={styles.classCard}>
                <View style={[styles.classAccentBar, { backgroundColor: color }]} />
                <View style={[styles.classIconCircle, { backgroundColor: `${color}22` }]}>
                  <MaterialCommunityIcons name="book-open-page-variant" size={20} color={color} />
                </View>
                <View style={styles.classInfo}>
                  <Text style={styles.subject} numberOfLines={1}>
                    {item.subject?.name}
                  </Text>
                  <Text style={styles.subjectCode} numberOfLines={1}>
                    {item.subject?.code}
                  </Text>
                  <View style={styles.timeRow}>
                    <Feather name="clock" size={14} color={COLORS.navySoft} />
                    <Text style={styles.time}>{item.startTime} - {item.endTime}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: color }]}>
                  <Text style={styles.statusBadgeText}>{statusLabel(item, status)}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.banner}>
        <Ionicons name="notifications-outline" size={22} color={COLORS.orange} />
        <Text style={styles.bannerTitle}>Today's Schedule</Text>
        <Text style={styles.bannerText}>
          {todaysClasses.length === 0
            ? "No classes today — enjoy the free time."
            : currentClass
              ? `Now: ${currentClass.subject?.name} until ${currentClass.endTime}`
              : nextClass
                ? `Next up: ${nextClass.subject?.name} at ${nextClass.startTime}`
                : "You're done for today — nice work."}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
        <DeadlineList />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Exams</Text>
        <ExamList />
      </View>

      <Pressable style={styles.scheduleButton} onPress={() => router.push("/screens/weekleySchedule")}>
        <Ionicons name="calendar" size={22} color="#fff" />
        <Text style={styles.scheduleButtonText}>View Weekly Timetable</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgTop, paddingHorizontal: scaleSize(20), paddingTop: verticalScale(20), paddingBottom: verticalScale(24) },
  greeting: { fontSize: moderateScale(20), fontWeight: "800", color: COLORS.navy, textAlign: "center" },
  notification: { marginTop: verticalScale(8), color: COLORS.orange, fontWeight: "600", marginBottom: verticalScale(20), textAlign: "center" },
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
  sectionTitle: { fontSize: moderateScale(18), fontWeight: "700", color: COLORS.blue, marginBottom: verticalScale(10), textAlign: "center" },
  classCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: scaleSize(14),
    overflow: "hidden",
    paddingVertical: moderateScale(14),
    paddingRight: moderateScale(14),
    marginBottom: verticalScale(10),
    minHeight: verticalScale(78),
  },
  classAccentBar: {
    width: scaleSize(5),
    alignSelf: "stretch",
    marginRight: scaleSize(12),
  },
  classIconCircle: {
    width: scaleSize(36),
    height: scaleSize(36),
    borderRadius: scaleSize(18),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scaleSize(12),
  },
  classInfo: { flex: 1 },
  subjectCode: { fontSize: moderateScale(12), color: COLORS.navySoft, marginTop: verticalScale(1) },
  statusBadge: {
    borderRadius: scaleSize(10),
    paddingVertical: verticalScale(5),
    paddingHorizontal: scaleSize(8),
    alignItems: "center",
    justifyContent: "center",
    minWidth: scaleSize(52),
  },
  statusBadgeText: { fontSize: moderateScale(11), fontWeight: "800", color: "#fff" },
  subject: { fontSize: moderateScale(15), fontWeight: "700", color: COLORS.navy },
  timeRow: { flexDirection: "row", alignItems: "center", marginTop: verticalScale(5) },
  time: { marginLeft: scaleSize(6), color: COLORS.navySoft, fontSize: moderateScale(12), flexShrink: 1 },
  empty: { color: COLORS.navySoft, fontStyle: "italic", textAlign: "center" },
  doneCard: {
    backgroundColor: "#fff",
    padding: moderateScale(18),
    borderRadius: scaleSize(12),
    alignItems: "center",
  },
  doneText: { fontSize: moderateScale(14), fontWeight: "700", color: COLORS.navy, marginTop: verticalScale(6) },
  banner: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: moderateScale(14),
    borderRadius: scaleSize(12),
    marginBottom: verticalScale(24),
  },
  bannerTitle: { fontSize: moderateScale(15), fontWeight: "700", color: COLORS.navy, marginTop: verticalScale(6), textAlign: "center" },
  bannerText: { fontSize: moderateScale(13), color: COLORS.navySoft, marginTop: verticalScale(2), textAlign: "center" },
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