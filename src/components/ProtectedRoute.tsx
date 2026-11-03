import { Navigate, useLocation } from "react-router-dom";
import { LayoutPageSkeleton } from "../skeletons";
import { useAuthStore } from "../stores/authStore";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore();
  const { pathname } = useLocation();

  if (isLoading) {
    return <LayoutPageSkeleton pathname={pathname} />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
