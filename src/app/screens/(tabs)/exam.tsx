import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/color";

const exams = [
  { subject: "Biology", code: "BIO101", date: "2026-07-08", venue: "Hall A", progress: 40 },
  { subject: "Economics", code: "ECO202", date: "2026-07-15", venue: "Room B12", progress: 75 },
  { subject: "Chemistry", code: "CHE103", date: "2026-07-28", venue: "Science Block", progress: 20 },
];

const daysLeft = (date: string) => {
  const today = new Date();
  const examDate = new Date(date);
  const diff = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff < 0 ? 0 : diff;
};


const countdownColor = (days: number) => {
  if (days <= 3) return "#EF4444";
  if (days <= 7) return "#F97316";
  return "#10B981";
};

export default function ExamsScreen() {
  const sorted = [...exams].sort((a, b) => daysLeft(a.date) - daysLeft(b.date));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Upcoming Exams</Text>

      {sorted.map((exam) => {
        const left = daysLeft(exam.date);

        return (
          <View key={exam.code} style={styles.card}>
            <View style={styles.topRow}>
              <View>
                <Text style={styles.subject}>{exam.subject}</Text>
                <Text style={styles.code}>{exam.code}</Text>
              </View>

              <View style={[styles.badge, { backgroundColor: countdownColor(left) }]}>
                <Text style={styles.badgeText}>{left} days</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color="#687588" style={styles.icon} />
              <Text style={styles.info}>{exam.date}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="#687588" style={styles.icon} />
              <Text style={styles.info}>{exam.venue}</Text>
            </View>

            <View style={styles.progressBackground}>
              <View style={[styles.progressFill, { width: `${exam.progress}%` }]} />
            </View>

            <Text style={styles.progressText}>Revision {exam.progress}%</Text>
          </View>
        );
      })}

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>+ Add Exam</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FC", padding: 20 },
  heading: { fontSize: 26, fontWeight: "800", color: COLORS.navy, marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  subject: { fontSize: 18, fontWeight: "700", color: COLORS.navy },
  code: { color: "#7A8599", marginTop: 2 },
  badge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  badgeText: { color: "#fff", fontWeight: "700" },
  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  icon: { marginRight: 6 },
  info: { color: "#687588" },
  progressBackground: { height: 10, backgroundColor: "#E5E7EB", borderRadius: 5, overflow: "hidden", marginTop: 18 },
  progressFill: { height: 10, backgroundColor: COLORS.blue, borderRadius: 5 },
  progressText: { marginTop: 8, fontWeight: "600", color: COLORS.navy },
  button: { marginTop: 20, backgroundColor: COLORS.blue, borderRadius: 14, padding: 16, alignItems: "center", marginBottom: 30 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
