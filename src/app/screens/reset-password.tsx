import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import COLORS from "@/constants/color";
import api from "@/utils/api";
import { useState } from "react";
import { moderateScale, scaleSize, verticalScale } from "@/utils/responsive";


export default function ResetPassword() {
 const { email } = useLocalSearchParams<{ email?: string }>();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = async () => {
    try {
      if (!otp || !password || !confirmPassword) {
        Alert.alert("Missing fields", "Please fill in all fields");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Password mismatch", "Passwords do not match");
        return;
      }

      const res = await api.post("/auth/reset-Password", {
        email,
        otp,
        newPassword: password,
      });
 
      Alert.alert("Success", res.data.message || "Password reset successful");
      router.push("/screens/login");
    } catch (error: any) {
      console.log(error);
      Alert.alert(
        "Reset failed",
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>

      <TextInput
        style={styles.input}
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        placeholder="Enter OTP"
        placeholderTextColor="#888"
      />

      <TextInput
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="Enter new password"
        placeholderTextColor="#888"
      />

      <TextInput
        style={styles.input}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm password"
        placeholderTextColor="#888"
      />

      <Pressable style={styles.resetButton} onPress={handleResetPassword}>
        <Text style={styles.resetButtonText}>Reset Password</Text>
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
