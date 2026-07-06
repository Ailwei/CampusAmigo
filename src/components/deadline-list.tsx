import COLORS from "@/constants/color";
import api from "@/utils/api";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type DeadlineItem = {
  title: string;
  subject: string;
  due: string;
  progress?: number;
  createdAt?: string;
};

const daysLeft = (date: string) => {
  const today = new Date();
  const dueDate = new Date(date);
  return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export default function DeadlineList({ maxItems = 3 }: { maxItems?: number }) {
  const [items, setItems] = useState<DeadlineItem[]>([]);
  const [loading, setLoading] = useState(true);

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
      {items.map((item, index) => {
        const left = daysLeft(item.due);
        return (
          <View key={`${item.title}-${index}`} style={styles.card}>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>Due {item.due} • {left <= 0 ? "Due today" : `${left} day${left === 1 ? "" : "s"} left`}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingRow: { paddingVertical: verticalScale(8) },
  empty: { color: COLORS.navySoft, fontStyle: "italic" },
  card: {
    backgroundColor: "#fff",
    borderRadius: scaleSize(12),
    padding: moderateScale(12),
    marginBottom: verticalScale(10),
  },
  subject: { fontSize: moderateScale(14), fontWeight: "700", color: COLORS.navy },
  title: { fontSize: moderateScale(13), color: COLORS.navySoft, marginTop: verticalScale(2) },
  meta: { fontSize: moderateScale(12), color: COLORS.navySoft, marginTop: verticalScale(6) },
});
