import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS, { getSubjectColor } from "@/constants/color";
import { useOnboarding } from "@/app/context/onboardingContext";
import { Ionicons } from "@expo/vector-icons";

const HOURS = Array.from({ length: 12 }, (_, i) => `${8 + i}:00`);
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"]

const HOUR_CELL_WIDTH = 70;
const DAY_CELL_WIDTH = 120;



export default function WeeklyCalendar() {
  const { timetable } = useOnboarding();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.screen}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={styles.headerRow}>
                <View style={styles.hourCell} />
                {DAYS.map((day) => (
                  <View key={day} style={styles.dayHeader}>
                    <Text style={styles.dayText}>{day}</Text>
                  </View>
                ))}
              </View>

              {HOURS.map((hour) => (
                <View key={hour} style={styles.row}>
                  <View style={styles.hourCell}>
                    <Ionicons name="time-outline" size={16} color={COLORS.navySoft} />
                    <Text style={styles.hourText}>{hour}</Text>
                  </View>

                  {DAYS.map((day) => {
                    const slots = timetable.filter(
                      (slot) => slot.day.startsWith(day) && slot.startTime.startsWith(hour)
                    );
                    return (
                      <View key={day} style={styles.cell}>
                        {slots.length > 0 ? (
                          slots.map((slot, idx) => {
                            const color = getSubjectColor(slot.subject);
                            return (
                              <View
                                key={idx}
                                style={[
                                  styles.classBlock,
                                  {
                                    borderLeftColor: color,
                                    backgroundColor: `${color}15`,
                                  },
                                ]}
                              >
                                <Text style={styles.subject}>{slot.subject}</Text>
                                <Text style={styles.time}>
                                  {slot.startTime} - {slot.endTime}
                                </Text>
                              </View>
                            );
                          })
                        ) : (
                          <View style={styles.freeRow}>
                            <Ionicons
                              name="checkmark-circle-outline"
                              size={16}
                              color={COLORS.navySoft}
                            />
                            <Text style={styles.freeText}>Free</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.bottomBorder} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7FC" },
  screen: { flex: 1, backgroundColor: "#F4F7FC" },

  headerRow: {
    flexDirection: "row",
    marginHorizontal: 12,
    marginBottom: 15,
    alignItems: "center",
  },
  dayHeader: {
    width: DAY_CELL_WIDTH,
    height: 40,
    backgroundColor: "#E7ECF4",
    borderRadius: 10,
    marginRight: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: { fontSize: 14, fontWeight: "700", color: COLORS.navy },

  row: { flexDirection: "row", minHeight: 82, marginHorizontal: 12 },
  hourCell: {
    width: HOUR_CELL_WIDTH,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  hourText: { fontSize: 13, fontWeight: "600", color: "#7B8BAA" },

  cell: {
    width: DAY_CELL_WIDTH,
    borderWidth: 1,
    borderColor: "#E7ECF4",
    backgroundColor: "#FCFDFF",
    padding: 6,
    borderRadius: 10,
    marginRight: 6,
  },
  classBlock: { borderRadius: 14, padding: 10, marginBottom: 6, borderLeftWidth: 5 },
  subject: { fontSize: 15, fontWeight: "700", color: COLORS.navy },
  time: { fontSize: 12, color: "#708198", marginTop: 4 },

  freeRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  freeText: { fontSize: 13, fontWeight: "600", color: COLORS.navySoft },

  bottomBorder: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    height: 100,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 1,
  },
});
