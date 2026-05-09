import apiClient from "./apiClient";

export async function loginWithPin(pin) {
  const response = await apiClient.post("/auth/login-pin", { pin });
  return response.data;
}

export async function loginWithPassword(email, password) {
  const response = await apiClient.post("/auth/login-password", {
    email,
    password,
  });

  return response.data;
}
