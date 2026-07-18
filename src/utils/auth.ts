import { Alert } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { clearAuthSession } from "./token";

export const logoutUser = async (navigation: any) => {
  try {
    await clearAuthSession();

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  } catch (error: unknown) {
    console.error("Logout error:", error);

    Alert.alert(
      "Logout Failed",
      "Something went wrong while logging you out. Please try again."
    );
  }
};