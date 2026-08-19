import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const isLoginPage = window.location.pathname === "/login";
      if (error.response.status === 401 && !isLoginPage) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login";
      } else if (error.response.status === 500) {
        window.location.href = "/server-error";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
