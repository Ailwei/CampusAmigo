import COLORS, { getSubjectColor } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Subject } from "@/utils/Usemanagesubjects";

interface SubjectCardProps {
  subject: Subject;
  onDelete: (subject: Subject) => void;
}

export default function SubjectCard({ subject, onDelete }: SubjectCardProps) {
  const color = getSubjectColor(subject.name);

  return (
    <View style={styles.card}>
      <View style={[styles.icon, { backgroundColor: `${color}20` }]}>
        <Ionicons name="book" size={22} color={color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{subject.name}</Text>
        <Text style={styles.code}>{subject.code}</Text>
        <Text style={styles.room}>{subject.room || "No room assigned"}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/screens/timetable/edit-Subject",
              params: {
                id: subject.id,
                name: subject.name,
                code: subject.code,
                room: subject.room ?? "",
              },
            })
          }
        >
          <Ionicons name="create-outline" size={24} color={COLORS.blue} />
        </Pressable>
        <Pressable onPress={() => onDelete(subject)}>
          <Ionicons name="trash-outline" size={24} color={COLORS.red} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: scaleSize(16),
    padding: scaleSize(16),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(14),
  },
  icon: {
    width: scaleSize(50),
    height: scaleSize(50),
    borderRadius: scaleSize(14),
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginLeft: scaleSize(14),
  },
  name: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: COLORS.navy,
  },
  code: {
    fontSize: moderateScale(14),
    color: COLORS.green,
    fontWeight: "700",
    marginTop: verticalScale(2),
  },
  room: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    marginTop: verticalScale(4),
  },
  actions: {
    gap: scaleSize(16),
    flexDirection: "row",
  },
});