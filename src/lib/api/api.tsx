import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

const savedToken = localStorage.getItem("custom-auth-token");
if (savedToken) {
  api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("Token expired, mencoba refresh...");
      originalRequest._retry = true; // Hindari infinite loop

      const refreshToken = localStorage.getItem("refresh-token");
      console.log("🚀 Refresh token ditemukan?", refreshToken);

      if (!refreshToken) {
        console.error("Refresh token tidak ditemukan! Redirect ke login.");
        localStorage.removeItem("custom-auth-token");
        localStorage.removeItem("refresh-token");
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/refresh-token`, {
          refresh_token: refreshToken,
        });

        console.log("Refresh Token Response:", refreshResponse.data);

        const { token: newToken, refresh_token: newRefreshToken } = refreshResponse.data;

        if (!newToken || !newRefreshToken) {
          console.error("❌ Token baru tidak ditemukan di response!");
          localStorage.removeItem("custom-auth-token");
          localStorage.removeItem("refresh-token");
          return Promise.reject(error);
        }

        // Simpan token baru
        localStorage.setItem("custom-auth-token", newToken);
        localStorage.setItem("refresh-token", newRefreshToken);

        // Update header authorization di axios
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error("Gagal refresh token:", refreshError);
        localStorage.removeItem("custom-auth-token");
        localStorage.removeItem("refresh-token");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
