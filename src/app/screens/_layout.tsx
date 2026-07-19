import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OnboardingProvider } from "../../context/onboardingContext";
import { UserProvider } from "../../context/userContext";
import COLORS from "@/constants/color";

export default function Layout() {
  const router = useRouter();

  return (
    <UserProvider>
      <OnboardingProvider>
        <Stack
          screenOptions={{
            headerShown: false,
              headerBackButtonDisplayMode: "minimal",
            headerTintColor: COLORS.navy,
            headerShadowVisible: false,
            headerTitleAlign: "center",
            headerLeft: ({ canGoBack }) =>
              canGoBack ? (
                <TouchableOpacity
                  onPress={() => router.back()}
                  hitSlop={10}
                  style={{ paddingRight: 12 }}
                >
                  <Ionicons name="chevron-back" size={26} color={COLORS.navy} />
                </TouchableOpacity>
              ) : null,
          }}
        >
          <Stack.Screen name="login" options={{ headerShown: true, title: "" }} />
          <Stack.Screen name="signup" options={{ headerShown: true, title: "" }} />
          <Stack.Screen name="onBoarding/add-classes" options={{ headerShown: true, title: "Add Subjects" }} />
          <Stack.Screen name="onBoarding/timetable" options={{ headerShown: true, title: "Time Table" }} />
          <Stack.Screen name="onBoarding/summary" options={{ headerShown: true, title: "Summary" }} />
          <Stack.Screen name="timetable/edit-Subject" options={{ headerShown: true, title: "Edit Subject" }} />
          <Stack.Screen name="timetable/manage-subjects" options={{ headerShown: true, title: "Manage Subjects" }} />
          <Stack.Screen name="timetable/add-timetable" options={{ headerShown: true, title: "Time Table" }} />
          <Stack.Screen name="timetable/add-subject" options={{ headerShown: true, title: "Add Subject" }} />
          <Stack.Screen name="screens/weeklySchedule" options={{ headerShown: true, title: "My Timetable" }} />
        </Stack>
      </OnboardingProvider>
    </UserProvider>
  );
}