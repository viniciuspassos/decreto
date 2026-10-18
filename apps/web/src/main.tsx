import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n/index.js";
import "./styles.css";
import { App } from "./App.js";

const container = document.getElementById("root");
if (!container) {
  throw new Error("#root não encontrado em index.html");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
