import COLORS from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { RevisionGroup, daysUntil, dueColor } from "@/utils/RevisionTasks";

type ToggleArgs = {
  revisionId: string | undefined;
  createdAt: number;
  topicIndex: number;
  topicName: string;
  currentProgress: number;
};

type Props = {
  data: RevisionGroup[];
  examDateStr: string | null;
  daysToExam: number | null;
  onToggleComplete: (args: ToggleArgs) => void;
  onSlideChange: (
    revisionId: string | undefined,
    createdAt: number,
    topicIndex: number,
    value: number
  ) => void;
  onSlideComplete: (
    revisionId: string | undefined,
    createdAt: number,
    topicIndex: number,
    topicName: string,
    value: number
  ) => void;
};

export default function RevisionTaskList({
  data,
  examDateStr,
  daysToExam,
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
      renderItem={({ item: group }) => {
        const left = daysUntil(group.date);
        const doneCount = group.topics.filter((t) => t.progress >= 100).length;

        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.subjectTitle}>{group.subject}</Text>
              <View style={[styles.badge, { backgroundColor: dueColor(left) }]}>
                <Text style={styles.badgeText}>{left <= 0 ? "Due!" : `${left}d`}</Text>
              </View>
            </View>

            <Text style={styles.dateText}>
              Revision: {group.date} • {doneCount}/{group.topics.length} completed
            </Text>

            {examDateStr && (
              <View style={styles.statusRow}>
                <Ionicons
                  name={left <= daysToExam! ? "checkmark-circle" : "warning"}
                  size={16}
                  color={left <= daysToExam! ? "#10B981" : "#EF4444"}
                />
                <Text
                  style={{
                    marginLeft: 6,
                    color: left <= daysToExam! ? "#10B981" : "#EF4444",
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  {left <= daysToExam! ? "On track for exam" : "revisions after exam"}
                </Text>
              </View>
            )}

            {group.topics.map((topic) => (
              <View key={topic.key} style={styles.topicRow}>
                <Pressable
                  style={styles.checkbox}
                  onPress={() =>
                    onToggleComplete({
                      revisionId: topic.revisionId,
                      createdAt: topic.createdAt,
                      topicIndex: topic.topicIndex,
                      topicName: topic.topicName,
                      currentProgress: topic.progress,
                    })
                  }
                >
                  <Ionicons
                    name={topic.progress >= 100 ? "checkmark-circle" : "ellipse-outline"}
                    size={26}
                    color={topic.progress >= 100 ? "#10B981" : "#CBD5E1"}
                  />
                </Pressable>

                <Text style={[styles.topicName, topic.progress >= 100 && styles.strikethrough]}>
                  {topic.topicName}
                </Text>

                <View style={styles.progressContainer}>
                  <Slider
                    style={{ flex: 1, marginHorizontal: 12 }}
                    minimumValue={0}
                    maximumValue={100}
                    step={5}
                    value={topic.progress}
                    onValueChange={(val) =>
                      onSlideChange(topic.revisionId, topic.createdAt, topic.topicIndex, val)
                    }
                    onSlidingComplete={(val) =>
                      onSlideComplete(topic.revisionId, topic.createdAt, topic.topicIndex, topic.topicName, val)
                    }
                    minimumTrackTintColor={COLORS.blue}
                    maximumTrackTintColor="#E5E7EB"
                    thumbTintColor={COLORS.blue}
                  />
                  <Text style={styles.progressText}>{Math.round(topic.progress)}%</Text>
                </View>
              </View>
            ))}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  subjectTitle: { fontSize: 18, fontWeight: "700", color: COLORS.navy, flex: 1 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  dateText: { color: "#687588", fontSize: 14, marginTop: 8 },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  topicRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  checkbox: { padding: 4 },
  topicName: { flex: 1, fontSize: 15.5, color: COLORS.navy, marginLeft: 8 },
  strikethrough: { textDecorationLine: "line-through", color: "#94A3B8" },
  progressContainer: { flexDirection: "row", alignItems: "center", flex: 1.3 },
  progressText: { fontSize: 13, fontWeight: "600", color: "#64748B", width: 42, textAlign: "right" },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 100 },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: COLORS.navy, marginTop: 20 },
  emptySubtitle: { color: "#94A3B8", textAlign: "center", marginTop: 8 },
});