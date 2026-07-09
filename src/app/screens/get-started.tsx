import COLORS from "@/constants/color";
import { googleAuthFlow } from "@/flow/authFlow";
import { clearAuthSession, saveToken } from "@/utils/token";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useUser } from "../../context/userContext";
import { scaleSize, moderateScale, verticalScale } from "@/utils/responsive";
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
    padding: scaleSize(24),
    backgroundColor: COLORS.bgTop,
  },
  logoContainer: {
    marginBottom: verticalScale(40),
    alignItems: "center",
  },
  logo: {
    width: scaleSize(140),
    height: verticalScale(140),
    resizeMode: "contain",
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: "700",
    marginBottom: verticalScale(30),
    color: COLORS.navy,
    textAlign: "center",
  },
  button: {
    backgroundColor: COLORS.blue,
    paddingVertical: verticalScale(14),
    paddingHorizontal: scaleSize(40),
    borderRadius: moderateScale(12),
    marginVertical: verticalScale(10),
    width: "85%",
    alignItems: "center",
    elevation: 2,
    zIndex: 10,
  },
  googleButton: {
    backgroundColor: COLORS.orange,
  },
  buttonText: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  link: {
    marginTop: verticalScale(20),
  },
  linkText: {
    color: COLORS.blue,
    fontSize: moderateScale(15),
    fontWeight: "500",
  },
});
