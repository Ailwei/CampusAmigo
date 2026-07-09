import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import COLORS from "@/constants/color";
import api from "@/utils/api";
import { useState } from "react";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleReset = async () => {
    try {
      if (!email) {
        Alert.alert("Email is required");
        return;
      }

      const res = await api.post("/auth/forgot-password", { email });

      Alert.alert("Success", res.data.message || "Password reset link sent");
     router.push({
      pathname: "/screens/reset-password",
      params: { email },
    });
    } catch (error: any) {
      console.log(error);
      Alert.alert(
        "Reset error",
        error?.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>

      <TextInput
        placeholder="Enter your email"
        style={styles.input}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Pressable style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetButtonText}>Send Reset Link</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/screens/login")}>
        <Text style={styles.linkText}>Back to Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scaleSize(24),
    backgroundColor: COLORS.bgTop,
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: "800",
    marginBottom: verticalScale(20),
    color: COLORS.navy,
    textAlign: "center",
  },
  input: {
    width: "85%",
    borderWidth: scaleSize(1),
    borderColor: COLORS.navySoft,
    borderRadius: moderateScale(10),
    paddingHorizontal: scaleSize(14),
    paddingVertical: verticalScale(12),
    backgroundColor: "#fff",
    marginVertical: verticalScale(8),
    elevation: 1,
  },
  resetButton: {
    backgroundColor: COLORS.blue,
    paddingVertical: verticalScale(14),
    paddingHorizontal: scaleSize(40),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(20),
    width: "85%",
    alignItems: "center",
    elevation: 2,
    zIndex: 10,            // ensures button is always clickable
    position: "relative",  // helps stacking order
  },
  resetButtonText: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "700",
  },
  linkText: {
    marginTop: verticalScale(18),
    color: COLORS.orange,
    fontSize: moderateScale(15),
    fontWeight: "600",
  },
});
