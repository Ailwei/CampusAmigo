import { CommonActions } from "@react-navigation/native";
import { removeToken } from "./token";

export const logoutUser = async (navigation: any) => {
  try {
    await removeToken();
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
