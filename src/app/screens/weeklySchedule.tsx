import COLORS from "@/constants/color";
import { useOnboarding } from "@/context/onboardingContext";
import api from "@/utils/api";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { verticalScale, moderateScale, scaleSize } from "@/utils/responsive";
import { AddButton } from "@/components";
import AddMenuBottomSheet from "@/components/TimetableActionSheet";
import WeekView from "@/components/weekViewx";
import TodayView from "@/components/todayView";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { ScrollView } from "react-native";
import { mapTimetable } from "@/types/timetable";
import { Ionicons } from "@expo/vector-icons";

type Tab = "today" | "week";

export default function WeeklyCalendar() {
  const router = useRouter();
  const { timetable, setTimetable } = useOnboarding();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [tab, setTab] = useState<Tab>("today");

  const loadTimetable = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await api.get("/timetable/view-time-table");
      const fetchedTimetable = res?.data?.data?.timetable || [];
      if (res.data.success) setTimetable(fetchedTimetable);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTimetable();
    }, [])
  );
  const mappedTimetable = mapTimetable(timetable);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "My Timetable",
          headerBackButtonDisplayMode: "minimal",
          headerTintColor: COLORS.navy,
          headerStyle: { backgroundColor: "#F4F7FC" },
          headerShadowVisible: false,
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
              hitSlop={10}
              style={{ paddingRight: scaleSize(12) }}
            >
              <Ionicons name="chevron-back" size={moderateScale(26)} color={COLORS.navy} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.header}>
        <View style={styles.tabBar}>
          {(["today", "week"] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabButton, tab === t && styles.tabButtonActive]}
              onPress={() => setTab(t)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === "today" ? "Today" : "Week"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <View style={styles.skeletonCard} />
          <View style={[styles.skeletonCard, { opacity: 0.7 }]} />
          <View style={[styles.skeletonCard, { opacity: 0.45 }]} />
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorTitle}>Couldn't load timetable</Text>
          <Text style={styles.errorSubtitle}>Pull to refresh or check your connection</Text>
        </View>
      ) : tab === "today" ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: verticalScale(8), paddingBottom: verticalScale(100) }}>
          <TodayView timetable={mappedTimetable} />
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingBottom: verticalScale(90) }}>
          <WeekView timetable={mappedTimetable} />
        </View>
      )}

      <AddButton onPress={() => setShowAddMenu(true)} />
      <AddMenuBottomSheet visible={showAddMenu} onClose={() => setShowAddMenu(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7FC" },
  header: {
    paddingHorizontal: scaleSize(20),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(12),
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#E8ECF7",
    borderRadius: moderateScale(12),
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(9),
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#1A2A57",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tabText: { fontSize: moderateScale(13), fontWeight: "700", color: COLORS.navy + "70" },
  tabTextActive: { color: COLORS.navy },

  centerState: { flex: 1, justifyContent: "center", paddingHorizontal: scaleSize(20), gap: verticalScale(12) },
  skeletonCard: { height: verticalScale(72), borderRadius: moderateScale(16), backgroundColor: "#E4E9F5" },
  errorTitle: { textAlign: "center", fontSize: moderateScale(16), fontWeight: "700", color: COLORS.navy },
  errorSubtitle: { textAlign: "center", fontSize: moderateScale(13), color: COLORS.navy + "80", marginTop: 4 },
});