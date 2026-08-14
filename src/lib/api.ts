import axios from "axios";
import { env } from "@/lib/env";

export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

// Interceptor para adicionar Bearer Token e Familia ID automaticamente
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("alfred_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const familiaId = localStorage.getItem("alfred_familia_id");
    if (familiaId) {
      config.headers["X-Familia-Id"] = familiaId;
    }
  }
  return config;
});

// Interceptor para tratamento centralizado de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("alfred_token");
        localStorage.removeItem("alfred_user");
        localStorage.removeItem("alfred_familia_id");
        if (!window.location.pathname.startsWith("/entrar")) {
          window.location.href = "/entrar";
        }
      }
    }
    return Promise.reject(error);
  }
);
