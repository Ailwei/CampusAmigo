import COLORS, { getSubjectColor } from "@/constants/color";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "@/utils/api";
import {
  moderateScale,
  scaleSize,
  verticalScale,
} from "@/utils/responsive";

interface Subject {
  id: string;
  name: string;
  code: string;
  room?: string;
}

export default function ManageSubjectsScreen() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSubjects();
    }, [])
  );

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/subjects/get-subjects");
      if (res.data.success) {
        setSubjects(res.data.data.subjects || []);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load subjects.");
    } finally {
      setLoading(false);
    }
  };

  const deleteSubject = (subject: Subject) => {
    Alert.alert("Delete Subject", `Delete ${subject.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete("/subjects/delete-subject", {
              data: { id: subject.id },
            });
            setSubjects((prev) => prev.filter((s) => s.id !== subject.id));
         } catch (error: any) {
  Alert.alert("Error", error.response?.data?.message || "Unable to delete subject.");
}
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Subject }) => {
    const color = getSubjectColor(item.name);
    return (
      <View style={styles.card}>
        <View style={[styles.icon, { backgroundColor: `${color}20` }]}>
          <Ionicons name="book" size={22} color={color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.code}>{item.code}</Text>
          <Text style={styles.room}>{item.room || "No room assigned"}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              router.push({
                pathname: "/screens/timetable/edit-Subject",
                params: {
                  id: item.id,
                  name: item.name,
                  code: item.code,
                  room: item.room ?? "",
                },
              });
            }}
          >
            <Ionicons name="create-outline" size={24} color={COLORS.blue} />
          </Pressable>
          <Pressable onPress={() => deleteSubject(item)}>
            <Ionicons name="trash-outline" size={24} color={COLORS.red} />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.subtitle}>Add, edit or remove your subjects.</Text>

      <Pressable
        style={styles.addButton}
        onPress={() => router.push("/screens/timetable/add-subject")}
      >
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={styles.addText}>Add Subject</Text>
      </Pressable>

      <FlatList
        data={subjects}
        keyExtractor={(item) => String(item.id)}
        refreshing={!!loading}
        onRefresh={loadSubjects}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={60} color="#C4C4C4" />
            <Text style={styles.emptyTitle}>No subjects yet</Text>
            <Text style={styles.emptyText}>
              Tap "Add Subject" to get started.
            </Text>
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

  title: {
    fontSize: moderateScale(24),
    fontWeight: "800",
    color: COLORS.navy,
    textAlign: "center"
  },

  subtitle: {
    marginTop: verticalScale(6),
    marginBottom: verticalScale(20),
    color: "#6B7280",
    fontSize: moderateScale(14),
    textAlign: "center"

  },

  card: {
    backgroundColor: "#fff",
    borderRadius: scaleSize(16),
    padding: scaleSize(16),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(14),
  },

  icon: {
    width: scaleSize(50),
    height: scaleSize(50),
    borderRadius: scaleSize(14),
    justifyContent: "center",
    alignItems: "center",
  },

  info: {
    flex: 1,
    marginLeft: scaleSize(14),
  },

  name: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: COLORS.navy,
  },

  code: {
    fontSize: moderateScale(14),
    color: COLORS.green,
    fontWeight: "700",
    marginTop: verticalScale(2),
  },

  room: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    marginTop: verticalScale(4),
  },

  actions: {
    gap: scaleSize(16),
    flexDirection: "row",
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

  fab: {
    position: "absolute",
    bottom: verticalScale(24),
    right: scaleSize(24),
    width: scaleSize(60),
    height: scaleSize(60),
    borderRadius: scaleSize(30),
    backgroundColor: COLORS.blue,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
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