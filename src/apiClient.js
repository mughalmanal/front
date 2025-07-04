import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://back-7-9sog.onrender.com/api", // your backend base URL
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;
