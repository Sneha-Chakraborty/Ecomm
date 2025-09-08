// web/src/api/client.ts
import axios, { AxiosHeaders, isAxiosError } from "axios";

const BASE_URL =
  (import.meta as any).env?.VITE_API_URL?.toString() || "http://localhost:8080/api";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies (JWT)
});

// ---- Request: attach X-Cart-Id + Accept ----
api.interceptors.request.use((config) => {
  // Ensure headers is an AxiosHeaders instance so we can use .set()
  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);

  try {
    const cartId = typeof window !== "undefined" ? localStorage.getItem("cartId") : null;
    if (cartId) headers.set("X-Cart-Id", cartId);
  } catch {
    /* ignore storage errors */
  }

  headers.set("Accept", "application/json");
  config.headers = headers;
  return config;
});

// ---- Response: persist new X-Cart-Id if server generated one ----
api.interceptors.response.use(
  (res) => {
    try {
      const newId = (res.headers as any)?.get
        ? (res.headers as any).get("x-cart-id")
        : (res.headers as any)?.["x-cart-id"];
      if (newId && typeof window !== "undefined" && !localStorage.getItem("cartId")) {
        localStorage.setItem("cartId", newId);
      }
    } catch {
      /* ignore storage errors */
    }
    return res;
  },
  (err) => {
    // Normalize error message
    const msg = isAxiosError(err)
      ? err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message
      : (err as Error)?.message || "Request failed";
    return Promise.reject(new Error(msg));
  }
);
