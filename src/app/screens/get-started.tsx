import COLORS from "@/constants/color";
import { googleAuthFlow } from "@/flow/authFlow";
import { clearAuthSession, saveToken } from "@/utils/token";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useUser } from "../../context/userContext";

export default function GetStartedScreen() {
  const [loading, setLoading] = useState(false);
const { loadUser } = useUser();


const handleGoogleLogin = async () => {
  if (loading) return;

  try {
    setLoading(true);

    const res = await googleAuthFlow();
    const token = res?.token;

    if (!token) throw new Error("Missing token");

    await clearAuthSession();
    await saveToken({ token });

    const profile = await loadUser();

    if (profile.onboardingCompleted) {
      router.replace("/screens/(tabs)/home");
    } else {
      router.replace("/screens/onBoarding/add-classes");
    }

  } catch (err: any) {
    Alert.alert("Google login failed", err.message);
  } finally {
    setLoading(false);
  }
};
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
      </View>

      <Text style={styles.title}>Choose how to continue</Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/screens/signup")}
      >
        <Text style={styles.buttonText}>Create Account with Email</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.googleButton]}
        onPress={handleGoogleLogin}
      >
        <Text style={styles.buttonText}>Continue with Google</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/screens/login")}
        style={styles.link}
      >
        <Text style={styles.linkText}>Already have an account? Log in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: COLORS.bgTop,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: "contain",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 30,
    color: COLORS.navy,
    textAlign: "center",
  },
  button: {
    backgroundColor: COLORS.blue,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
    elevation: 2,
  },
  googleButton: {
    backgroundColor: COLORS.orange,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    marginTop: 20,
  },
  linkText: {
    color: COLORS.blue,
    fontSize: 15,
    fontWeight: "500",
  },
});
