import { View, Text, TextInput, Pressable, StyleSheet, Image, Alert } from "react-native";
import COLORS from "@/constants/color";
import { useState } from "react";
import api from "@/utils/api";
import { router } from "expo-router";

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
      console.log(error);
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
    padding: 24,
    backgroundColor: COLORS.bgTop,
  },

  logo: {
    width: 140,
    height: 140,
    resizeMode: "contain",
    marginBottom: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    marginVertical: 16,
    color: COLORS.navy,
    textAlign: "center",
  },

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

  signupButton: {
    backgroundColor: COLORS.blue,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 20,
    width: "85%",
    alignItems: "center",
    elevation: 2,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  linkText: {
    marginTop: 18,
    color: COLORS.orange,
    fontSize: 15,
    fontWeight: "600",
  },
});
