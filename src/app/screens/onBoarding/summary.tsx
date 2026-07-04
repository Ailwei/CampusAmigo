import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import COLORS from "@/constants/color";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import api from "@/utils/api";

export default function Summary() {
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


  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading your summary...</Text>
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
              <Text style={styles.subjectText}>{subject}</Text>
            </View>
          ))
        )}
      </View>

      {/* Timetable */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={22} color={COLORS.blue} />
          <Text style={styles.sectionTitle}>Weekly Timetable</Text>
        </View>
        {timetable.length === 0 ? (
          <Text style={styles.empty}>No classes scheduled.</Text>
        ) : (
          timetable.map((item, index) => (
            <View key={index} style={styles.classCard}>
              <Text style={styles.classSubject}>{item.subject}</Text>
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

      {/* Deadlines placeholder */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="document-text-outline" size={22} color={COLORS.blue} />
          <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
        </View>
        <View style={styles.placeholderCard}>
          <Text style={styles.empty}>No deadlines added yet.</Text>
        </View>
      </View>

      {/* Exams placeholder */}
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
  content: { padding: 24, paddingBottom: 50 },
  title: { fontSize: 28, fontWeight: "800", color: COLORS.navy },
  subtitle: { marginTop: 8, marginBottom: 24, fontSize: 15, color: COLORS.navySoft },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.blue, marginLeft: 8 },
  subjectCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  subjectText: { fontSize: 16, fontWeight: "600", color: COLORS.navy, marginLeft: 8 },
  classCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  classSubject: { fontSize: 16, fontWeight: "700", color: COLORS.navy, marginBottom: 6 },
  classInfoRow: { flexDirection: "row", alignItems: "center" },
  classInfo: { fontSize: 14, color: COLORS.navySoft, marginLeft: 6 },
  placeholderCard: { backgroundColor: "#fff", padding: 14, borderRadius: 12 },
  empty: { color: COLORS.navySoft, fontStyle: "italic" },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.blue,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  startButtonText: { color: "#fff", fontWeight: "700", fontSize: 16, marginLeft: 8 },
});
