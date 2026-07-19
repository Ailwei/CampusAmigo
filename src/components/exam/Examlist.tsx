import COLORS from "@/constants/color";
import { moderateScale, verticalScale } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ExamCard from "./ExamCard";


type Props = {
  exams: any[];
  getProgress: (subjectName?: string) => number;
};

export default function ExamList({ exams, getProgress }: Props) {
  if (exams.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={60} color="#CBD5E1" />
        <Text style={styles.empty}>No exams found.</Text>
        <Text style={styles.emptySub}>Add your first exam below</Text>
      </View>
    );
  }

  return (
    <>
      {exams.map((exam, index) => {
        const subjectName = typeof exam.subject === "string" ? exam.subject : exam.subject?.name;
        return (
          <ExamCard
            key={exam._id || `${exam.code}-${subjectName}-${exam.date}-${index}`}
            exam={exam}
            progress={getProgress(subjectName)}
          />
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: verticalScale(80) },
  empty: { color: COLORS.navySoft, fontSize: moderateScale(18), fontWeight: "600", marginTop: verticalScale(16) },
  emptySub: { color: "#94A3B8", marginTop: verticalScale(8), fontSize: moderateScale(14) },
});