import React from "react";
import { Routes, Route } from "react-router-dom";
import LoadingScreen from "@/components/LoadingScreen";
import BlankLayout from "../layouts/BlankLayout";
import MainLayout from "../layouts/MainLayout";
import AuthRequire from "./AuthRequire";
import GuestRoute from "./GuestRoute";

// Import core pages
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import AccountPage from "../pages/AccountPage";

/**
 * Simplified Router configuration.
 * Maps routes to their corresponding layouts and page components.
 */
function Router() {
  return (
    <React.Suspense fallback={<LoadingScreen message="Loading page..." />}>
      <Routes>
        {/* Authenticated Routes - Use MainLayout */}
        <Route
          path="/"
          element={
            <AuthRequire>
              <MainLayout />
            </AuthRequire>
          }
        >
          {/* Core authenticated routes */}
          <Route index element={<HomePage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>

        {/* Guest Routes - Use BlankLayout */}
        <Route element={<BlankLayout />}>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />

          {/* Catch-all 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </React.Suspense>
  );
}

export default Router;
