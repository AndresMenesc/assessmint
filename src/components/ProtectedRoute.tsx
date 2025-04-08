
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "super_admin" | "admin" | "rater" | null;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, role, userRole } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute check:", { isAuthenticated, userRole, requiredRole });

  // Not logged in - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required, check it
  if (requiredRole) {
    // Super admin can access everything
    if (role === "super_admin" || userRole === "super_admin") {
      return <>{children}</>;
    }
    
    // Admin access control
    if (requiredRole === "admin" && ["admin", "super_admin"].includes(role || userRole || '')) {
      return <>{children}</>;
    }
    
    // Rater access control - handle rater and other roles
    if (requiredRole === "rater" && ["rater", "admin", "super_admin"].includes(role || userRole || '')) {
      return <>{children}</>;
    }
    
    // Redirect based on role - if they don't have permission for the requested page
    if (role === "admin" || userRole === "admin") {
      return <Navigate to="/results" replace />;
    }
    
    if (role === "rater" || userRole === "rater") {
      return <Navigate to="/assessment" replace />;
    }
    
    // Fallback redirect to homepage
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
