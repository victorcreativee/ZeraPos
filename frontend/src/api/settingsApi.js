import apiClient from "./apiClient";

export async function getSettings() {
  const response = await apiClient.get("/settings");
  return response.data;
}

export async function updateSettings(settings) {
  const response = await apiClient.patch("/settings", settings);
  return response.data;
}
