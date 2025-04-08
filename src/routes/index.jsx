import React from "react";
import { Routes, Route } from "react-router-dom";
import LoadingScreen from "@/components/LoadingScreen";
import BlankLayout from "../layouts/BlankLayout";
import MainLayout from "../layouts/MainLayout";
import AuthRequire from "./AuthRequire";
import GuestRoute from "./GuestRoute";

// Page Components (Lazy Load)
const HomePage = React.lazy(() => import("../pages/HomePage"));
const LoginPage = React.lazy(() => import("../pages/LoginPage"));
const AccountPage = React.lazy(() => import("../pages/AccountPage"));
const NotFoundPage = React.lazy(() => import("../pages/NotFoundPage"));
const UserProfilePage = React.lazy(() => import("../pages/UserProfilePage"));
const FriendsPage = React.lazy(() => import("../pages/FriendsPage"));
const FriendRequestsPage = React.lazy(() => import("../pages/FriendRequestsPage"));

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
          <Route path="user/:userId" element={<UserProfilePage />} />
          <Route path="friends" element={<FriendsPage />} />
          <Route path="requests" element={<FriendRequestsPage />} />
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
