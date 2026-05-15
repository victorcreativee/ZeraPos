import axios from "axios";
import { getAuthToken } from "../utils/authSession";

const apiClient = axios.create({
  baseURL: "http://localhost:5005/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
