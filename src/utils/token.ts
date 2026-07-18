import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserProfile } from "./user";

type Props = {
    token: string,
}

export const saveToken = async ({token}: Props) => {
  try {
    await AsyncStorage.setItem("token", token);
  } catch (error) {
    console.error("Save token error:", error);
    throw error
  }
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    return token;
  } catch (error) {
    console.error("Get token error:", error);
    throw error

  }
};

export const clearAuthSession = async () => {
  try {
    await AsyncStorage.removeItem("token");
  } catch (error) {
    console.error("Clear auth session error:", error);
    throw error
  }
};

export const removeToken = async () => {
  await clearAuthSession();
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
  }catch (error) {
  console.error("Bootstrap auth error:", error);

  return {
    loggedIn: false,
    user: null,
  };
}
};