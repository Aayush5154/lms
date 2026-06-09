import { apiUrl } from "./api-url";

export async function uploadFile(endpoint: string, file: File, fieldName: string = "file") {
  const token = localStorage.getItem("lms_token");
  const formData = new FormData();
  formData.append(fieldName, file);

  const res = await fetch(apiUrl(`/api/library/${endpoint}`), {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) {
    throw new Error(`Failed to upload ${endpoint}`);
  }
  return res.json();
}
