import COLORS from "@/constants/color";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { TimetableSlot } from "@/utils/useweeklytimetable";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

interface WeeklyTimetableListProps {
  loading: boolean;
  timetable: TimetableSlot[];
  justAddedKey: string | null;
}

export default function WeeklyTimetableList({ loading, timetable, justAddedKey }: WeeklyTimetableListProps) {
  if (loading) {
    return (
      <View style={styles.centerFill}>
        <ActivityIndicator size="small" color={COLORS.blue} />
      </View>
    );
  }

  if (timetable.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="calendar-blank-outline" size={32} color={COLORS.navySoft} />
        <Text style={styles.emptyStateText}>No classes scheduled yet — add one above</Text>
      </View>
    );
  }

  return (
    <View>
      {timetable.map((item, index) => {
        const key = `${item.subject.name}-${item.day}-${item.startTime}`;
        const isJustAdded = key === justAddedKey;
        return (
          <View key={index} style={[styles.card, isJustAdded && styles.cardHighlight]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="book-open-page-variant" size={20} color={COLORS.blue} />
              <Text style={styles.subject}>
                {item.subject.name}
                {item.subject.code ? ` (${item.subject.code})` : ""}
              </Text>
            </View>
            <View style={styles.cardRow}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.navySoft} />
              <Text style={styles.details}>{item.day}</Text>
            </View>
            <View style={styles.cardRow}>
              <Ionicons name="time-outline" size={16} color={COLORS.navySoft} />
              <Text style={styles.details}>
                {item.startTime} - {item.endTime}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  centerFill: {
    paddingVertical: verticalScale(24),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(28),
    paddingHorizontal: scaleSize(20),
  },
  emptyStateText: {
    marginTop: verticalScale(10),
    color: COLORS.navySoft,
    fontSize: moderateScale(14),
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: scaleSize(12),
    padding: scaleSize(14),
    marginBottom: verticalScale(10),
    borderWidth: 1,
    borderColor: "#E7ECF4",
  },
  cardHighlight: {
    borderColor: COLORS.blue,
    borderWidth: 2,
    backgroundColor: "#F0F8FF",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(6),
  },
  subject: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: COLORS.navy,
    marginLeft: scaleSize(8),
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(4),
  },
  details: {
    marginLeft: scaleSize(6),
    fontSize: moderateScale(14),
    color: COLORS.navySoft,
  },
});