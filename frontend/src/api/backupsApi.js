import apiClient from "./apiClient";

export async function getBackups() {
  const response = await apiClient.get("/backups");
  return response.data;
}

export async function createBackup() {
  const response = await apiClient.post("/backups");
  return response.data;
}
export async function restoreBackup(fileName) {
  const response = await apiClient.post("/backups/restore", {
    file_name: fileName,
  });

  return response.data;
}
export async function openBackupsFolder() {
  const response = await apiClient.post("/backups/open-folder");
  return response.data;
}
