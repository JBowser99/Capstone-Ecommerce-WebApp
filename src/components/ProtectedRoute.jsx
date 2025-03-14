import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, guest, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center text-xl">Loading...</div>;
  }

  // ✅ Guests cannot access protected routes
  if (!user) {
    return <Navigate to="/auth/Login" replace />;
  }

  return children;
};

export default ProtectedRoute;
