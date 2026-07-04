import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/color";

const assignments = [
  { title: "Essay on Shakespeare", subject: "Literature", due: "2026-07-03", progress: 70 },
  { title: "Math Homework", subject: "Mathematics", due: "2026-07-12", progress: 45 },
  { title: "Group Presentation", subject: "History", due: "2026-07-16", progress: 20 },
];

const daysLeft = (date: string) => {
  const today = new Date();
  const dueDate = new Date(date);
  return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const countdownColor = (days: number) => {
  if (days <= 1) return "#EF4444"; // red if due today/tomorrow
  if (days <= 5) return "#F97316"; // orange if due soon
  return "#10B981"; // green if still time
};

export default function AssignmentsScreen() {
  const sorted = [...assignments].sort((a, b) => daysLeft(a.due) - daysLeft(b.due));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Upcoming Assignments</Text>

      {sorted.map((item) => {
        const left = daysLeft(item.due);

        return (
          <View key={item.title} style={styles.card}>
            <View style={styles.topRow}>
              <View>
                <Text style={styles.subject}>{item.subject}</Text>
                <Text style={styles.title}>{item.title}</Text>
              </View>

              <View style={[styles.badge, { backgroundColor: countdownColor(left) }]}>
                <Text style={styles.badgeText}>{left <= 0 ? "Due!" : `${left} days`}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color="#687588" style={styles.icon} />
              <Text style={styles.info}>{item.due}</Text>
            </View>

            <View style={styles.progressBackground}>
              <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
            </View>

            <Text style={styles.progressText}>Progress {item.progress}%</Text>
          </View>
        );
      })}

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>+ Add Assignment</Text>
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
  subject: { fontSize: 16, fontWeight: "700", color: COLORS.navy },
  title: { fontSize: 14, color: "#7A8599", marginTop: 2 },
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
