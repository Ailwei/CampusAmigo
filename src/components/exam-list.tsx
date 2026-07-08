import COLORS from "@/constants/color";
import api from "@/utils/api";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router"

type ExamItem = {
  subject: {
    name: string;
    code?: string;
    room?: string;
  };
  code: string;
  date: string;
  venue: string;
  progress?: number;
  createdAt?: string;
};


const daysLeft = (date: string) => {
  const today = new Date();
  const examDate = new Date(date);
  return Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export default function ExamList({ maxItems = 3 }: { maxItems?: number }) {
  const [items, setItems] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadExams = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get("/exam/get-exam");
      if (res.data.success) {
        const data = Array.isArray(res.data.data.exams) ? res.data.data.exams : [];
        const sorted = [...data].sort((a, b) => daysLeft(a.date) - daysLeft(b.date));
        setItems(sorted.slice(0, maxItems));
      } else {
        setItems([]);
      }
    } catch (error) {
      console.log("Failed to load exams", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [maxItems]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!mounted) return;
      await loadExams();
    };

    run();

    return () => {
      mounted = false;
    };
  }, [loadExams]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const run = async () => {
        if (!active) return;
        await loadExams();
      };

      run();

      return () => {
        active = false;
      };
    }, [loadExams])
  );

  if (loading) {
    return (
      <View style={styles.loadingRow}>
        <ActivityIndicator color={COLORS.blue} />
      </View>
    );
  }

  if (items.length === 0) {
    return <Text style={styles.empty}>No exams scheduled.</Text>;
  }

  return (
    <View>
      {items.map((item, index) => {
        const left = daysLeft(item.date);
        return (
          <TouchableOpacity onPress={() => console.log("Exam card clicked:", item.code)}>
            <View key={`${item.code}-${index}`} style={styles.card}>
              <Text style={styles.subject}>
                {item.subject?.name}
                {item.subject?.code ? ` (${item.subject.code})` : ""}
                {item.subject?.room ? ` • Room ${item.subject.room}` : ""}
              </Text>
              <Text style={styles.code}>{item.code}</Text>
              <Text style={styles.meta}>
                Date {item.date} • {left <= 0 ? "Today" : `${left} day${left === 1 ? "" : "s"} left`}
              </Text>
              {item.venue ? <Text style={styles.meta}>Venue {item.venue}</Text> : null}

            </View>
          </TouchableOpacity>
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
  subject: { fontSize: moderateScale(14), fontWeight: "700", color: COLORS.orange },
  code: { fontSize: moderateScale(13), color: COLORS.navySoft, marginTop: verticalScale(2) },
  meta: { fontSize: moderateScale(12), color: COLORS.green, marginTop: verticalScale(6) },

});
