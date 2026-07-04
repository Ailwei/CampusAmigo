import axios from "axios";
import Constants from "expo-constants";
import { getToken } from "./token";
import { logoutUser } from "./auth";

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
  (error) => {
    if (error.response?.status === 401) {
    }
    return Promise.reject(error);
  }
);

export default api;
