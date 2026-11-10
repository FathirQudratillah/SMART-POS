import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/auth/AuthContext";
import LoadingPage from "./LoadingPage";

export default function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
