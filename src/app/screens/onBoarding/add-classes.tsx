import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import COLORS from "@/constants/color";
import { useOnboarding } from "@/app/context/onboardingContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import api from "@/utils/api";

export default function AddClasses() {
  const { classes, setClasses } = useOnboarding();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newRoom, setNewRoom] = useState("");

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await api.get("/onboarding/classes");
        if (res.data.success) {
          setSubjects(res.data.data.classes);
        }
      } catch (error: any) {
        Alert.alert("Error", error?.response?.data?.message || "Failed to load classes");
      }
    };
    loadSubjects();
  }, []);

  const toggleClass = (subjectName: string) => {
    if (classes.includes(subjectName)) {
      setClasses(classes.filter((c) => c !== subjectName));
    } else {
      setClasses([...classes, subjectName]);
    }
  };

  const addSubject = () => {
    const subject = newSubject.trim();
    if (!subject) return;

    if (subjects.some((item) => item.name.toLowerCase() === subject.toLowerCase())) {
      setNewSubject("");
      setNewCode("");
      setNewRoom("");
      return;
    }

    const newEntry = {
      name: subject,
      code: newCode.trim() || "N/A",
      room: newRoom.trim() || "N/A",
    };

    setSubjects([...subjects, newEntry]);
    setClasses([...classes, subject]);
    setNewSubject("");
    setNewCode("");
    setNewRoom("");
  };

  const handleNext = async () => {
    try {
      if (classes.length === 0) {
        Alert.alert("Please select at least one class");
        return;
      }

      const res = await api.post("/onboarding/add-class", { classes });
      if (res.data.success) {
        Alert.alert("Success", "Classes saved successfully");
        router.push("/screens/onBoarding/timetable");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to save classes");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Your Classes</Text>
      <Text style={styles.subtitle}>Select your classes or add your own.</Text>

      <TextInput
        style={styles.input}
        placeholder="Subject name (e.g. Computer Science 101)"
        value={newSubject}
        onChangeText={setNewSubject}
      />
      <TextInput
        style={styles.input}
        placeholder="Subject code (optional)"
        value={newCode}
        onChangeText={setNewCode}
      />
      <TextInput
        style={styles.input}
        placeholder="Room / Venue (optional)"
        value={newRoom}
        onChangeText={setNewRoom}
      />

      <Pressable style={styles.addButton} onPress={addSubject}>
        <Ionicons name="add-circle-outline" size={22} color="#fff" />
        <Text style={styles.addButtonText}>Add Subject</Text>
      </Pressable>

      <FlatList
        style={{ marginTop: 20 }}
        data={subjects}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.subjectCard,
              classes.includes(item.name) && styles.activeCard,
            ]}
            onPress={() => toggleClass(item.name)}
          >
            <View style={styles.subjectInfo}>
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={24}
                color={COLORS.blue}
              />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.subjectName}>{item.name}</Text>
                <Text style={styles.subjectMeta}>
                  {item.code} • {item.room}
                </Text>
              </View>
            </View>

            {classes.includes(item.name) ? (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.blue} />
            ) : (
              <Ionicons name="ellipse-outline" size={24} color={COLORS.navySoft} />
            )}
          </Pressable>
        )}
      />

      <Pressable style={styles.nextButton} onPress={handleNext}>
        <Ionicons name="arrow-forward-circle" size={22} color="#fff" />
        <Text style={styles.nextButtonText}>Next</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: COLORS.bgTop },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.navy },
  subtitle: { marginVertical: 12, color: COLORS.navySoft },
  input: {
    borderWidth: 1,
    borderColor: COLORS.navySoft,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.blue,
    padding: 14,
    borderRadius: 10,
    justifyContent: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "700", marginLeft: 8 },
  subjectCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E7ECF4",
  },
  activeCard: { borderColor: COLORS.blue, backgroundColor: "#F0F8FF" },
  subjectInfo: { flexDirection: "row", alignItems: "center" },
  subjectName: { fontSize: 16, fontWeight: "700", color: COLORS.navy },
  subjectMeta: { fontSize: 13, color: COLORS.navySoft },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.orange,
    padding: 14,
    borderRadius: 10,
    justifyContent: "center",
    marginTop: 24,
  },
  nextButtonText: { color: "#fff", fontWeight: "700", marginLeft: 8 },
});
