import { lazy } from "react";
import type { ReactElement } from "react";

const Portfolio = lazy(() => import("./pages/Portfolio").then((m) => ({ default: m.Portfolio })));
// const DataDeletion = lazy(() => import("./pages/DataDeletion"));

export type PageRoute = {
    path: string;
    element: ReactElement;
};

export const pageRoutes: PageRoute[] = [
    { path: "/", element: <Portfolio /> },

    // { path: "/privacy-policy", element: <PrivacyPolicy /> },
    // { path: "/data-deletion", element: <DataDeletion /> },

];
