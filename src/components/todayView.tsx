import COLORS from "@/constants/color";
import { moderateScale, verticalScale, scaleSize } from "@/utils/responsive";
import { getSubjectStyle, timeToMinutes, formatDuration } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { ClassEntry } from "@/types/timetable";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TodayView({ timetable }: { timetable: ClassEntry[] }) {
  const todayName = DAYS[new Date().getDay()];
  const entries = timetable
    .filter((e) => e.day === todayName)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="sunny-outline" size={moderateScale(44)} color={COLORS.navy + "50"} />
        <Text style={styles.emptyTitle}>No classes today</Text>
        <Text style={styles.emptySubtitle}>Enjoy the free day 🎉</Text>
      </View>
    );
  }

  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const items: Array<{ type: "class"; entry: ClassEntry } | { type: "gap"; minutes: number }> = [];
  entries.forEach((entry, i) => {
    items.push({ type: "class", entry });
    const next = entries[i + 1];
    if (next) {
      const gap = timeToMinutes(next.startTime) - timeToMinutes(entry.endTime);
      if (gap >= 20) items.push({ type: "gap", minutes: gap });
    }
  });

  return (
    <View style={styles.container}>
      {items.map((item, idx) => {
        if (item.type === "gap") {
          const h = Math.floor(item.minutes / 60);
          const m = item.minutes % 60;
          const label = h ? `${h}h ${m ? m + "m" : ""} free` : `${m}m free`;
          return (
            <View key={`gap-${idx}`} style={styles.gapRow}>
              <View style={styles.gapLine} />
              <Text style={styles.gapText}>{label.trim()}</Text>
              <View style={styles.gapLine} />
            </View>
          );
        }

        const { entry } = item;
        const { accent, tint } = getSubjectStyle(entry.subject);
        const start = timeToMinutes(entry.startTime);
        const end = timeToMinutes(entry.endTime);
        const isNow = nowMinutes >= start && nowMinutes < end;
        const isPast = nowMinutes >= end;
        const displayAccent = isPast ? COLORS.green : accent;
        const displayTint = isPast ? COLORS.paper : tint;
        const metaIconColor = isPast ? COLORS.navySoft : COLORS.navy + "80";

        return (
          <View
            key={idx}
            style={[
              styles.card,
              isPast && styles.cardPast,
              isNow && styles.cardActive,
            ]}
          >
            <View style={[styles.accentBar, { backgroundColor: displayAccent }]} />
            <View style={[styles.iconWrap, { backgroundColor: displayTint }]}>
              {isPast ? (
                <Ionicons name="checkmark-circle" size={moderateScale(18)} color={displayAccent} />
              ) : (
                <Ionicons name="book-outline" size={moderateScale(18)} color={displayAccent} />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.cardTopRow}>
                <Text
                  style={[styles.subject, isPast && styles.subjectPast]}
                  numberOfLines={1}
                >
                  {entry.subject}
                </Text>
                {isNow && (
                  <View style={styles.nowBadge}>
                    <Text style={styles.nowBadgeText}>NOW</Text>
                  </View>
                )}
                {isPast && (
                  <View style={styles.doneBadge}>
                    <Text style={styles.doneBadgeText}>DONE</Text>
                  </View>
                )}
              </View>
              {!!entry.code && (
                <Text style={[styles.code, isPast && styles.textPast]}>{entry.code}</Text>
              )}

              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={moderateScale(13)} color={metaIconColor} />
                <Text style={[styles.metaText, isPast && styles.textPast]}>
                  {entry.startTime}–{entry.endTime} · {formatDuration(entry.startTime, entry.endTime)}
                </Text>
              </View>
              {!!entry.room && (
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={moderateScale(13)} color={metaIconColor} />
                  <Text style={[styles.metaText, isPast && styles.textPast]}>{entry.room}</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: scaleSize(16), gap: verticalScale(10) },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: moderateScale(16),
    padding: moderateScale(12),
    alignItems: "center",
    gap: scaleSize(10),
    shadowColor: COLORS.navy,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardActive: {
    borderWidth: 1.5,
    borderColor: COLORS.blue,
  },
  cardPast: {
    backgroundColor: COLORS.paper,
    shadowOpacity: 0.02,
    elevation: 0,
  },
  accentBar: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 2,
  },
  iconWrap: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
  },
  cardTopRow: { flexDirection: "row", alignItems: "center", gap: scaleSize(8) },
  subject: { fontSize: moderateScale(15), fontWeight: "700", color: COLORS.navy, flexShrink: 1 },
  subjectPast: {
    color: COLORS.navySoft,
    textDecorationLine: "line-through",
  },
  code: { fontSize: moderateScale(12), fontWeight: "500", color: COLORS.navy + "70", marginTop: 1 },
  nowBadge: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: scaleSize(6),
    paddingVertical: 2,
    borderRadius: moderateScale(6),
  },
  nowBadgeText: { color: COLORS.card, fontSize: moderateScale(9), fontWeight: "800", letterSpacing: 0.5 },
  doneBadge: {
    backgroundColor: COLORS.ruleSoft,
    paddingHorizontal: scaleSize(6),
    paddingVertical: 2,
    borderRadius: moderateScale(6),
  },
  doneBadgeText: { color: COLORS.green, fontSize: moderateScale(9), fontWeight: "800", letterSpacing: 0.5 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  metaText: { fontSize: moderateScale(12), fontWeight: "500", color: COLORS.navy + "80" },
  textPast: { color: COLORS.navySoft },

  gapRow: { flexDirection: "row", alignItems: "center", gap: scaleSize(8), paddingVertical: verticalScale(2) },
  gapLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: COLORS.rule },
  gapText: { fontSize: moderateScale(11), fontWeight: "600", color: COLORS.navy + "60" },

  emptyContainer: { alignItems: "center", paddingVertical: verticalScale(60), gap: verticalScale(6) },
  emptyTitle: { fontSize: moderateScale(16), fontWeight: "700", color: COLORS.navy, marginTop: verticalScale(6) },
  emptySubtitle: { fontSize: moderateScale(13), fontWeight: "500", color: COLORS.navy + "80" },
});