import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./App";
import { AlgovizProgressProvider } from "@/contexts/AlgovizProgressContext";

const rootEl = document.getElementById("root")!;
createRoot(rootEl).render(
  <StrictMode>
    <AlgovizProgressProvider>
      <App />
    </AlgovizProgressProvider>
  </StrictMode>,
);
