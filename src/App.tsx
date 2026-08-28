import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { pageRoutes } from "./PageRoutes";

export const App = () => {

    return (
        <Router>
            {/*TODO: Create a optimal "loading" screen for this */}
            <Suspense fallback={<div className="p-6">Loading…</div>}>
                <Routes>
                    {pageRoutes.map(({ path, component }) => (
                        <Route key={path} path={path} Component={component} />
                    ))}
                </Routes>
            </Suspense>
        </Router>
    );
};
