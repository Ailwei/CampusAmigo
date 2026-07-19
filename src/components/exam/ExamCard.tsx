import COLORS from "@/constants/color";
import { countdownColor, daysLeft, truncateName } from "@/utils/exam";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  exam: any;
  progress: number;
};

export default function ExamCard({ exam, progress }: Props) {
  const left = daysLeft(exam.date);
  const subjectName = typeof exam.subject === "string" ? exam.subject : exam.subject?.name;

  return (
    <Pressable
      onPress={() => {
        router.push({
          pathname: "/screens/addRevision",
          params: {
            examId: exam.id,
            subject: subjectName,
            subjectId: exam.subjectId,
            examDate: exam.date,
            venue: exam.venue,
          },
        });
      }}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.topRow}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.subjectRow}>
            <Text style={styles.subject} numberOfLines={1} ellipsizeMode="tail">
              {truncateName(subjectName)}
            </Text>
          </View>

          {!!exam.subject?.code && (
            <View style={styles.codeRow}>
              <Text style={styles.code}>{exam.subject.code}</Text>
            </View>
          )}

          {!!exam.code && (
            <View style={styles.codeRow}>
              <Ionicons name="barcode-outline" size={13} color="#7A8599" />
              <Text style={styles.code}>{exam.code}</Text>
            </View>
          )}
        </View>

        <View style={[styles.badge, { backgroundColor: countdownColor(left) }]}>
          <Text style={styles.badgeText}>{left === 0 ? "Today" : `${left} days`}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={16} color="#687588" />
        <Text style={styles.info}>{exam.date}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={16} color="#687588" />
        <Text style={styles.info}>{exam.venue || "No venue"}</Text>
      </View>

      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <Text style={styles.progressText}>Revision {progress}%</Text>
    </Pressable>
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
  subjectRow: { flexDirection: "row", alignItems: "center", gap: scaleSize(6), minWidth: 0 },
  codeRow: { flexDirection: "row", alignItems: "center", gap: scaleSize(4), marginTop: verticalScale(4) },
  subject: { fontSize: moderateScale(18), fontWeight: "700", color: COLORS.navy, flexShrink: 1 },
  code: { color: "#7A8599", fontSize: moderateScale(14) },
  badge: { paddingHorizontal: scaleSize(14), paddingVertical: verticalScale(8), borderRadius: scaleSize(20) },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: moderateScale(14) },
  infoRow: { flexDirection: "row", alignItems: "center", marginTop: verticalScale(5) },
  info: { color: "#687588", marginLeft: scaleSize(6), fontSize: moderateScale(14) },
  progressBackground: { height: verticalScale(10), backgroundColor: "#E5E7EB", borderRadius: scaleSize(5), overflow: "hidden", marginTop: verticalScale(18) },
  progressFill: { height: verticalScale(10), backgroundColor: COLORS.blue, borderRadius: scaleSize(5) },
  progressText: { marginTop: verticalScale(8), fontWeight: "600", color: COLORS.navy, fontSize: moderateScale(14) },
});