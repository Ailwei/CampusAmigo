import COLORS from "@/constants/color";
import { dueBannerColors } from "@/utils/Assignmenttasks";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title?: string;
  subject?: string;
  onBack: () => void;
  assignmentDateStr: string | null;
  daysToAssignment: number | null;
  assignmentProgress: { done: number; total: number } | null;
};

export default function AssignmentTaskHeader({
  title,
  subject,
  onBack,
  assignmentDateStr,
  daysToAssignment,
  assignmentProgress,
}: Props) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.backRow} onPress={onBack} hitSlop={8}>
        <Ionicons name="arrow-back" size={22} color={COLORS.navy} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.title}>{title || "Assignment"}</Text>
          <Text style={styles.breadcrumb}>{subject || "Subject"}</Text>
        </View>
      </Pressable>

      {assignmentDateStr && daysToAssignment !== null && assignmentProgress && (
        <View style={[styles.examBanner, { backgroundColor: dueBannerColors(daysToAssignment).bg }]}>
          <Text style={[styles.examBannerText, { color: dueBannerColors(daysToAssignment).text }]}>
            {daysToAssignment <= 0 ? "Assigment  is due today" : `Due in ${daysToAssignment}d`}
          </Text>
          <Text style={[styles.examBannerText, { color: dueBannerColors(daysToAssignment).text }]}>
            {assignmentProgress.done}/{assignmentProgress.total} done
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: scaleSize(20), paddingBottom: verticalScale(10) },
  backRow: { flexDirection: "row", alignItems: "center" },
  breadcrumb: { fontSize: moderateScale(13), color: "#94A3B8", fontWeight: "600" },
  title: { fontSize: moderateScale(24), fontWeight: "800", color: COLORS.navy },
  examBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: scaleSize(12),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scaleSize(14),
    marginTop: verticalScale(14),
  },
  examBannerText: { fontSize: moderateScale(14), fontWeight: "700" },
});