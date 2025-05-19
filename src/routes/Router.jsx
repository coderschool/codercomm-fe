import React from "react";
import { Routes, Route } from "react-router";
import BlankLayout from "../components/layouts/BlankLayout";
import MainLayout from "../components/layouts/MainLayout";
import AuthRequire from "../features/auth/AuthRequire";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import AccountPage from "./AccountPage";
import NotFoundPage from "./NotFoundPage";
import UserPage from "./UserPage";
import FriendsPage from "./FriendsPage";
import FriendRequestsPage from "./FriendRequestsPage";

/**
 * Simplified Router configuration.
 * Maps routes to their corresponding layouts and page components.
 */
function Router() {
  return (
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
        <Route path="users/:userId" element={<UserPage />} />
        <Route path="friends" element={<FriendsPage />} />
        <Route path="requests" element={<FriendRequestsPage />} />
      </Route>

      {/* Guest Routes - Use BlankLayout */}
      <Route element={<BlankLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Catch-all 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default Router;
