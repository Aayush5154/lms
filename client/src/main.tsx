import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n";
import { initAuthFetch } from "./services/auth-fetch";

initAuthFetch();

createRoot(document.getElementById("root")!).render(<App />);

// Dismiss the HTML splash screen once React has mounted
requestAnimationFrame(() => {
  const splash = document.getElementById("splash");
  if (splash) {
    splash.classList.add("hide");
    setTimeout(() => {
      splash.remove();
      // Also remove the splash-only stylesheet
      document.getElementById("splash-styles")?.remove();
    }, 500);
  }
});
