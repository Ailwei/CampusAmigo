import COLORS from "@/constants/color";
import api from "@/utils/api";
import { clearAuthSession, saveToken } from "@/utils/token";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useUser } from "../../context/userContext";
import { scaleSize, verticalScale, moderateScale } from "../../utils/responsive"

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const { loadUser } = useUser();

 const handleLogin = async () => {
  try {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please fill in email and password");
      return;
    }

    const loginUser = await api.post("/auth/login", { email, password });
    const token = loginUser.data?.data?.token;

    if (!token) {
      Alert.alert("Error", "No token received from server");
      return;
    }

    await clearAuthSession();
    await saveToken({ token });

    const profile = await loadUser();

    if (!profile) {
      throw new Error("Failed to load user profile");
    }

    if (profile.onboardingCompleted) {
      router.replace("/screens/(tabs)/home");
    } else {
      router.replace("/screens/onBoarding/add-classes");
    }

  } catch (error: any) {

    Alert.alert(
      "Login failed",
      error?.response?.data?.message || "Something went wrong"
    );
  }
};

  return (
    <View style={styles.container}>
      <Image source={require("@/assets/images/logo.png")} style={styles.logo} />

      <Text style={styles.title}>Login to your Campus Amigo</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/screens/signup")}>
        <Text style={styles.linkText}>Don’t have an account? Sign up</Text>
      </Pressable>
      <Pressable onPress={() => router.push("/screens/forgot-password")}>
        <Text style={styles.linkText}>Forgot your password?</Text>
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
  logo: {
    width: scaleSize(140),
    height: verticalScale(140),
    resizeMode: "contain",
    marginBottom: verticalScale(24),
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: "800",
    marginVertical: verticalScale(16),
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
  loginButton: {
  backgroundColor: COLORS.blue,
  paddingVertical: verticalScale(14),
  paddingHorizontal: scaleSize(40),
  borderRadius: moderateScale(12),
  marginTop: verticalScale(20),
  width: "85%",
  alignItems: "center",
  elevation: 2,
  zIndex: 10,
  position: "relative",
},

  loginButtonText: {
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
