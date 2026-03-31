import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./App";

const rootEl = document.getElementById("root")!;
createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
