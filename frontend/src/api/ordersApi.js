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

export async function printOrderTicket(
  orderId,
  printType = "kitchen_bar_ticket"
) {
  const response = await apiClient.post(`/orders/${orderId}/print-ticket`, {
    print_type: printType,
  });

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
export async function printPaidReceipt(orderId) {
  const response = await apiClient.post(
    `/orders/${orderId}/print-paid-receipt`
  );
  return response.data;
}
export async function updateOrderItemStatus(orderId, itemId, status) {
  const response = await apiClient.patch(
    `/orders/${orderId}/items/${itemId}/status`,
    { status }
  );

  return response.data;
}

export async function cancelOrder(orderId, reason) {
  const response = await apiClient.patch(`/orders/${orderId}/cancel`, {
    reason,
  });

  return response.data;
}
export async function getKitchenQueue() {
  const response = await apiClient.get("/orders/kitchen/queue");
  return response.data;
}

export async function getBarQueue() {
  const response = await apiClient.get("/orders/bar/queue");
  return response.data;
}
