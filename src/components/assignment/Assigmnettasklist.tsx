import COLORS from "@/constants/color";
import { TaskGroup } from "@/utils/Assignmenttasks";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, StyleSheet, Text, View } from "react-native";
import AssignmentTaskCard from "./AssigmnetCard";

type ToggleArgs = { taskId: string | undefined; createdAt: number; topicIndex: number; topicName: string; currentProgress: number };

type Props = {
  data: TaskGroup[];
  fallbackSubject?: string;
  assignmentDateStr: string | null;
  daysToAssignment: number | null;
  onToggleComplete: (args: ToggleArgs) => void;
  onSlideChange: (taskId: string | undefined, createdAt: number, topicIndex: number, value: number) => void;
  onSlideComplete: (taskId: string | undefined, createdAt: number, topicIndex: number, topicName: string, value: number) => void;
};

export default function AssignmentTaskList({
  data,
  fallbackSubject,
  assignmentDateStr,
  daysToAssignment,
  onToggleComplete,
  onSlideChange,
  onSlideComplete,
}: Props) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.key}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={80} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No revisions found</Text>
          <Text style={styles.emptySubtitle}>Tap the + button below</Text>
        </View>
      }
      renderItem={({ item: group }) => (
        <AssignmentTaskCard
          group={group}
          fallbackSubject={fallbackSubject}
          assignmentDateStr={assignmentDateStr}
          daysToAssignment={daysToAssignment}
          onToggleComplete={onToggleComplete}
          onSlideChange={onSlideChange}
          onSlideComplete={onSlideComplete}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: scaleSize(20), paddingBottom: verticalScale(100) },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: verticalScale(100) },
  emptyTitle: { fontSize: moderateScale(20), fontWeight: "600", color: COLORS.navy, marginTop: verticalScale(20) },
  emptySubtitle: { color: "#94A3B8", textAlign: "center", marginTop: 8 },
});