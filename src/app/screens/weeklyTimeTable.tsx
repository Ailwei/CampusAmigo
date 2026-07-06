import COLORS, { getSubjectColor } from "@/constants/color";
import { useOnboarding } from "@/context/onboardingContext";
import api from "@/utils/api";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HOURS = Array.from({ length: 12 }, (_, i) => `${8 + i}:00`);
const DAYS = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];
const screenWidth = Dimensions.get("window").width;

const screenHeight = Dimensions.get("window").height;

const HOUR_CELL_WIDTH = screenWidth * 0.45;
const ROW_HEIGHT = screenHeight * 0.11;
const DAY_LABEL_WIDTH = screenWidth * 0.15




export default function WeeklyCalendar() {
  const { timetable, setTimetable } = useOnboarding();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTimetable = async () => {
      try {
        const res = await api.get("/onboarding/view-time-table");
        const fetchedTimetable = res?.data?.data?.timetable || [];
        if (res.data.success) {
          setTimetable(fetchedTimetable);
        }
      } catch (error) {
        console.log("Failed to load timetable", error);
      } finally {
        setLoading(false);
      }
    };

    if (timetable.length === 0) {
      loadTimetable();
    } else {
      setLoading(false);
    }
  }, [timetable.length, setTimetable]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading timetable...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.screen}>
          <View style={styles.gridRow}>
            <View style={styles.dayLabelColumn}>
              {DAYS.map((day) => (
                <View key={day} style={styles.dayLabelCell}>
                  <Text style={styles.dayText}>{day}</Text>
                </View>
              ))}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                {DAYS.map((day) => (
                  <View key={day} style={styles.row}>
                    {HOURS.map((hour) => {
                      const slots = timetable.filter((slot) => {
                        const slotDay = slot.day.toLowerCase().slice(0, 3);
                        const dayMatch = slotDay === day.toLowerCase().slice(0, 3);
                        const slotHour = slot.startTime.split(":")[0].replace(/^0/, "");
                        const hourMatch = slotHour === hour.split(":")[0];
                        return dayMatch && hourMatch;
                      });

                      return (
                        <View key={hour} style={styles.cell}>
                          {slots.length > 0 ? (
                            slots.map((slot, idx) => {
                              const color = getSubjectColor(slot.subject.name);
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
                                  <View style={styles.subjectRow}>
                                    <Text style={styles.subject} numberOfLines={1} ellipsizeMode="tail">
                                      {slot.subject.name}
                                    </Text>
                                    <Text style={styles.code}>{slot.subject.code}</Text>
                                  </View>


                                  <Text style={styles.metaLine}>
                                    <Text style={{ color: COLORS.orange, fontWeight: "700" }}>
                                      Room: {slot.subject.room || "Not Provided"}
                                    </Text>
                                  </Text>
                                  <View style={[styles.timePill, { backgroundColor: `${color}22` }]}>
                                    <Text style={[styles.time, { color }]}>
                                      {slot.startTime} - {slot.endTime}
                                    </Text>
                                  </View>
                                </View>
                              );
                            })
                          ) : (
                            <View style={styles.freeCell} />
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.bottomBorder} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7FC" },
  screen: { flex: 1, backgroundColor: "#F4F7FC" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: COLORS.navy, fontSize: 16, fontWeight: "600" },

  gridRow: { flexDirection: "row", marginHorizontal: 12 },

  dayLabelColumn: { width: DAY_LABEL_WIDTH },
  dayLabelCell: {
    width: DAY_LABEL_WIDTH,
    height: ROW_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: { fontSize: 13, fontWeight: "600", color: "#7B8BAA" },

  row: { flexDirection: "row", height: ROW_HEIGHT },

  cell: {
    width: HOUR_CELL_WIDTH,
    height: ROW_HEIGHT,
    borderWidth: 1,
    borderColor: "#E7ECF4",
    backgroundColor: "#FCFDFF",
    padding: 6,
    borderRadius: 10,
    marginRight: 6,
  },
  classBlock: { borderRadius: 14, padding: 10, marginBottom: 6, borderLeftWidth: 5, flexDirection: "column", gap: 2 },
  subject: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.navy,
    marginRight: 8,
  }, metaLine: { fontSize: 12, marginTop: 3 },
  timePill: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
  },
  time: { fontSize: 11, fontWeight: "700" },

  freeCell: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: `${COLORS.red}15`,
  },

  bottomBorder: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    height: 100,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 1,
  },
  subjectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
  },
  code: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.green,
  }
});