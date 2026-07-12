import COLORS from "@/constants/color";
import api from "@/utils/api";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

type AssignmentItem = {
  title: string;
  subject: {
    name: string;
  };
  due: string;
  progress?: number;
  createdAt?: string;
};

const daysLeft = (date: string) => {
  const today = new Date();
  const dueDate = new Date(date);
  return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const urgencyColor = (left: number) => {
  if (left <= 1) return "#DC2626";
  if (left <= 3) return "#D97706";
  return COLORS.green;
};

const SCREEN_PADDING = scaleSize(20);
const PEEK = scaleSize(28);
const GAP = scaleSize(12);

export default function DeadlineList({ maxItems = 5 }: { maxItems?: number }) {
  const { width } = useWindowDimensions();
  const cardWidth = width - SCREEN_PADDING * 2 - PEEK;

  const [items, setItems] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const loadDeadlines = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get("/assignment/get-assignment");
      if (res.data.success) {
        const data = Array.isArray(res.data.data.assignments) ? res.data.data.assignments : [];
        const sorted = [...data].sort((a, b) => daysLeft(a.due) - daysLeft(b.due));
        setItems(sorted.slice(0, maxItems));
      } else {
        setItems([]);
      }
    } catch (error) {
      console.log("Failed to load deadlines", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [maxItems]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!mounted) return;
      await loadDeadlines();
    };

    run();

    return () => {
      mounted = false;
    };
  }, [loadDeadlines]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const run = async () => {
        if (!active) return;
        await loadDeadlines();
      };

      run();

      return () => {
        active = false;
      };
    }, [loadDeadlines])
  );

  useEffect(() => {
    setActiveIndex(0);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [items]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / (cardWidth + GAP));
    if (index !== activeIndex) setActiveIndex(index);
  };

  if (loading) {
    return (
      <View style={styles.loadingRow}>
        <ActivityIndicator color={COLORS.blue} />
      </View>
    );
  }

  if (items.length === 0) {
    return <Text style={styles.empty}>No deadlines yet.</Text>;
  }

  return (
    <View>
      <FlatList
        ref={listRef}
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + GAP}
        snapToAlignment="start"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        renderItem={({ item }) => {
          const left = daysLeft(item.due);
          const color = urgencyColor(left);
          const dayLabel = left <= 0 ? "TODAY" : `${left}`;
          const dayUnit = left <= 0 ? "" : left === 1 ? "day" : "days";

          return (
            <View style={[styles.card, { width: cardWidth }]}>
              <View style={[styles.accentBar, { backgroundColor: color }]} />

              <View style={[styles.iconCircle, { backgroundColor: `${color}22` }]}>
                <MaterialCommunityIcons name="notebook-check-outline" size={20} color={color} />
              </View>

              <View style={styles.info}>
                <Text style={styles.subject} numberOfLines={1}>
                  {item.subject?.name}
                </Text>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={styles.dueRow}>
                  <Feather name="calendar" size={12} color={COLORS.navySoft} />
                  <Text style={styles.dueText}>Due {item.due}</Text>
                </View>
              </View>

              <View style={[styles.daysBadge, { backgroundColor: color }]}>
                <Text style={styles.daysNumber}>{dayLabel}</Text>
                {dayUnit ? <Text style={styles.daysUnit}>{dayUnit}</Text> : null}
              </View>
            </View>
          );
        }}
      />

      {items.length > 1 && (
        <View style={styles.dotsRow}>
          {items.map((_, index) => (
            <View key={index} style={[styles.dot, index === activeIndex && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingRow: { paddingVertical: verticalScale(8) },
  empty: { color: COLORS.navySoft, fontStyle: "italic", textAlign: "center" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: scaleSize(14),
    overflow: "hidden",
    paddingVertical: moderateScale(14),
    paddingRight: moderateScale(14),
    minHeight: verticalScale(88),
  },
  accentBar: {
    width: scaleSize(5),
    alignSelf: "stretch",
    marginRight: scaleSize(12),
  },
  iconCircle: {
    width: scaleSize(38),
    height: scaleSize(38),
    borderRadius: scaleSize(19),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scaleSize(12),
  },
  info: { flex: 1 },
  subject: { fontSize: moderateScale(13), fontWeight: "700", color: COLORS.orange },
  title: { fontSize: moderateScale(15), fontWeight: "700", color: COLORS.navy, marginTop: verticalScale(1) },
  dueRow: { flexDirection: "row", alignItems: "center", marginTop: verticalScale(5) },
  dueText: { fontSize: moderateScale(11), color: COLORS.navySoft, marginLeft: scaleSize(4) },
  daysBadge: {
    borderRadius: scaleSize(10),
    paddingVertical: verticalScale(6),
    paddingHorizontal: scaleSize(8),
    alignItems: "center",
    minWidth: scaleSize(48),
  },
  daysNumber: { fontSize: moderateScale(15), fontWeight: "800", color: "#fff" },
  daysUnit: { fontSize: moderateScale(9), fontWeight: "600", color: "#fff", marginTop: -2 },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(10),
    gap: scaleSize(6),
  },
  dot: {
    width: scaleSize(6),
    height: scaleSize(6),
    borderRadius: scaleSize(3),
    backgroundColor: COLORS.navySoft,
    opacity: 0.3,
  },
  dotActive: {
    opacity: 1,
    backgroundColor: COLORS.orange,
    width: scaleSize(16),
  },
});