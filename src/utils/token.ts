import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserProfile } from "./user";

type Props = {
    token: string,
}

export const saveToken = async ({token}: Props) => {
  try {
    await AsyncStorage.setItem("token", token);
  } catch (error) {
    console.log("Save token error:", error);
  }
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    return token;
  } catch (error) {
    console.log("Get token error:", error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem("token");
  } catch (error) {
    console.log("Remove token error:", error);
  }
};

export const bootstrapAuth = async () => {
  try {
    const token = await getToken();

    if (!token) {
      return {
        loggedIn: false,
        user: null,
      };
    }

    const user = await getUserProfile();

    return {
      loggedIn: true,
      user,
    };
  } catch (error) {
    return {
      loggedIn: false,
      user: null,
    };
  }
};