import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth/AuthContext";
import LoadingPage from "./LoadingPage";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
        return <LoadingPage message="Memeriksa Sesi Login ..." />;
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
