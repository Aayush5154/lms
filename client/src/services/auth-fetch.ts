import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import { apiBaseUrl } from "./api-url";

export function initAuthFetch() {
  setBaseUrl(apiBaseUrl || null);
  setAuthTokenGetter(() => {
    return localStorage.getItem("lms_token");
  });
}
