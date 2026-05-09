import apiClient from "./apiClient";

export async function getUsers() {
  const response = await apiClient.get("/users");
  return response.data;
}

export async function createUser(userData) {
  const response = await apiClient.post("/users", userData);
  return response.data;
}
