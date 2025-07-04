import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api", // Use env variable for base URL
});

export default apiClient;
