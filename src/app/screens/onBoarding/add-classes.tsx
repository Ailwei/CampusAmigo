import COLORS from "@/constants/color";
import { useOnboarding } from "@/context/onboardingContext";
import api from "@/utils/api";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

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
        setSubjects(res.data.data.classes ?? []);
      }
    } catch (error: any) {
      console.log("Load classes:", error?.response?.data || error.message);

      setSubjects([]);
    }
  };

  loadSubjects();
}, []);
  const toggleClass = (subject: { name: string; code: string; room: string }) => {
  const exists = classes.find((c) => c.name === subject.name);
  if (exists) {
    setClasses(classes.filter((c) => c.name !== subject.name));
  } else {
    setClasses([...classes, subject]);
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
      code: newCode?.trim() ?? "",
      room: newRoom?.trim() ?? "",
    };

    setSubjects([...subjects, newEntry]);
    setClasses([...classes, newEntry]);
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
  renderItem={({ item }) => {
    const isActive = classes.some((c) => c.name === item.name);
    return (
      <Pressable
        style={[styles.subjectCard, isActive && styles.activeCard]}
        onPress={() => toggleClass(item)}
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

        {isActive ? (
          <Ionicons name="checkmark-circle" size={24} color={COLORS.blue} />
        ) : (
          <Ionicons name="ellipse-outline" size={24} color={COLORS.navySoft} />
        )}
      </Pressable>
    );
  }}
/>


      <Pressable style={styles.nextButton} onPress={handleNext}>
        <Ionicons name="arrow-forward-circle" size={22} color="#fff" />
        <Text style={styles.nextButtonText}>Next</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: scaleSize(24), 
    backgroundColor: COLORS.bgTop 
  },
  title: { 
    fontSize: moderateScale(24), 
    fontWeight: "800", 
    color: COLORS.navy 
  },
  subtitle: { 
    marginVertical: verticalScale(12), 
    color: COLORS.navySoft, 
    fontSize: moderateScale(15) 
  },
  input: {
    borderWidth: scaleSize(1),
    borderColor: COLORS.navySoft,
    borderRadius: moderateScale(10),
    paddingHorizontal: scaleSize(14),
    paddingVertical: verticalScale(12),
    backgroundColor: "#fff",
    marginBottom: verticalScale(12),
    elevation: 1,
    width: "100%",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.blue,
    paddingVertical: verticalScale(14),
    paddingHorizontal: scaleSize(20),
    borderRadius: moderateScale(10),
    justifyContent: "center",
    marginTop: verticalScale(8),
  },
  addButtonText: { 
    color: "#fff", 
    fontWeight: "700", 
    marginLeft: scaleSize(8), 
    fontSize: moderateScale(15) 
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
    backgroundColor: "#F0F8FF" 
  },
  subjectInfo: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  subjectName: { 
    fontSize: moderateScale(16), 
    fontWeight: "700", 
    color: COLORS.navy 
  },
  subjectMeta: { 
    fontSize: moderateScale(13), 
    color: COLORS.navySoft 
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.orange,
    paddingVertical: verticalScale(14),
    paddingHorizontal: scaleSize(20),
    borderRadius: moderateScale(10),
    justifyContent: "center",
    marginTop: verticalScale(24),
    zIndex: 10,
    position: "relative",
  },
  nextButtonText: { 
    color: "#fff", 
    fontWeight: "700", 
    marginLeft: scaleSize(8), 
    fontSize: moderateScale(15) 
  },
});
