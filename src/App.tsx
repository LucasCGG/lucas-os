import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { pageRoutes } from "./pageRoutes";

export const App = () => {
    return (
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
    );
};
