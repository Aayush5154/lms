import { apiUrl } from "./api-url";
async function uploadFile(endpoint, file, fieldName = "file") {
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
export {
  uploadFile
};
