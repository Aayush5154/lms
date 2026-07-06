const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}
export {
  apiBaseUrl,
  apiUrl
};
