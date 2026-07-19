import COLORS from "@/constants/color";
import { TaskGroup, daysUntil, dueColor } from "@/utils/Assignmenttasks"
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import AssignmentTopicRow from "./Assignmenttopicrow";

type Props = {
  group: TaskGroup;
  fallbackSubject?: string;
  assignmentDateStr: string | null;
  daysToAssignment: number | null;
  onToggleComplete: (topicId: { taskId: string | undefined; createdAt: number; topicIndex: number; topicName: string; currentProgress: number }) => void;
  onSlideChange: (taskId: string | undefined, createdAt: number, topicIndex: number, value: number) => void;
  onSlideComplete: (taskId: string | undefined, createdAt: number, topicIndex: number, topicName: string, value: number) => void;
};

export default function AssignmentTaskCard({
  group,
  fallbackSubject,
  assignmentDateStr,
  daysToAssignment,
  onToggleComplete,
  onSlideChange,
  onSlideComplete,
}: Props) {
  const left = daysUntil(group.date);
  const doneCount = group.topics.filter((t) => t.progress >= 100).length;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.subjectTitle}>{group.subject || fallbackSubject}</Text>
        <View style={[styles.badge, { backgroundColor: dueColor(left) }]}>
          <Text style={styles.badgeText}>{left <= 0 ? "Due!" : `${left}d`}</Text>
        </View>
      </View>

      <Text style={styles.dateText}>
        tasks: {group.date} • {doneCount}/{group.topics.length} completed
      </Text>

      {assignmentDateStr && daysToAssignment !== null && (
        <View style={styles.statusRow}>
          <Ionicons
            name={left <= daysToAssignment ? "checkmark-circle" : "warning"}
            size={16}
            color={left <= daysToAssignment ? "#10B981" : "#EF4444"}
          />
          <Text
            style={{
              marginLeft: 6,
              color: left <= daysToAssignment ? "#10B981" : "#EF4444",
              fontSize: moderateScale(13),
              fontWeight: "600",
            }}
          >
            {left <= daysToAssignment ? "On track for assignment" : "Task after assignment"}
          </Text>
        </View>
      )}

      {group.topics.map((topic) => (
        <AssignmentTopicRow
          key={topic.key}
          topic={topic}
          onToggleComplete={() =>
            onToggleComplete({
              taskId: topic.taskId,
              createdAt: topic.createdAt,
              topicIndex: topic.topicIndex,
              topicName: topic.topicName,
              currentProgress: topic.progress,
            })
          }
          onSlideChange={(value) => onSlideChange(topic.taskId, topic.createdAt, topic.topicIndex, value)}
          onSlideComplete={(value) => onSlideComplete(topic.taskId, topic.createdAt, topic.topicIndex, topic.topicName, value)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: scaleSize(18),
    padding: scaleSize(18),
    marginBottom: verticalScale(16),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  subjectTitle: { fontSize: moderateScale(18), fontWeight: "700", color: COLORS.navy, flex: 1 },
  badge: { paddingHorizontal: scaleSize(12), paddingVertical: verticalScale(6), borderRadius: scaleSize(20) },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: moderateScale(13) },
  dateText: { color: "#687588", fontSize: moderateScale(14), marginTop: verticalScale(8) },
  statusRow: { flexDirection: "row", alignItems: "center" },
});