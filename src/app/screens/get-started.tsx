import { View, Text, Pressable, StyleSheet, Image, Alert } from "react-native";
import { router } from "expo-router";
import COLORS from "@/constants/color";
import { googleAuthFlow } from "@/flow/authFlow";
import { getUserProfile } from "@/utils/user";
import { saveToken } from "@/utils/token";

export default function GetStartedScreen() {
  const handleGoogleLogin = async () => {
  try {
    const res = await googleAuthFlow();
    const user = res?.user;
    const token = res?.token;

    if (!user || !token) throw new Error("Missing user data");

    await saveToken({ token });

    const profile = await getUserProfile();

    if (profile.onboardingCompleted) {
      router.replace("/screens/(tabs)/home");
    } else {
      router.replace("/screens/onBoarding/add-classes");
    }
  } catch (err: any) {
    Alert.alert("Google login failed", err.message);
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
