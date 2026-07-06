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
  } catch (error) {
    console.log("Logout error:", error);
  }
};
