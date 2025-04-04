
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "super_admin" | "admin" | "rater" | null;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, userRole } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute check:", { isAuthenticated, userRole, requiredRole });

  // Not logged in - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required, check it
  if (requiredRole) {
    // Super admin can access everything
    if (userRole === "super_admin") {
      return <>{children}</>;
    }
    
    // Admin access control
    if (requiredRole === "admin" && (userRole === "admin" || userRole === "super_admin")) {
      return <>{children}</>;
    }
    
    // Rater access control - fixing the type comparison issue
    if (requiredRole === "rater" && ["rater", "admin", "super_admin"].includes(userRole as string)) {
      return <>{children}</>;
    }
    
    // Redirect based on role - if they don't have permission for the requested page
    if (userRole === "admin") {
      return <Navigate to="/results" replace />;
    }
    
    if (userRole === "rater") {
      return <Navigate to="/assessment" replace />;
    }
    
    // Fallback redirect to homepage
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
