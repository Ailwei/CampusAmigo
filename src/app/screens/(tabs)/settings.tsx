import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useOnboarding } from "@/context/onboardingContext";
import { removeToken } from "@/utils/token";
import api from "@/utils/api";

export default function Settings() {
  const router = useRouter();
  const { resetOnboarding } = useOnboarding();

  const handleLogout = async () => {
    await removeToken();
    resetOnboarding();
    router.replace("/screens/get-started");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure? This will permanently delete your account and all your data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await api.delete("/auth/delete-account");

              if (res.data.success) {
                await removeToken();
                resetOnboarding();
                router.replace("/screens/get-started");
              }
            } catch {
              Alert.alert(
                "Error",
                "Failed to delete your account. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
      }}
    >
      <TouchableOpacity onPress={handleLogout}>
        <Text>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDeleteAccount}>
        <Text style={{ color: "red" }}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
}