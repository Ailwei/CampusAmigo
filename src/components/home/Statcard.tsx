import COLORS from "@/constants/color";
import { moderateScale, verticalScale } from "@/utils/responsive";
import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

type Props = {
  icon: React.ReactNode;
  value: number | string;
  label: string;
};

export default function StatCard({ icon, value, label }: Props) {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.card}>
      {icon}
      <Text style={[styles.number, { fontSize: moderateScale(24) }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#fff",
    padding: moderateScale(16),
    borderRadius: 12,
    alignItems: "center",
    minHeight: verticalScale(110),
    justifyContent: "center",
  },
  number: { fontWeight: "700", color: COLORS.blue, marginTop: verticalScale(6) },
  label: { marginTop: verticalScale(4), color: COLORS.navySoft, textAlign: "center" },
});