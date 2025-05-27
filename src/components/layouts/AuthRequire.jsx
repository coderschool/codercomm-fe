import React from "react";
import { Navigate, useLocation } from "react-router";

import { useAuthState } from "@/lib/auth/useAuth";
import { Loader2 } from "lucide-react";

function AuthRequire({ children }) {
  const { isLoading, currentUser, isInitialized } = useAuthState();

  const location = useLocation();

  if (!isInitialized) {
    return;
  }

  if (isLoading) {
    return <Loader2 className="w-4 h-4 animate-spin" />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return children;
}

export default AuthRequire;
