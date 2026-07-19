import ScheduleBanner from "@/components/home/ScheduleBanner";
import AssignmentDeadlineList from "@/components/assignment/assigmnet-deadline-list";
import ExamDates from "@/components/exam/exam-dates";
import COLORS from "@/constants/color";
import { ClassItem, ClassSlot } from "@/context/onboardingContext";
import { useUser } from "@/context/userContext";
import api from "@/utils/api";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useTodaySchedule } from "@/utils/usetodaySchedule";
import StatCard from "@/components/home/Statcard";
import TodayClassList from "@/components/home/Todayclasslist";

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
      Alert.alert("Error", error?.response?.data?.message || "Failed to load summary");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSummary();
    }, [])
  );

  const { nowMinutes, todaysClasses, relevantClasses, currentClass, nextClass } = useTodaySchedule(timetable);

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
        <StatCard
          icon={<MaterialCommunityIcons name="book-education" size={moderateScale(28, 0.4, width)} color={COLORS.blue} />}
          value={subjects.length}
          label="Subjects"
        />
        <StatCard
          icon={<Ionicons name="calendar-outline" size={moderateScale(28, 0.4, width)} color={COLORS.orange} />}
          value={timetable.length}
          label="Classes"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Classes</Text>
        <TodayClassList todaysClasses={todaysClasses} relevantClasses={relevantClasses} nowMinutes={nowMinutes} />
      </View>

      <ScheduleBanner todaysClassCount={todaysClasses.length} currentClass={currentClass} nextClass={nextClass} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
        <AssignmentDeadlineList />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Exams</Text>
        <ExamDates />
      </View>

      <Pressable style={styles.scheduleButton} onPress={() => router.push("/screens/weeklySchedule")}>
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
  section: { marginBottom: verticalScale(24) },
  sectionTitle: { fontSize: moderateScale(18), fontWeight: "700", color: COLORS.blue, marginBottom: verticalScale(10), textAlign: "center" },
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