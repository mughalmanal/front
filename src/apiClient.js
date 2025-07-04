import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://back-8.onrender.com/api", // Your backend base
});

export default apiClient;
