import apiClient from "./apiClient";

export async function getMyDashboardStats() {
  const response = await apiClient.get("/reports/my-dashboard");
  return response.data;
}
