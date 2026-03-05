import axios, { AxiosRequestConfig } from "axios";

// Axios instance — для interceptors
const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5260",
  timeout: 10_000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      await axiosInstance.post("/api/auth/refresh");
      return axiosInstance(original);
    }
    return Promise.reject(error);
  },
);

// ✅ Именно эту функцию ищет orval
export const api = <T>(config: AxiosRequestConfig): Promise<T> => {
  return axiosInstance(config).then((r) => r.data);
};
