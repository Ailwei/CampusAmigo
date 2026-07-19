import COLORS from "@/constants/color";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TimetableGrid from "./timetablegrid";
import EditSlotModal from "@/components/classes/editslotmodal";
import { useEditTimetable } from "@/utils/Useedittimetable";

export default function EditClassScreen() {
  const router = useRouter();
  const {
    timetable,
    loading,
    editing,
    newDay,
    newStart,
    newEnd,
    showStartPicker,
    showEndPicker,
    saving,
    setNewDay,
    setShowStartPicker,
    setShowEndPicker,
    handleStartChange,
    handleEndChange,
    openEditor,
    closeEditor,
    saveSlot,
    toTimeString,
  } = useEditTimetable();

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Stack.Screen options={{ headerShown: true, title: "Edit Timetable" }} />
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={styles.loadingText}>Loading timetable...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Edit Timetable",
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

      <View style={styles.hintBanner}>
        <Ionicons name="create-outline" size={18} color={COLORS.blue} />
        <Text style={styles.hintBannerText}>Tap any class below to change its day or time</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TimetableGrid timetable={timetable} onSlotPress={openEditor} />
      </ScrollView>

      <EditSlotModal
        visible={!!editing}
        editing={editing}
        newDay={newDay}
        newStart={newStart}
        newEnd={newEnd}
        showStartPicker={showStartPicker}
        showEndPicker={showEndPicker}
        saving={saving}
        onChangeDay={setNewDay}
        onOpenStartPicker={() => setShowStartPicker(true)}
        onOpenEndPicker={() => setShowEndPicker(true)}
        onStartChange={handleStartChange}
        onEndChange={handleEndChange}
        onClose={closeEditor}
        onSave={saveSlot}
        toTimeString={toTimeString}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7FC" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4F7FC" },
  loadingText: { marginTop: 12, fontSize: moderateScale(16), color: COLORS.navySoft },
  scrollContent: { flexGrow: 1, paddingBottom: verticalScale(1) },

  hintBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: scaleSize(8),
    backgroundColor: `${COLORS.blue}10`,
    marginHorizontal: scaleSize(20),
    marginTop: verticalScale(12),
    marginBottom: verticalScale(10),
    padding: scaleSize(12),
    borderRadius: scaleSize(10),
  },
  hintBannerText: {
    color: COLORS.navy,
    fontSize: moderateScale(13),
    fontWeight: "600",
    flex: 1,
  },
});