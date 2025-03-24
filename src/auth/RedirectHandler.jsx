import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/LoadingScreen";

const RedirectHandler = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (user?.isAdmin) {
        navigate("/admin", { replace: true });
      } else if (user) {
        navigate("/", { replace: true });
      } else {
        navigate("/auth/Login", { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  return <LoadingScreen />;
};

export default RedirectHandler;
