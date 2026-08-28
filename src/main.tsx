import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { LSC } from "./configs";
import { AppToaster } from "./components";
import { i18nService } from "./services";

import "@fontsource/climate-crisis";
import "./index.css";
import { useCmsStore } from "./atoms/cmsStore";
import { AuthProvider } from "./contexts";

i18nService.init(localStorage.getItem(LSC.LS_APP_LOCALE) || "en");
useCmsStore.getState().init();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AuthProvider>
          <AppToaster />
          <App />
      </AuthProvider>
    </StrictMode>
);
