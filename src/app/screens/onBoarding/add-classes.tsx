import COLORS from "@/constants/color";
import { useOnboarding } from "@/context/onboardingContext";
import api from "@/utils/api";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Subject = {
  id: string;
  name: string;
  code: string;
  room: string;
};

// Simple unique id so two subjects with the same name never collide
// as FlatList keys (the old code used item.name as the key, which
// breaks on duplicates/typos).
let idCounter = 0;
const makeId = () => `subj_${Date.now()}_${idCounter++}`;

export default function AddClasses() {
  const { classes, setClasses } = useOnboarding();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSubject, setNewSubject] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const nameInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await api.get("/onboarding/classes");
        if (res.data.success) {
          const loaded = (res.data.data.classes ?? []).map((c: any) => ({
            id: c.id ?? makeId(),
            name: c.name,
            code: c.code ?? "",
            room: c.room ?? "",
          }));
          setSubjects(loaded);
        }
      } catch (error: any) {
        console.log("Load classes:", error?.response?.data || error.message);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  const toggleClass = (subject: Subject) => {
    const exists = classes.find((c) => c.name === subject.name);
    if (exists) {
      setClasses(classes.filter((c) => c.name !== subject.name));
    } else {
      setClasses([...classes, subject]);
    }
  };

  const addSubject = () => {
    const subject = newSubject.trim();
    if (!subject) {
      nameInputRef.current?.focus();
      return;
    }

    const duplicate = subjects.find(
      (item) => item.name.toLowerCase() === subject.toLowerCase()
    );

    if (duplicate) {
      setNewSubject("");
      setNewCode("");
      setNewRoom("");
      setJustAddedId(duplicate.id);
      setTimeout(() => setJustAddedId(null), 1200);
      return;
    }

    const newEntry: Subject = {
      id: makeId(),
      name: subject,
      code: newCode.trim(),
      room: newRoom.trim(),
    };

    setSubjects((prev) => [newEntry, ...prev]);
    setClasses([...classes, newEntry]);
    setNewSubject("");
    setNewCode("");
    setNewRoom("");

    setJustAddedId(newEntry.id);
    setTimeout(() => setJustAddedId(null), 1200);
  };

  const handleNext = async () => {
    try {
      if (classes.length === 0) {
        Alert.alert("Please select at least one class");
        return;
      }

      const res = await api.post("/onboarding/add-class", { classes });
      if (res.data.success) {
        router.push("/screens/onBoarding/timetable");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to save classes");
    }
  };

  const selectedCount = classes.length;

  const renderMeta = (item: Subject) => {
    const parts = [item.code, item.room].filter((p) => p && p.length > 0);
    if (parts.length === 0) return null;
    return <Text style={styles.subjectMeta}>{parts.join(" • ")}</Text>;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Add Your Subjects</Text>
        <Text style={styles.subtitle}>
          Add each subject you're taking this term
        </Text>

        <View style={styles.formCard}>
          <TextInput
            ref={nameInputRef}
            style={styles.input}
            placeholder="Subject name (e.g. CS 101)"
            placeholderTextColor={COLORS.navySoft}
            value={newSubject}
            onChangeText={setNewSubject}
            returnKeyType="next"
            numberOfLines={1}
          />
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputHalf]}
              placeholder="Code (optional)"
              placeholderTextColor={COLORS.navySoft}
              value={newCode}
              onChangeText={setNewCode}
            />
            <TextInput
              style={[styles.input, styles.inputHalf]}
              placeholder="Room (optional)"
              placeholderTextColor={COLORS.navySoft}
              value={newRoom}
              onChangeText={setNewRoom}
              returnKeyType="done"
              onSubmitEditing={addSubject}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
              !newSubject.trim() && styles.addButtonDisabled,
            ]}
            onPress={addSubject}
            disabled={!newSubject.trim()}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Subject</Text>
          </Pressable>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listHeaderText}>Your subjects</Text>
          {selectedCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{selectedCount} selected</Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.centerFill}>
            <ActivityIndicator size="small" color={COLORS.blue} />
          </View>
        ) : subjects.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="book-open-page-variant-outline"
              size={36}
              color={COLORS.navySoft}
            />
            <Text style={styles.emptyStateText}>
              No subjects yet — add your first one above
            </Text>
          </View>
        ) : (
          <FlatList
            style={{ marginTop: verticalScale(4), flex: 1 }}
            data={subjects}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isActive = classes.some((c) => c.name === item.name);
              const isJustAdded = item.id === justAddedId;
              return (
                <Pressable
                  style={[
                    styles.subjectCard,
                    isActive && styles.activeCard,
                    isJustAdded && styles.justAddedCard,
                  ]}
                  onPress={() => toggleClass(item)}
                >
                  <View style={styles.subjectInfo}>
                    <MaterialCommunityIcons
                      name="book-open-page-variant"
                      size={22}
                      color={isActive ? COLORS.blue : COLORS.navySoft}
                    />
                    <View style={{ marginLeft: 10, flexShrink: 1 }}>
                      <Text style={styles.subjectName}>{item.name}</Text>
                      {renderMeta(item)}
                    </View>
                  </View>

                  <Ionicons
                    name={isActive ? "checkmark-circle" : "ellipse-outline"}
                    size={24}
                    color={isActive ? COLORS.blue : COLORS.navySoft}
                  />
                </Pressable>
              );
            }}
          />
        )}

        <Pressable
          style={({ pressed }) => [
            styles.nextButton,
            pressed && styles.nextButtonPressed,
            selectedCount === 0 && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {selectedCount === 0 ? "Select a subject to continue" : "Next"}
          </Text>
          <Ionicons name="arrow-forward-circle" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: scaleSize(24),
    backgroundColor: COLORS.bgTop,
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: "800",
    color: COLORS.navy,
    textAlign: "center",
  },
  subtitle: {
    marginTop: verticalScale(6),
    marginBottom: verticalScale(16),
    color: COLORS.navySoft,
    fontSize: moderateScale(14),
    textAlign: "center",
  },

  // Grouped input card so the "create" section reads as one unit,
  // visually separate from the "select" list below it.
  formCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(14),
    padding: scaleSize(16),
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: "#E7ECF4",
  },
  inputRow: {
    flexDirection: "row",
    gap: scaleSize(10),
  },
  inputHalf: {
    flex: 1,
  },
  input: {
    borderWidth: scaleSize(1),
    borderColor: "#E2E8F2",
    borderRadius: moderateScale(10),
    paddingHorizontal: scaleSize(14),
    paddingVertical: verticalScale(12),
    backgroundColor: "#F8FAFD",
    marginBottom: verticalScale(10),
    fontSize: moderateScale(15),
    color: COLORS.navy,
    height: verticalScale(46), // fixed height keeps placeholder from wrapping/clipping
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.blue,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    justifyContent: "center",
  },
  addButtonPressed: {
    opacity: 0.85,
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: scaleSize(8),
    fontSize: moderateScale(15),
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(8),
  },
  listHeaderText: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: COLORS.navy,
  },
  countBadge: {
    backgroundColor: "#EAF3FF",
    paddingHorizontal: scaleSize(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(20),
  },
  countBadgeText: {
    color: COLORS.blue,
    fontSize: moderateScale(12),
    fontWeight: "700",
  },

  centerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scaleSize(32),
  },
  emptyStateText: {
    marginTop: verticalScale(10),
    color: COLORS.navySoft,
    fontSize: moderateScale(14),
    textAlign: "center",
  },

  subjectCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: verticalScale(14),
    paddingHorizontal: scaleSize(14),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(10),
    borderWidth: scaleSize(1),
    borderColor: "#E7ECF4",
  },
  activeCard: {
    borderColor: COLORS.blue,
    backgroundColor: "#F0F8FF",
  },
  // Brief highlight so adding/duplicate-tapping a subject gives
  // visible feedback instead of silently updating the list.
  justAddedCard: {
    borderColor: COLORS.blue,
    borderWidth: 2,
  },
  subjectInfo: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  subjectName: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: COLORS.navy,
  },
  subjectMeta: {
    fontSize: moderateScale(12),
    color: COLORS.navySoft,
    marginTop: verticalScale(2),
  },

  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.orange,
    paddingVertical: verticalScale(14),
    paddingHorizontal: scaleSize(20),
    borderRadius: moderateScale(10),
    justifyContent: "center",
    marginTop: verticalScale(16),
  },
  nextButtonPressed: {
    opacity: 0.85,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "700",
    marginRight: scaleSize(8),
    fontSize: moderateScale(15),
  },
});