import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@fontsource/climate-crisis";
import { App } from "./App.tsx";
import { AppToaster } from "./components/index.ts";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <AppToaster />
        <App />
    </StrictMode>
);
