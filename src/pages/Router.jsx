import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router";
import BlankLayout from "../components/layouts/BlankLayout";
import MainLayout from "../components/layouts/MainLayout";
import AuthRequire from "@/components/layouts/AuthRequire";
import HomePage from "./home/HomePage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import SettingsPage from "./settings/SettingsPage";
import NotFoundPage from "./NotFoundPage";
import UserPage from "./user/UserPage";
import MePage from "./user/MePage";
import { UserStoreProvider } from "@/features/user/UserStoreProvider";

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
        <Route path="settings" element={<SettingsPage />} />

        <Route path="users">
          <Route path="me" element={<MePage />} />
          <Route
            path=":userId"
            element={
              <UserStoreProvider>
                <Outlet />
              </UserStoreProvider>
            }
          >
            <Route index element={<UserPage />} />
          </Route>
        </Route>
      </Route>

      {/* Guest Routes - Use BlankLayout */}
      <Route element={<BlankLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/*  Not Found Routes */}
      <Route path="not-found" element={<NotFoundPage />} />

      {/* Catch-all 404 route */}
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
}

export default Router;
