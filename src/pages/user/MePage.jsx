import { useAuthState } from "@/lib/auth/useAuth";
import { Navigate } from "react-router";

function MePage() {
  const { currentUser } = useAuthState();

  return <Navigate to={`/users/${currentUser._id}`} replace />;
}

export default MePage;
