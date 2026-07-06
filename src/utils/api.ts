import axios from "axios";
import Constants from "expo-constants";
import { clearAuthSession, getToken } from "./token";

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();

  const isAuthEndpoint = config.url?.startsWith("/auth/");
  if (!token && !isAuthEndpoint) {
    throw new axios.Cancel("No token, logging out");
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      await clearAuthSession();
    }
    return Promise.reject(error);
  }
);

export default api;
