import type { ReactElement } from "react";
import { Portfolio } from "./pages";
import { WallyCartDataDeletion, WallyCartPrivacyPolicy } from "./pages/WallyCart";
// const DataDeletion = lazy(() => import("./pages/DataDeletion"));

export type PageRoute = {
    path: string;
    element: ReactElement;
};

export const pageRoutes: PageRoute[] = [
    { path: "/", element: <Portfolio /> },
    { path: "/WallyCart/privacy-policy", element: <WallyCartPrivacyPolicy /> },
    { path: "/WallyCart/data-deletion", element: <WallyCartDataDeletion /> },
];
