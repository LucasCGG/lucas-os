import { type ComponentType } from "react";
import { Portfolio, LoginPage } from "./pages/configs";

type PageRoute = {
    path: string;
    component: ComponentType;
};

export const pageRoutes: PageRoute[] = [
    { path: "/", component: Portfolio },
    { path: "/login", component: LoginPage },
    // { path: "/WallyCart/privacy-policy", component: WallyCartPrivacyPolicy },
    // { path: "/WallyCart/data-deletion", component: WallyCartDataDeletion },
];
