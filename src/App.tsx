import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, BrowserRouter, RouterProvider } from "react-router-dom";
import { router } from "./pageRoutes";

export const App = () => {
  return <RouterProvider router={router} />
  return (
    <BrowserRouter>
      <Router>
        {/*TODO: Create a optimal "loading" screen for this */}
        <Suspense fallback={<div className="p-6">Loading…</div>}>
          <Routes>
            {pageRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Routes>
        </Suspense>
      </Router>
    </BrowserRouter>
  );
};
