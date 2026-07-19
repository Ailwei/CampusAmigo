import COLORS from "@/constants/color";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { useManageSubjects } from "@/utils/Usemanagesubjects";
import SubjectCard from "@/components/classes/SubjectCard";


export default function ManageSubjectsScreen() {
  const { subjects, loading, loadSubjects, deleteSubject } = useManageSubjects();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.subtitle}>Add, edit or remove your subjects.</Text>

      <Pressable style={styles.addButton} onPress={() => router.push("/screens/timetable/add-subject")}>
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={styles.addText}>Add Subject</Text>
      </Pressable>

      <FlatList
        data={subjects}
        keyExtractor={(item) => String(item.id)}
        refreshing={!!loading}
        onRefresh={loadSubjects}
        renderItem={({ item }) => <SubjectCard subject={item} onDelete={deleteSubject} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={60} color="#C4C4C4" />
            <Text style={styles.emptyTitle}>No subjects yet</Text>
            <Text style={styles.emptyText}>Tap "Add Subject" to get started.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
    padding: scaleSize(20),
  },
  subtitle: {
    marginTop: verticalScale(6),
    marginBottom: verticalScale(20),
    color: "#6B7280",
    fontSize: moderateScale(14),
    textAlign: "center",
  },
  empty: {
    alignItems: "center",
    marginTop: verticalScale(80),
  },
  emptyTitle: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: COLORS.navy,
  },
  emptyText: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(14),
    color: "#6B7280",
    textAlign: "center",
  },
  addButton: {
    height: verticalScale(52),
    borderRadius: scaleSize(14),
    backgroundColor: COLORS.blue,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: verticalScale(20),
  },
  addText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: scaleSize(8),
    fontSize: moderateScale(15),
  },
});