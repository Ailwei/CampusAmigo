import COLORS from "@/constants/color";
import { ClassSlot } from "@/context/onboardingContext";
import { moderateScale, verticalScale } from "@/utils/responsive";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ClassCard from "./Classcard";

type Props = {
  todaysClasses: ClassSlot[];
  relevantClasses: ClassSlot[];
  nowMinutes: number;
};

export default function TodayClassList({ todaysClasses, relevantClasses, nowMinutes }: Props) {
  if (todaysClasses.length === 0) {
    return <Text style={styles.empty}>No classes today</Text>;
  }

  if (relevantClasses.length === 0) {
    return (
      <View style={styles.doneCard}>
        <MaterialCommunityIcons name="check-circle-outline" size={28} color={COLORS.green} />
        <Text style={styles.doneText}>You're done for today!</Text>
      </View>
    );
  }

  return (
    <>
      {relevantClasses.map((item, index) => (
        <ClassCard key={index} item={item} nowMinutes={nowMinutes} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  empty: { color: COLORS.navySoft, fontStyle: "italic", textAlign: "center" },
  doneCard: { backgroundColor: "#fff", padding: moderateScale(18), borderRadius: 12, alignItems: "center" },
  doneText: { fontSize: moderateScale(14), fontWeight: "700", color: COLORS.navy, marginTop: verticalScale(6) },
});