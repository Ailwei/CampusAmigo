import COLORS from "@/constants/color";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Subject } from "@/utils/Addclasstasks";

type Props = {
  loading: boolean;
  subjects: Subject[];
  classes: Subject[];
  justAddedId: string | null;
  onToggle: (subject: Subject) => void;
};

const renderMeta = (item: Subject) => {
  const parts = [item.code, item.room].filter((p) => p && p.length > 0);
  if (parts.length === 0) return null;
  return <Text style={styles.subjectMeta}>{parts.join(" • ")}</Text>;
};

export default function SubjectsList({ loading, subjects, classes, justAddedId, onToggle }: Props) {
  if (loading) {
    return (
      <View style={styles.centerFill}>
        <ActivityIndicator size="small" color={COLORS.blue} />
      </View>
    );
  }

  if (subjects.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons
          name="book-open-page-variant-outline"
          size={36}
          color={COLORS.navySoft}
        />
        <Text style={styles.emptyStateText}>
          No subjects yet — add your first one above
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ marginTop: verticalScale(4), flex: 1 }}
      data={subjects}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const isActive = classes.some((c) => c.name === item.name);
        const isJustAdded = item.id === justAddedId;
        return (
          <Pressable
            style={[
              styles.subjectCard,
              isActive && styles.activeCard,
              isJustAdded && styles.justAddedCard,
            ]}
            onPress={() => onToggle(item)}
          >
            <View style={styles.subjectInfo}>
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={22}
                color={isActive ? COLORS.blue : COLORS.navySoft}
              />
              <View style={{ marginLeft: 10, flexShrink: 1 }}>
                <Text style={styles.subjectName}>{item.name}</Text>
                {renderMeta(item)}
              </View>
            </View>

            <Ionicons
              name={isActive ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={isActive ? COLORS.blue : COLORS.navySoft}
            />
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  centerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scaleSize(32),
  },
  emptyStateText: {
    marginTop: verticalScale(10),
    color: COLORS.navySoft,
    fontSize: moderateScale(14),
    textAlign: "center",
  },
  subjectCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: verticalScale(14),
    paddingHorizontal: scaleSize(14),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(10),
    borderWidth: scaleSize(1),
    borderColor: "#E7ECF4",
  },
  activeCard: {
    borderColor: COLORS.blue,
    backgroundColor: "#F0F8FF",
  },
  justAddedCard: {
    borderColor: COLORS.blue,
    borderWidth: 2,
  },
  subjectInfo: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  subjectName: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: COLORS.navy,
  },
  subjectMeta: {
    fontSize: moderateScale(12),
    color: COLORS.navySoft,
    marginTop: verticalScale(2),
  },
});