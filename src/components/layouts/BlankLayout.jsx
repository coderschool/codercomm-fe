import { useAuthState } from "@/lib/auth/useAuth";
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";

/**
 * BlankLayout - A simple layout component that centers its content with a logo
 * Used for pages like login and registration where we want minimal UI elements
 */
function BlankLayout() {
  const { currentUser } = useAuthState();
  const location = useLocation();

  if (currentUser) {
    return <Navigate to={location.state?.from?.pathname || "/"} replace />;
  }

  return (
    <main className="min-h-screen flex flex-col justify-center">
      <div className="flex gap-5 items-center justify-center">
        <h1 className="text-2xl font-bold text-primary">CoderComm</h1>
      </div>
      <Outlet />
    </main>
  );
}

export default BlankLayout;
