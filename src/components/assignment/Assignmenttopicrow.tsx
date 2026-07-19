import COLORS from "@/constants/color";
import { TopicTask } from "@/utils/Assignmenttasks";
import { moderateScale } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  topic: TopicTask;
  onToggleComplete: () => void;
  onSlideChange: (value: number) => void;
  onSlideComplete: (value: number) => void;
};

export default function AssignmentTopicRow({ topic, onToggleComplete, onSlideChange, onSlideComplete }: Props) {
  return (
    <View style={styles.topicRow}>
      <Pressable style={styles.checkbox} onPress={onToggleComplete}>
        <Ionicons
          name={topic.progress >= 100 ? "checkmark-circle" : "ellipse-outline"}
          size={26}
          color={topic.progress >= 100 ? "#10B981" : "#CBD5E1"}
        />
      </Pressable>

      <Text style={[styles.topicName, topic.progress >= 100 && styles.strikethrough]}>{topic.topicName}</Text>

      <View style={styles.progressContainer}>
        <Slider
          style={{ flex: 1, marginHorizontal: 12 }}
          minimumValue={0}
          maximumValue={100}
          step={5}
          value={topic.progress}
          onValueChange={onSlideChange}
          onSlidingComplete={onSlideComplete}
          minimumTrackTintColor={COLORS.blue}
          maximumTrackTintColor="#E5E7EB"
          thumbTintColor={COLORS.blue}
        />
        <Text style={styles.progressText}>{Math.round(topic.progress)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topicRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  checkbox: { padding: 4 },
  topicName: { flex: 1, fontSize: moderateScale(15.5), color: COLORS.navy, marginLeft: 8 },
  strikethrough: { textDecorationLine: "line-through", color: "#94A3B8" },
  progressContainer: { flexDirection: "row", alignItems: "center", flex: 1.3 },
  progressText: { fontSize: moderateScale(13), fontWeight: "600", color: "#64748B", width: 42, textAlign: "right" },
});