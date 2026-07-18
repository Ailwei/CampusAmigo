import { View, Text, TextInput, Pressable, StyleSheet, Image, Alert } from "react-native";
import COLORS from "@/constants/color";
import { useState } from "react";
import api from "@/utils/api";
import { router } from "expo-router";
import { scaleSize, verticalScale, moderateScale } from "../../utils/responsive"

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCreateAccount = async () => {
    try {
      if (!firstName || !lastName || !email || !password) {
        Alert.alert("All fields are required");
        return;
      }
      const newUser = await api.post(
        "/auth/register",
        {
          firstName,
          lastName,
          email,
          password,
        }
      );
   router.push("/screens/login");
    } catch (error: any) {
      Alert.alert(
        "Register error",
        error?.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("@/assets/images/logo.png")} style={styles.logo} />

      <Text style={styles.title}>Join Campus Amigo</Text>

      <TextInput
        placeholder="First Name"
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        placeholder="Last Name"
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        placeholder="Email"
        style={styles.input}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />


      <Pressable
        style={styles.signupButton}
        onPress={handleCreateAccount}
      >
        <Text style={styles.signupButtonText}>Sign Up</Text>
      </Pressable>


      <Pressable onPress={() => router.push("/screens/login")}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
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

  signupButton: {
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

  signupButtonText: {
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
