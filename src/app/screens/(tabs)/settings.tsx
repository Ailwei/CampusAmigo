import { useOnboarding } from "@/context/onboardingContext";
import { removeToken } from "@/utils/token";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Settings() {
  const router = useRouter();
  const { resetOnboarding } = useOnboarding();

  const handleLogout = async () => {
    await removeToken();
    resetOnboarding();

    router.replace("/screens/get-started");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TouchableOpacity onPress={handleLogout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}