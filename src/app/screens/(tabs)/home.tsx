import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import COLORS from "@/constants/color";
import { MaterialCommunityIcons, Ionicons, Feather } from "@expo/vector-icons";
import api from "@/utils/api";

export default function Home() {
  const [classes, setClasses] = useState<string[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const res = await api.get("/onboarding/summary");
        if (res.data.success) {
          setClasses(res.data.data.classes || []);
          setTimetable(res.data.data.timetable || []);
        }
      } catch (error: any) {
        Alert.alert("Error", error?.response?.data?.message || "Failed to load summary");
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, []);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todaysClasses = timetable.filter((item) => item.day === today);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.greeting}>Loading your schedule...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Text style={styles.greeting}>Welcome Back Marwa!</Text>
      <Text style={styles.notification}>
        You have {todaysClasses.length} class{todaysClasses.length !== 1 ? "es" : ""} today.
      </Text>

      <View style={styles.statsContainer}>
        <View style={styles.card}>
          <MaterialCommunityIcons name="book-education" size={30} color={COLORS.blue} />
          <Text style={styles.number}>{classes.length}</Text>
          <Text style={styles.label}>Subjects</Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="calendar-outline" size={30} color={COLORS.orange} />
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
                <Text style={styles.subject}>{item.subject}</Text>
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
        <Text style={styles.empty}>No deadlines yet.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Exams</Text>
        <Text style={styles.empty}>No exams scheduled.</Text>
      </View>

      <Pressable style={styles.scheduleButton} onPress={() => router.push("/screens/weeklyTimeTable")}>
        <Ionicons name="calendar" size={22} color="#fff" />
        <Text style={styles.scheduleButtonText}>View Weekly Timetable</Text>
      </Pressable>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgTop, padding: 20 },
  greeting: { fontSize: 28, fontWeight: "800", color: COLORS.navy },
  notification: { marginTop: 8,alignItems:"center", color: COLORS.orange, fontWeight: "600", marginBottom: 20 },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 5,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  number: { fontSize: 28, fontWeight: "700", color: COLORS.blue },
  label: { marginTop: 6, color: COLORS.navySoft },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.blue, marginBottom: 10 },
  classCard: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 10 },
  classHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  subject: { fontSize: 16, fontWeight: "700", color: COLORS.navy, marginLeft: 8 },
  timeRow: { flexDirection: "row", alignItems: "center" },
  time: { marginLeft: 6, color: COLORS.navySoft },
  empty: { color: COLORS.navySoft, fontStyle: "italic" },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
  bannerTitle: { fontSize: 16, fontWeight: "700", color: COLORS.navy },
  bannerText: { fontSize: 13, color: COLORS.navySoft },
  scheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.blue,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  scheduleButtonText: { color: "#fff", fontWeight: "700", fontSize: 16, marginLeft: 8 },
});
