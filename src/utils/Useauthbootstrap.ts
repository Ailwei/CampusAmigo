import { router } from "expo-router";
import { useEffect, useState } from "react";
import { bootstrapAuth } from "@/utils/token";


export function useAuthBootstrap() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { loggedIn, user } = await bootstrapAuth();
      if (loggedIn) {
        if (user.onboardingCompleted) {
          router.replace("/screens/(tabs)/home");
        } else {
          router.replace("/screens/onBoarding/add-classes");
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  return { loading };
}