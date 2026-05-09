import apiClient from "./apiClient";

export async function createOrder(orderData) {
  const response = await apiClient.post("/orders", orderData);
  return response.data;
}

export async function getOrders() {
  const response = await apiClient.get("/orders");
  return response.data;
}

export async function getOrderDetails(orderId) {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data;
}

export async function printOrderTicket(orderId) {
  const response = await apiClient.post(`/orders/${orderId}/print-ticket`);
  return response.data;
}

export async function printCustomerBill(orderId) {
  const response = await apiClient.post(`/orders/${orderId}/print-bill`);
  return response.data;
}
export async function payOrder(orderId, paymentData) {
  const response = await apiClient.post(`/orders/${orderId}/pay`, paymentData);

  return response.data;
}
