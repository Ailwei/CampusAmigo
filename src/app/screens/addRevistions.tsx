import COLORS from "@/constants/color";
import { useUser } from "@/context/userContext";
import api from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

const toDateString = (date: Date) => date.toISOString().split("T")[0];

const daysUntil = (date: string) => {
  const today = new Date();
  const target = new Date(date);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const dueColor = (days: number) => {
  if (days <= 1) return "#EF4444";
  if (days <= 5) return "#F97316";
  return "#10B981";
};

export default function RevisionScreen() {
  const { user, loadUser } = useUser();

  const [revisions, setRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [progress, setProgress] = useState("0");
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!user) loadUser();
  }, [user, loadUser]);

  useEffect(() => {
    const options = (user?.classes || [])
      .map((item: any) => (typeof item === "string" ? item : item?.name || ""))
      .filter(Boolean);
    setSubjectOptions(options);
  }, [user]);

  useEffect(() => {
    const loadRevisions = async () => {
      try {
        const res = await api.get("/revision/get-revision");
        if (res.data.success && Array.isArray(res.data.data.revisions)) {
          setRevisions(res.data.data.revisions);
        }
      } catch (error: any) {
        Alert.alert("Error", error?.response?.data?.message || "Failed to load revisions");
      } finally {
        setLoading(false);
      }
    };
    loadRevisions();
  }, []);

  const resetForm = () => {
    setShowForm(false);
    setSubject("");
    setTopic("");
    setDate(null);
    setProgress("0");
  };

  const handleAdd = async () => {
    if (!subject || !topic.trim() || !date) {
      Alert.alert("Missing Fields", "Subject, topic, and date are required.");
      return;
    }

    const progressNum = Math.min(100, Math.max(0, Number(progress) || 0));

    try {
      const res = await api.post("/revision/add-revision", {
        subject,
        topic: topic.trim(),
        date: toDateString(date),
        progress: progressNum,
      });

      if (res.data.success) {
        setRevisions(res.data.data.revisions || []);
        resetForm();
      } else {
        Alert.alert("Error", res.data.message || "Failed to save revision");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to save revision");
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={["top", "left", "right"]}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={styles.loadingText}>Loading revisions...</Text>
      </SafeAreaView>
    );
  }

  const sorted = [...revisions].sort((a, b) => daysUntil(a.date) - daysUntil(b.date));

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {!showForm ? (
          <FlatList
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 100 }}
            data={sorted}
            keyExtractor={(item) => item.createdAt?.toString()}
            ListHeaderComponent={<Text style={styles.heading}>Revision Plan</Text>}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="book-outline" size={60} color="#CBD5E1" />
                <Text style={styles.empty}>No revisions found.</Text>
                <Text style={styles.emptySub}>Add your first revision below</Text>
              </View>
            }
            renderItem={({ item }) => {
              const left = daysUntil(item.date);
              return (
                <View style={styles.card}>
                  <View style={styles.topRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subject}>{item.subject}</Text>
                      <Text style={styles.topic}>{item.topic}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: dueColor(left) }]}>
                      <Text style={styles.badgeText}>{left <= 0 ? "Due!" : `${left} days`}</Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#687588" />
                    <Text style={styles.info}>{item.date}</Text>
                  </View>

                  <View style={styles.progressBackground}>
                    <View style={[styles.progressFill, { width: `${item.progress || 0}%` }]} />
                  </View>
                  <Text style={styles.progressText}>Progress {item.progress || 0}%</Text>
                </View>
              );
            }}
          />
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>Subject</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={subject} onValueChange={(value) => setSubject(value)}>
                <Picker.Item label="Select subject" value="" color="#9CA3AF" />
                {subjectOptions.map((option) => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>

            <TextInput
              placeholder="Topic"
              value={topic}
              onChangeText={setTopic}
              style={styles.input}
            />

            <Pressable style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text style={{ color: date ? COLORS.navy : "#9CA3AF" }}>
                {date ? toDateString(date) : "Select Revision Date"}
              </Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={date || new Date()}
                mode="date"
                display="default"
                onChange={onChangeDate}
              />
            )}

            <Text style={styles.label}>Progress (%)</Text>
            <TextInput
              placeholder="0"
              value={progress}
              onChangeText={setProgress}
              keyboardType="number-pad"
              style={styles.input}
            />

            <Pressable style={styles.button} onPress={handleAdd}>
              <Text style={styles.buttonText}>Save Revision</Text>
            </Pressable>

            <Pressable style={[styles.button, { backgroundColor: "#7A8599" }]} onPress={resetForm}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        )}

        {!showForm && (
          <View style={styles.bottomButtonContainer}>
            <Pressable style={styles.button} onPress={() => setShowForm(true)}>
              <Text style={styles.buttonText}>+ Add Revision</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F6F8FC" },
  container: { flex: 1, backgroundColor: "#F6F8FC", padding: 20 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F8FC",
  },
  loadingText: { marginTop: 12, fontSize: 16, color: COLORS.navySoft },
  heading: { fontSize: 26, fontWeight: "800", color: COLORS.navy, marginBottom: 20 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  subject: { fontSize: 16, fontWeight: "700", color: COLORS.navy },
  topic: { fontSize: 14, color: "#7A8599", marginTop: 2 },
  badge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  badgeText: { color: "#fff", fontWeight: "700" },
  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  info: { color: "#687588", marginLeft: 6 },
  progressBackground: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 18,
  },
  progressFill: { height: 10, backgroundColor: COLORS.blue, borderRadius: 5 },
  progressText: { marginTop: 8, fontWeight: "600", color: COLORS.navy },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  empty: { color: COLORS.navySoft, fontSize: 18, fontWeight: "600", marginTop: 16 },
  emptySub: { color: "#94A3B8", marginTop: 8 },

  form: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    margin: 20,
  },
  label: { fontSize: 14, fontWeight: "600", color: COLORS.navy, marginBottom: 6, marginTop: 4 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },

  button: {
    backgroundColor: COLORS.blue,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  bottomButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
});