import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define user role types
export type UserRole = "super_admin" | "admin" | "rater" | null;

// Define context type
interface AuthContextProps {
  isAuthenticated: boolean;
  userRole: UserRole;
  userEmail: string | null;
  userName: string | null;
  userCode: string | null;
  setUserEmail: (email: string | null) => void;
  setUserName: (name: string | null) => void;
  setUserCode: (code: string | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  codeLogin: (email: string, name: string, code: string, isSelf: boolean) => Promise<{ success: boolean; isNewAssessment?: boolean }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
}

// Create context with a default value
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userCode, setUserCode] = useState<string | null>(null);
  const [loginInProgress, setLoginInProgress] = useState<boolean>(false);

  // Check local storage for authentication on component mount
  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedRole = localStorage.getItem("userRole") as UserRole;
    const storedEmail = localStorage.getItem("userEmail");
    const storedName = localStorage.getItem("userName");
    const storedCode = localStorage.getItem("userCode");

    if (storedAuth === "true") {
      setIsAuthenticated(true);
      setUserRole(storedRole);
      setUserEmail(storedEmail);
      setUserName(storedName);
      setUserCode(storedCode);
    }

    // Set up auth state change listener for Supabase authentication
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change event:", event, session);
        
        if (event === "PASSWORD_RECOVERY") {
          toast.info("You can now reset your password");
        } else if (event === "SIGNED_IN") {
          // Handle sign in event
          if (session?.user) {
            console.log("User signed in:", session.user);
            
            // Check if this user is an admin in your database
            checkUserRole(session.user.email);
          }
        }
      }
    );

    // Clean up the subscription when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to check user role in admin_users table
  const checkUserRole = async (email: string | undefined) => {
    if (!email) return;
    
    try {
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (adminError) {
        console.error("Error checking admin status:", adminError);
        return;
      }

      if (adminData) {
        // Set admin authentication
        setIsAuthenticated(true);
        setUserRole(adminData.role as UserRole);
        setUserEmail(adminData.email);
        setUserName(adminData.name || adminData.email.split('@')[0]);
        
        // Store in local storage
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", adminData.role);
        localStorage.setItem("userEmail", adminData.email);
        localStorage.setItem("userName", adminData.name || adminData.email.split('@')[0]);
        
        toast.success(`Welcome, ${adminData.name || "Admin"}!`);
      }
    } catch (error) {
      console.error("Error checking user role:", error);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    if (loginInProgress) {
      toast.error("Login already in progress");
      return false;
    }
    
    try {
      setLoginInProgress(true);
      
      // Try to sign in with Supabase Auth first
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password
      });

      if (authData.user) {
        // Successfully signed in with Supabase Auth
        console.log("Supabase Auth sign-in successful:", authData.user);
        
        // Check if this is an admin user
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', email.toLowerCase())
          .single();

        if (adminError && adminError.code !== 'PGRST116') {
          console.error("Error checking admin status:", adminError);
          toast.error("Login failed. Please try again.");
          return false;
        }

        if (adminData) {
          // Set admin authentication
          setIsAuthenticated(true);
          setUserRole(adminData.role as UserRole);
          setUserEmail(adminData.email);
          setUserName(adminData.name || adminData.email.split('@')[0]);
          
          // Store in local storage
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("userRole", adminData.role);
          localStorage.setItem("userEmail", adminData.email);
          localStorage.setItem("userName", adminData.name || adminData.email.split('@')[0]);
          
          return true;
        }
      } else if (authError) {
        console.log("Supabase Auth error, falling back to legacy login:", authError.message);
        
        // Fall back to checking the admin_users table directly
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', email.toLowerCase())
          .single();

        if (adminError && adminError.code !== 'PGRST116') {
          console.error("Error checking admin status:", adminError);
          toast.error("Login failed. Please try again.");
          return false;
        }

        // If we found an admin user, verify password
        if (adminData) {
          // Simple password check (in a real app, use proper hashing)
          if (adminData.password === password) {
            // Set admin authentication
            setIsAuthenticated(true);
            setUserRole(adminData.role as UserRole);
            setUserEmail(adminData.email);
            setUserName(adminData.name || adminData.email.split('@')[0]);
            
            // Store in local storage
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("userRole", adminData.role);
            localStorage.setItem("userEmail", adminData.email);
            localStorage.setItem("userName", adminData.name || adminData.email.split('@')[0]);
            
            return true;
          } else {
            toast.error("Invalid password");
            return false;
          }
        }
      }
      
      // Not an admin, treat as a regular user/rater
      setIsAuthenticated(true);
      setUserRole("rater");
      setUserEmail(email);
      setUserName(email.split('@')[0]);
      setUserCode("");
      
      // Store in local storage
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", "rater");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", email.split('@')[0]);
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
      return false;
    } finally {
      setLoginInProgress(false);
    }
  };
  
  // Reset password function - Updated to use dynamic redirect URL
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      // Get the dynamic redirect URL for the current environment
      const redirectTo = `${window.location.origin}/login`;
      
      console.log("Using redirect URL for password reset:", redirectTo);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });
      
      if (error) {
        console.error("Password reset error:", error);
        toast.error(`Password reset failed: ${error.message}`);
        return false;
      }
      
      toast.success(`Password reset instructions sent to ${email}`);
      return true;
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Password reset failed. Please try again.");
      return false;
    }
  };
  
  // Update password function
  const updatePassword = async (password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error("Password update error:", error);
        toast.error(`Password update failed: ${error.message}`);
        return false;
      }
      
      toast.success("Password updated successfully");
      return true;
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("Password update failed. Please try again.");
      return false;
    }
  };
  
  // Code login function for assessments
  const codeLogin = async (email: string, name: string, code: string, isSelf: boolean): Promise<{ success: boolean; isNewAssessment?: boolean }> => {
    try {
      // Check if an assessment with this code exists
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('code', code)
        .single();
      
      // Set user authentication for assessment
      setIsAuthenticated(true);
      setUserRole("rater");
      setUserEmail(email);
      setUserName(name);
      setUserCode(code);
      
      // Store in local storage
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", "rater");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", name);
      localStorage.setItem("userCode", code);
      
      if (assessmentError && assessmentError.code === 'PGRST116') {
        // Assessment doesn't exist
        console.log("Assessment doesn't exist, creating new one");
        
        if (isSelf) {
          // For self assessment, we'll create a new assessment
          return { success: true, isNewAssessment: true };
        } else {
          // For rater assessment, if code doesn't exist, return error
          toast.error("Invalid assessment code");
          return { success: false };
        }
      }
      
      // Assessment exists
      console.log("Assessment exists:", assessmentData);
      return { success: true, isNewAssessment: false };
    } catch (error) {
      console.error("Code login error:", error);
      toast.error("Login failed. Please try again.");
      return { success: false };
    }
  };

  // Logout function
  const logout = () => {
    // Sign out from Supabase Auth
    supabase.auth.signOut().catch(error => {
      console.error("Error signing out from Supabase:", error);
    });
    
    // Clear local state and storage
    setIsAuthenticated(false);
    setUserRole(null);
    setUserEmail(null);
    setUserName(null);
    setUserCode(null);
    
    // Clear local storage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userCode");
    
    toast.info("You have been logged out");
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      userRole,
      userEmail,
      userName,
      userCode,
      setUserEmail,
      setUserName,
      setUserCode,
      login,
      codeLogin,
      logout,
      resetPassword,
      updatePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
