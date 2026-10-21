import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../provider/authProvider";
import toast from "react-hot-toast";

export const ProtectedRoute = () => {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      toast.error("Please login/signup to access this page");
    }
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};