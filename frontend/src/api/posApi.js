import apiClient from "./apiClient";

export async function getCategories() {
  const response = await apiClient.get("/categories");
  return response.data;
}

export async function createCategory(categoryData) {
  const response = await apiClient.post("/categories", categoryData);
  return response.data;
}

export async function getProducts(categoryId = null) {
  const url = categoryId ? `/products?category_id=${categoryId}` : "/products";
  const response = await apiClient.get(url);
  return response.data;
}

export async function createProduct(productData) {
  const response = await apiClient.post("/products", productData);
  return response.data;
}
export async function updateCategory(categoryId, categoryData) {
  const response = await apiClient.put(
    `/categories/${categoryId}`,
    categoryData
  );
  return response.data;
}

export async function updateProduct(productId, productData) {
  const response = await apiClient.put(`/products/${productId}`, productData);
  return response.data;
}

export async function updateTable(tableId, tableData) {
  const response = await apiClient.put(`/tables/${tableId}`, tableData);
  return response.data;
}

export async function getTables() {
  const response = await apiClient.get("/tables");
  return response.data;
}

export async function createTable(tableData) {
  const response = await apiClient.post("/tables", tableData);
  return response.data;
}
export async function getTableActiveBill(tableId) {
  const response = await apiClient.get(`/tables/${tableId}/active-bill`);
  return response.data;
}

export async function deactivateProduct(productId) {
  const response = await apiClient.patch(`/products/${productId}/deactivate`);
  return response.data;
}

export async function getLowStockProducts() {
  const response = await apiClient.get("/products?low_stock=1");
  return response.data;
}

export async function deactivateTable(tableId) {
  const response = await apiClient.patch(`/tables/${tableId}/deactivate`);
  return response.data;
}
