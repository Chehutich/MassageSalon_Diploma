import axios, { AxiosRequestConfig } from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const AUTH_ENDPOINTS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/refresh-mobile",
];

let isLoggingOut = false;

export function setLoggingOut(value: boolean) {
  isLoggingOut = value;
}

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5260",
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;

    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) =>
      original?.url?.includes(path),
    );

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !isAuthEndpoint &&
      !isLoggingOut
    ) {
      original._retry = true;

      try {
        const accessToken = await SecureStore.getItemAsync("accessToken");
        const refreshToken = await SecureStore.getItemAsync("refreshToken");

        if (!accessToken || !refreshToken) {
          setTimeout(() => router.replace("/(auth)/login"), 0);
          return Promise.reject(error);
        }

        const { data } = await axios.post(
          `${axiosInstance.defaults.baseURL}/api/auth/refresh-mobile`,
          {
            accessToken,
            refreshToken,
          },
        );

        await SecureStore.setItemAsync("accessToken", data.token);
        await SecureStore.setItemAsync("refreshToken", data.refreshToken);

        original.headers.Authorization = `Bearer ${data.token}`;
        return axiosInstance(original);
      } catch (refreshError) {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");

        setTimeout(() => router.replace("/(auth)/login"), 0);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export const api = <T>(config: AxiosRequestConfig): Promise<T> => {
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers["Content-Type"];
    }
  }

  return axiosInstance(config).then((r) => r.data);
};
