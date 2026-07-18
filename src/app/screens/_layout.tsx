import { Stack } from "expo-router";
import { OnboardingProvider } from "../../context/onboardingContext";
import { UserProvider } from "../../context/userContext";

export default function Layout() {
  return (
    <UserProvider>
      <OnboardingProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" options={{ headerShown: true, title: "" }} />
          <Stack.Screen name="signup" options={{ headerShown: true, title: "" }} />
          <Stack.Screen name="details" options={{ headerShown: true, title: "Details" }} />
          <Stack.Screen name="onBoarding/add-classes" options={{ headerShown: true, title: "Add Subjects" }} />
          <Stack.Screen name="onBoarding/timetable" options={{ headerShown: true, title: "Time Table" }} />
          <Stack.Screen name="onBoarding/summary" options={{ headerShown: true, title: "Summary" }} />
          <Stack.Screen name="weeklyTimeTable" options={{ headerShown: true, title: "Weekly Schedule" }} />
          <Stack.Screen name="timetable/edit-Subject" options={{ headerShown: true, title: "Edit Subject" }} />
          <Stack.Screen name="timetable/manage-subjects" options={{ headerShown: true, title: "Manage Subjects" }} />
          <Stack.Screen name="timetable/add-timetable" options={{ headerShown: true, title: "Time Table" }} />
          <Stack.Screen name="timetable/add-subject" options={{ headerShown: true, title: "Add Subject" }} />
        </Stack>
      </OnboardingProvider>
    </UserProvider>
  );
}