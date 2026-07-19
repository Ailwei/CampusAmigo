import COLORS from "@/constants/color";
import { ClassSlot } from "@/context/onboardingContext";
import { moderateScale, verticalScale } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  todaysClassCount: number;
  currentClass?: ClassSlot;
  nextClass?: ClassSlot;
};

export default function ScheduleBanner({ todaysClassCount, currentClass, nextClass }: Props) {
  const message =
    todaysClassCount === 0
      ? "No classes today — enjoy the free time."
      : currentClass
      ? `Now: ${currentClass.subject?.name} until ${currentClass.endTime}`
      : nextClass
      ? `Next up: ${nextClass.subject?.name} at ${nextClass.startTime}`
      : "You're done for today — nice work.";

  return (
    <View style={styles.banner}>
      <Ionicons name="notifications-outline" size={22} color={COLORS.orange} />
      <Text style={styles.bannerTitle}>Today's Schedule</Text>
      <Text style={styles.bannerText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { alignItems: "center", backgroundColor: "#fff", padding: moderateScale(14), borderRadius: 12, marginBottom: verticalScale(24) },
  bannerTitle: { fontSize: moderateScale(15), fontWeight: "700", color: COLORS.navy, marginTop: verticalScale(6), textAlign: "center" },
  bannerText: { fontSize: moderateScale(13), color: COLORS.navySoft, marginTop: verticalScale(2), textAlign: "center" },
});