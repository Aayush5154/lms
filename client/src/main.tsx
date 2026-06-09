import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n";
import { initAuthFetch } from "./services/auth-fetch";

initAuthFetch();

createRoot(document.getElementById("root")!).render(<App />);
