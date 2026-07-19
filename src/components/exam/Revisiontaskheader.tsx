import COLORS from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { dueBannerColors } from "@/utils/RevisionTasks";

type Props = {
  subjectId?: string;
  examSubjectStr: string;
  onBack: () => void;
  examDateStr: string | null;
  daysToExam: number | null;
  examProgress: { done: number; total: number } | null;
};

export default function RevisionTaskHeader({
  subjectId,
  examSubjectStr,
  onBack,
  examDateStr,
  daysToExam,
  examProgress,
}: Props) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.backRow} onPress={onBack} hitSlop={8}>
        <Ionicons name="arrow-back" size={22} color={COLORS.navy} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.breadcrumb}>{typeof subjectId === "string" ? "Exams Tasks" : "Home"}</Text>
          <Text style={styles.title}>
            {typeof subjectId === "string" ? (examSubjectStr || subjectId) : "Revisions"}
          </Text>
        </View>
      </Pressable>

      {examDateStr && daysToExam !== null && examProgress && (
        <View style={[styles.examBanner, { backgroundColor: dueBannerColors(daysToExam).bg }]}>
          <Text style={[styles.examBannerText, { color: dueBannerColors(daysToExam).text }]}>
            {daysToExam <= 0 ? "Exam is today" : `Exam in ${daysToExam}d`}
          </Text>
          <Text style={[styles.examBannerText, { color: dueBannerColors(daysToExam).text }]}>
            {examProgress.done}/{examProgress.total} done
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, paddingBottom: 10 },
  backRow: { flexDirection: "row", alignItems: "center" },
  breadcrumb: { fontSize: 13, color: "#94A3B8", fontWeight: "600" },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.navy },
  examBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  examBannerText: { fontSize: 14, fontWeight: "700" },
});