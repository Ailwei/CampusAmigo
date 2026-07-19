import COLORS from "@/constants/color";
import { countdownColor, daysLeft } from "@/utils/exam";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  assignment: any;
  progress: number;
};

export default function AssignmentCard({ assignment, progress }: Props) {
  const left = daysLeft(assignment.due);
  const subjectName = typeof assignment.subject === "string" ? assignment.subject : assignment.subject?.name;

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => {
          router.push({
            pathname: "/screens/AddAsignmentTasks",
            params: {
              assignmentId: assignment.id || assignment.createdAt,
              title: assignment.title,
              subject: subjectName || "",
              subjectId:
                typeof assignment.subject === "string" ? "" : assignment.subject?._id || assignment.subject?.id || "",
              due: assignment.due,
              progress: String(assignment.progress || 0),
            },
          });
        }}
        style={({ pressed }) => [pressed && { opacity: 0.7 }]}
      >
        <View style={styles.topRow}>
          <View>
            <Text style={styles.subject}>{subjectName}</Text>
            <Text style={styles.title}>{assignment.title}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: countdownColor(left) }]}>
            <Text style={styles.badgeText}>{left <= 0 ? "Due!" : `${left} days`}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#687588" />
          <Text style={styles.info}>{assignment.due}</Text>
        </View>

        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <Text style={styles.progressText}>Revision {progress}%</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: scaleSize(18),
    padding: scaleSize(18),
    marginBottom: verticalScale(18),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(8),
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: verticalScale(10) },
  subject: { fontSize: moderateScale(16), fontWeight: "700", color: COLORS.navy },
  title: { fontSize: moderateScale(14), color: "#7A8599", marginTop: verticalScale(2) },
  badge: { paddingHorizontal: scaleSize(14), paddingVertical: verticalScale(8), borderRadius: scaleSize(20) },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: moderateScale(14) },
  infoRow: { flexDirection: "row", alignItems: "center", marginTop: verticalScale(5) },
  info: { color: "#687588", marginLeft: scaleSize(6), fontSize: moderateScale(14) },
  progressBackground: { height: verticalScale(10), backgroundColor: "#E5E7EB", borderRadius: scaleSize(5), overflow: "hidden", marginTop: verticalScale(18) },
  progressFill: { height: verticalScale(10), backgroundColor: COLORS.blue, borderRadius: scaleSize(5) },
  progressText: { marginTop: verticalScale(8), fontWeight: "600", color: COLORS.navy, fontSize: moderateScale(14) },
});