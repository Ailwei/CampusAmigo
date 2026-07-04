import { Stack } from "expo-router";
import { OnboardingProvider } from "../context/onboardingContext";

export default function Layout() {
  return (
    <OnboardingProvider>
  <Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="login" options={{ headerShown: true, title: "Login" }} />
  <Stack.Screen name="signup" options={{ headerShown: true, title: "Sign Up" }} />
  <Stack.Screen name="details" options={{ headerShown: true, title: "Details" }} />
  <Stack.Screen name="onBoarding/add-classes" options={{ headerShown: true, title: "Add Classes" }} />
  <Stack.Screen name="onBoarding/timetable" options={{ headerShown: true, title: "Time Table" }} />
  <Stack.Screen name="onBoarding/summary" options={{ headerShown: true, title: "Summary" }} />
  <Stack.Screen name="weeklyTimeTable"options={{ headerShown: true, title: "Weekly Schedule" }} />
</Stack>

    </OnboardingProvider>
  );
}
