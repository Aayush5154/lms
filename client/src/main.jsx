import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n";
import { initAuthFetch } from "./services/auth-fetch";
initAuthFetch();
createRoot(document.getElementById("root")).render(<App />);
requestAnimationFrame(() => {
  const splash = document.getElementById("splash");
  if (splash) {
    splash.classList.add("hide");
    setTimeout(() => {
      splash.remove();
      document.getElementById("splash-styles")?.remove();
    }, 500);
  }
});
