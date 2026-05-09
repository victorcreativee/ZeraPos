import apiClient from "./apiClient";

export async function getCategories() {
  const response = await apiClient.get("/categories");
  return response.data;
}

export async function getProducts(categoryId = null) {
  const url = categoryId ? `/products?category_id=${categoryId}` : "/products";
  const response = await apiClient.get(url);
  return response.data;
}

export async function getTables() {
  const response = await apiClient.get("/tables");
  return response.data;
}
