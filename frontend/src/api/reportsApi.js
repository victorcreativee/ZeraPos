import apiClient from "./apiClient";

export async function getMyDashboardStats() {
  const response = await apiClient.get("/reports/my-dashboard");
  return response.data;
}

export async function getMyOrdersHistory(date) {
  const response = await apiClient.get(
    `/reports/my-orders-history?date=${date}`
  );
  return response.data;
}
export async function getManagerDashboardStats() {
  const response = await apiClient.get("/reports/manager-dashboard");
  return response.data;
}
export async function getManagerRestaurantDashboard() {
  const response = await apiClient.get("/reports/manager-restaurant-dashboard");
  return response.data;
}
export async function getCounterDashboardStats() {
  const response = await apiClient.get("/reports/counter-dashboard");
  return response.data;
}
export async function getCashierShiftSummary(date = "") {
  const query = date ? `?date=${date}` : "";
  const response = await apiClient.get(
    `/reports/cashier-shift-summary${query}`
  );
  return response.data;
}
