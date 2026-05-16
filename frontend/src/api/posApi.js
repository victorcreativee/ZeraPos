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

export async function getTables() {
  const response = await apiClient.get("/tables");
  return response.data;
}

export async function createTable(tableData) {
  const response = await apiClient.post("/tables", tableData);
  return response.data;
}
