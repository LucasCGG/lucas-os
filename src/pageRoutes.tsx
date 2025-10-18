import { lazy } from "react";
import type { ReactElement } from "react";
import { DeptCollector, Portfolio, WallyCartDataDeletion, WallyCartLayout, WallyCartPrivacyPolicy } from "./pages";
import { createBrowserRouter } from "react-router-dom";
// const DataDeletion = lazy(() => import("./pages/DataDeletion"));

export type PageRoute = {
  path: string;
  element: ReactElement;
};

export const router = createBrowserRouter([
  { path: "/", element: <Portfolio /> },
  {
    path: "/WallyCart",
    element: <WallyCartLayout />,
    children: [
      { path: "privacy-policy", element: <WallyCartPrivacyPolicy /> },
      { path: "data-deletion", element: <WallyCartDataDeletion /> },
    ],
  },
  {
    path: "/dept-collector",
    element: <DeptCollector />
  }
]);

