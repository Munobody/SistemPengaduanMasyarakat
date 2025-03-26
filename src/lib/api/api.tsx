import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Interceptor request: update token sebelum setiap request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") { // Pastikan berjalan di client-side (Next.js)
    const token = localStorage.getItem("custom-auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor response: handle error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;