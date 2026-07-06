import COLORS from "@/constants/color";
import api from "@/utils/api";
import { clearAuthSession, saveToken } from "@/utils/token";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useUser } from "../../context/userContext";

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
    console.log("Login failed:", error?.response?.data || error.message);

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
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: COLORS.bgTop },
  logo: { width: 140, height: 140, resizeMode: "contain", marginBottom: 24 },
  title: { fontSize: 22, fontWeight: "800", marginVertical: 16, color: COLORS.navy, textAlign: "center" },
  input: {
    width: "85%",
    borderWidth: 1,
    borderColor: COLORS.navySoft,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginVertical: 8,
    elevation: 1,
  },
  loginButton: {
    backgroundColor: COLORS.blue,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 20,
    width: "85%",
    alignItems: "center",
    elevation: 2,
  },
  loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  linkText: { marginTop: 18, color: COLORS.orange, fontSize: 15, fontWeight: "600" },
});
