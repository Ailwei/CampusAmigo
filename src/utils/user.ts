
import axios from "axios";
import Constants from "expo-constants";
import { getToken } from "./token";

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export const getUserProfile = async () => {
  const token = await getToken();

  const res = await axios.get(`${BASE_URL}/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.data;
};