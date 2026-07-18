import COLORS from "@/constants/color";
import api from "@/utils/api";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  moderateScale,
  scaleSize,
  verticalScale,
} from "@/utils/responsive";

export default function EditSubjectScreen() {
  const {
    id,
    name: subjectName,
    code: subjectCode,
    room: subjectRoom,
  } = useLocalSearchParams();

  const [name, setName] = useState(String(subjectName ?? ""));
  const [code, setCode] = useState(String(subjectCode ?? ""));
  const [room, setRoom] = useState(String(subjectRoom ?? ""));
  const [saving, setSaving] = useState(false);

  const updateSubject = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Subject name is required.");
      return;
    }

    if (!code.trim()) {
      Alert.alert("Validation", "Subject code is required.");
      return;
    }

    try {
      setSaving(true);
      const res = await api.put("/timetable/update-subject", {
        id,
        name: name.trim(),
        code: code.trim(),
        room: room.trim(),
      });

      if (res.data.success) {
        Alert.alert("Success", "Subject updated!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error: any) {

  Alert.alert(
    "Error",
    error.response?.data?.message || "Failed to update subject."
  );
}
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.subtitle}>
        Update your subject information below.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Subject Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Subject Code"
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
      />

      <TextInput
        style={styles.input}
        placeholder="Room (optional)"
        value={room}
        onChangeText={setRoom}
      />

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          saving && styles.buttonDisabled,
        ]}
        onPress={updateSubject}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "Updating..." : "Update Subject"}
        </Text>
      </Pressable>
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
  },

  subtitle: {
    marginTop: verticalScale(6),
    marginBottom: verticalScale(24),
    fontSize: moderateScale(14),
    color: COLORS.navySoft,
    textAlign: "center"

  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scaleSize(12),
    paddingHorizontal: scaleSize(16),
    paddingVertical: verticalScale(14),
    fontSize: moderateScale(15),
    marginBottom: verticalScale(16),
    color: COLORS.navy,
  },

  button: {
    marginTop: verticalScale(10),
    backgroundColor: COLORS.green,
    borderRadius: scaleSize(12),
    paddingVertical: verticalScale(16),
    alignItems: "center",
  },

  buttonPressed: {
    opacity: 0.85,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: moderateScale(16),
  },
});