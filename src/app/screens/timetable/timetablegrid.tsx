import COLORS, { getSubjectStyle, getSubjectColor } from "@/constants/color";
import { moderateScale, verticalScale, scaleSize } from "@/utils/responsive";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type TimetableSubject = { name?: string; code?: string; room?: string };

export type TimetableSlot = {
  id: string;
  subjectId: string;
  day: string;
  startTime: string;
  endTime: string;
  subject?: TimetableSubject | null;
};

const DAYS = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DAY_START = 7 * 60;
const DAY_END = 22 * 60;
const HOUR_HEIGHT = verticalScale(64);
const TIME_COL_WIDTH = scaleSize(48);

const screenWidth = Dimensions.get("window").width;
const DAY_COL_WIDTH = Math.max(
  scaleSize(100),
  (screenWidth - TIME_COL_WIDTH) / DAYS.length
);

const HOURS: number[] = (() => {
  const arr: number[] = [];
  for (let m = DAY_START; m <= DAY_END; m += 60) arr.push(m);
  return arr;
})();

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
};

const dayPrefix = (day: string) => (day || "").toLowerCase().slice(0, 3);

type TimetableGridProps = {
  timetable: TimetableSlot[];
  onSlotPress?: (slot: TimetableSlot) => void;
};

export default function TimetableGrid({ timetable, onSlotPress }: TimetableGridProps) {
  const [now, setNow] = useState(new Date());
  const outerScrollRef = useRef<ScrollView>(null);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const todayIndex = (() => {
    const jsDay = now.getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  })();

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const showNowLine = nowMinutes >= DAY_START && nowMinutes <= DAY_END;
  const nowTop = ((nowMinutes - DAY_START) / 60) * HOUR_HEIGHT;

  const slotsByDay = useMemo(() => {
    const map: Record<string, TimetableSlot[]> = {};
    DAYS.forEach((d) => (map[d] = []));
    timetable.forEach((slot) => {
      const match = DAYS.find((d) => dayPrefix(d) === dayPrefix(slot.day));
      if (match) map[match].push(slot);
    });
    return map;
  }, [timetable]);

  const dayHeight = ((DAY_END - DAY_START) / 60) * HOUR_HEIGHT;

  const handleContentLayout = () => {
    if (hasScrolledRef.current) return;
    hasScrolledRef.current = true;
    const offset = Math.max(0, ((nowMinutes - DAY_START - 60) / 60) * HOUR_HEIGHT);
    outerScrollRef.current?.scrollTo({ y: offset, animated: false });
  };

  return (
    <ScrollView
      ref={outerScrollRef}
      style={styles.flexFill}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={handleContentLayout}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.headerRow}>
            <View style={{ width: TIME_COL_WIDTH }} />
            {DAY_LABELS.map((label, i) => (
              <View
                key={label}
                style={[
                  styles.dayHeaderCell,
                  { width: DAY_COL_WIDTH },
                  i === todayIndex && styles.dayHeaderCellActive,
                ]}
              >
                <Text style={[styles.dayHeaderText, i === todayIndex && styles.dayHeaderTextActive]}>
                  {label}
                </Text>
                {i === todayIndex && <View style={styles.todayDot} />}
              </View>
            ))}
          </View>

          <View style={{ flexDirection: "row" }}>
            <View style={{ width: TIME_COL_WIDTH }}>
              {HOURS.map((m) => (
                <View key={m} style={{ height: HOUR_HEIGHT }}>
                  <Text style={styles.timeLabel}>
                    {String(Math.floor(m / 60)).padStart(2, "0")}:00
                  </Text>
                </View>
              ))}
            </View>

            {DAYS.map((day, dayIdx) => (
              <View
                key={day}
                style={[
                  styles.dayColumn,
                  { width: DAY_COL_WIDTH, height: dayHeight },
                  dayIdx === todayIndex && styles.dayColumnActive,
                ]}
              >
                {HOURS.map((m) => (
                  <View
                    key={m}
                    style={[styles.gridLine, { top: ((m - DAY_START) / 60) * HOUR_HEIGHT }]}
                  />
                ))}

                {slotsByDay[day].map((slot, idx) => {
                  const start = toMinutes(slot.startTime);
                  const end = toMinutes(slot.endTime);
                  const top = ((start - DAY_START) / 60) * HOUR_HEIGHT;
                  const height = Math.max(
                    verticalScale(28),
                    ((end - start) / 60) * HOUR_HEIGHT
                  );
                  const accentColor = getSubjectColor(slot.subject?.name || "");

                  return (
                    <TouchableOpacity
                      key={slot.id + idx}
                      activeOpacity={0.8}
                      disabled={!onSlotPress}
                      onPress={() => onSlotPress?.(slot)}
                      style={[
                        styles.classBlock,
                        { top, height, backgroundColor: accentColor + "20", borderLeftColor: accentColor },
                      ]}
                    >
                      <Text style={[styles.classSubject, { color: accentColor }]} numberOfLines={1}>
                        {slot.subject?.name || "Untitled"}
                      </Text>
                      {!!slot.subject?.code && height > verticalScale(56) && (
                        <Text style={styles.classCode} numberOfLines={1}>
                          {slot.subject.code}
                        </Text>
                      )}
                      {height > verticalScale(42) && (
                        <Text style={styles.classMeta} numberOfLines={1}>
                          {slot.startTime} · {slot.subject?.room || ""}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}

                {showNowLine && dayIdx === todayIndex && (
                  <View style={[styles.nowLine, { top: nowTop }]}>
                    <View style={styles.nowDot} />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flexFill: { flex: 1 },
  headerRow: { flexDirection: "row", paddingBottom: verticalScale(8) },
  dayHeaderCell: { alignItems: "center", paddingVertical: verticalScale(6) },
  dayHeaderCellActive: { backgroundColor: COLORS.today, borderRadius: moderateScale(10) },
  dayHeaderText: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: COLORS.navy + "90",
  },
  dayHeaderTextActive: { color: COLORS.navy },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.blue,
    marginTop: 3,
  },
  timeLabel: {
    fontSize: moderateScale(11),
    fontWeight: "600",
    color: COLORS.navy + "70",
    marginTop: -6,
  },
  dayColumn: {
    position: "relative",
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: COLORS.blueLight,
  },
  dayColumnActive: { backgroundColor: COLORS.today },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.ruleSoft,
  },
  classBlock: {
    position: "absolute",
    left: 3,
    right: 3,
    borderRadius: moderateScale(8),
    borderLeftWidth: 3,
    paddingHorizontal: scaleSize(6),
    paddingVertical: verticalScale(4),
    overflow: "hidden",
  },
  classSubject: { fontSize: moderateScale(11.5), fontWeight: "700" },
  classMeta: {
    fontSize: moderateScale(10),
    fontWeight: "500",
    color: COLORS.navy + "80",
    marginTop: 1,
  },
  classCode: {
    fontSize: moderateScale(9.5),
    fontWeight: "600",
    color: COLORS.navy + "70",
    marginTop: 0,
  },
  nowLine: {
    position: "absolute",
    left: -1,
    right: 0,
    height: 2,
    backgroundColor: COLORS.now,
  },
  nowDot: {
    position: "absolute",
    left: -4,
    top: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.now,
  },
});