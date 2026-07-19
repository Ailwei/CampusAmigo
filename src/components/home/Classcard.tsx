import COLORS from "@/constants/color";
import { ClassSlot } from "@/context/onboardingContext";
import { getClassStatus, statusLabel } from "../../utils/usetodaySchedule";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  item: ClassSlot;
  nowMinutes: number;
};

const statusColor = (status: ReturnType<typeof getClassStatus>) => {
  if (status === "now") return COLORS.green;
  if (status === "soon") return "#D97706";
  return COLORS.blue;
};

export default function ClassCard({ item, nowMinutes }: Props) {
  const status = getClassStatus(item, nowMinutes);
  const color = statusColor(status);

  return (
    <View style={styles.classCard}>
      <View style={[styles.classAccentBar, { backgroundColor: color }]} />
      <View style={[styles.classIconCircle, { backgroundColor: `${color}22` }]}>
        <MaterialCommunityIcons name="book-open-page-variant" size={20} color={color} />
      </View>
      <View style={styles.classInfo}>
        <Text style={styles.subject} numberOfLines={1}>
          {item.subject?.name}
        </Text>
        <Text style={styles.subjectCode} numberOfLines={1}>
          {item.subject?.code}
        </Text>
        <View style={styles.timeRow}>
          <Feather name="clock" size={14} color={COLORS.navySoft} />
          <Text style={styles.time}>
            {item.startTime} - {item.endTime}
          </Text>
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: color }]}>
        <Text style={styles.statusBadgeText}>{statusLabel(item, status, nowMinutes)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  classCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: scaleSize(14),
    overflow: "hidden",
    paddingVertical: moderateScale(14),
    paddingRight: moderateScale(14),
    marginBottom: verticalScale(10),
    minHeight: verticalScale(78),
  },
  classAccentBar: { width: scaleSize(5), alignSelf: "stretch", marginRight: scaleSize(12) },
  classIconCircle: {
    width: scaleSize(36),
    height: scaleSize(36),
    borderRadius: scaleSize(18),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scaleSize(12),
  },
  classInfo: { flex: 1 },
  subjectCode: { fontSize: moderateScale(12), color: COLORS.navySoft, marginTop: verticalScale(1) },
  statusBadge: {
    borderRadius: scaleSize(10),
    paddingVertical: verticalScale(5),
    paddingHorizontal: scaleSize(8),
    alignItems: "center",
    justifyContent: "center",
    minWidth: scaleSize(52),
  },
  statusBadgeText: { fontSize: moderateScale(11), fontWeight: "800", color: "#fff" },
  subject: { fontSize: moderateScale(15), fontWeight: "700", color: COLORS.navy },
  timeRow: { flexDirection: "row", alignItems: "center", marginTop: verticalScale(5) },
  time: { marginLeft: scaleSize(6), color: COLORS.navySoft, fontSize: moderateScale(12), flexShrink: 1 },
});