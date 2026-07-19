import COLORS from "@/constants/color";
import { moderateScale, verticalScale } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AssignmentCard from "./Assigmentcard";

type Props = {
  assignments: any[];
  getProgress: (assignmentId?: string) => number;
};

export default function AssignmentsList({ assignments, getProgress }: Props) {
  if (assignments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="clipboard-outline" size={60} color="#CBD5E1" />
        <Text style={styles.empty}>No assignments found.</Text>
        <Text style={styles.emptySub}>Add your first assignment below</Text>
      </View>
    );
  }

  return (
    <>
      {assignments.map((assignment, index) => (
        <AssignmentCard
          key={assignment._id || assignment.createdAt || index}
          assignment={assignment}
          progress={getProgress(assignment.id)}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: verticalScale(80) },
  empty: { color: COLORS.navySoft, fontSize: moderateScale(18), fontWeight: "600", marginTop: verticalScale(16) },
  emptySub: { color: "#94A3B8", marginTop: verticalScale(8), fontSize: moderateScale(14) },
});