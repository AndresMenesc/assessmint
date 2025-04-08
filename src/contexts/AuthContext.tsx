
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { safeQueryData, isQueryError, safeDataFilter, asParam, safeRowAccess } from "@/utils/supabaseHelpers";

export type UserRole = "super_admin" | "admin" | "rater" | null;

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  password: string;
  created_at: string;
  updated_at: string;
}

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

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change event:", event, session);
        
        if (event === "PASSWORD_RECOVERY") {
          toast.info("You can now reset your password");
        } else if (event === "SIGNED_IN") {
          if (session?.user) {
            console.log("User signed in:", session.user);
            
            checkUserRole(session.user.email);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUserRole = async (email: string | undefined) => {
    if (!email) return;
    
    try {
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', asParam(email.toLowerCase()))
        .single();

      if (adminError) {
        console.error("Error checking admin status:", adminError);
        return;
      }

      const safeAdminData = safeRowAccess(adminData, {
        role: 'rater' as UserRole,
        email: email,
        name: email.split('@')[0],
        password: '',
        id: '',
        created_at: '',
        updated_at: ''
      });
      
      if (safeAdminData) {
        setIsAuthenticated(true);
        setUserRole(safeAdminData.role as UserRole);
        setUserEmail(safeAdminData.email);
        setUserName(safeAdminData.name || safeAdminData.email.split('@')[0]);
        
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", safeAdminData.role);
        localStorage.setItem("userEmail", safeAdminData.email);
        localStorage.setItem("userName", safeAdminData.name || safeAdminData.email.split('@')[0]);
        
        toast.success(`Welcome, ${safeAdminData.name || "Admin"}!`);
      }
    } catch (error) {
      console.error("Error checking user role:", error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (loginInProgress) {
      toast.error("Login already in progress");
      return false;
    }
    
    try {
      setLoginInProgress(true);
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password
      });

      if (authData.user) {
        console.log("Supabase Auth sign-in successful:", authData.user);
        
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', asParam(email.toLowerCase()))
          .single();

        if (adminError && adminError.code !== 'PGRST116') {
          console.error("Error checking admin status:", adminError);
          toast.error("Login failed. Please try again.");
          return false;
        }

        const safeAdminData = safeRowAccess(adminData, {
          role: 'rater' as UserRole,
          email: email,
          name: email.split('@')[0],
          password: '',
          id: '',
          created_at: '',
          updated_at: ''
        });
        
        if (safeAdminData) {
          setIsAuthenticated(true);
          setUserRole(safeAdminData.role);
          setUserEmail(safeAdminData.email);
          setUserName(safeAdminData.name || safeAdminData.email.split('@')[0]);
          
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("userRole", safeAdminData.role);
          localStorage.setItem("userEmail", safeAdminData.email);
          localStorage.setItem("userName", safeAdminData.name || safeAdminData.email.split('@')[0]);
          
          return true;
        }
      } else if (authError) {
        console.log("Supabase Auth error, falling back to legacy login:", authError.message);
        
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', asParam(email.toLowerCase()))
          .single();

        if (adminError && adminError.code !== 'PGRST116') {
          console.error("Error checking admin status:", adminError);
          toast.error("Login failed. Please try again.");
          return false;
        }

        const safeAdminData = safeRowAccess(adminData, {
          role: 'rater' as UserRole,
          email: email,
          name: email.split('@')[0],
          password: '',
          id: '',
          created_at: '',
          updated_at: ''
        });
        
        if (safeAdminData) {
          if (safeAdminData.password === password) {
            setIsAuthenticated(true);
            setUserRole(safeAdminData.role);
            setUserEmail(safeAdminData.email);
            setUserName(safeAdminData.name || safeAdminData.email.split('@')[0]);
            
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("userRole", safeAdminData.role);
            localStorage.setItem("userEmail", safeAdminData.email);
            localStorage.setItem("userName", safeAdminData.name || safeAdminData.email.split('@')[0]);
            
            return true;
          } else {
            toast.error("Invalid password");
            return false;
          }
        }
      }
      
      setIsAuthenticated(true);
      setUserRole("rater");
      setUserEmail(email);
      setUserName(email.split('@')[0]);
      setUserCode("");
      
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

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
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

  const codeLogin = async (email: string, name: string, code: string, isSelf: boolean): Promise<{ success: boolean; isNewAssessment?: boolean }> => {
    try {
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('code', asParam(code))
        .single();
      
      setIsAuthenticated(true);
      setUserRole("rater");
      setUserEmail(email);
      setUserName(name);
      setUserCode(code);
      
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", "rater");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", name);
      localStorage.setItem("userCode", code);
      
      if (assessmentError && assessmentError.code === 'PGRST116') {
        console.log("Assessment doesn't exist, creating new one");
        
        if (isSelf) {
          return { success: true, isNewAssessment: true };
        } else {
          toast.error("Invalid assessment code");
          return { success: false };
        }
      }
      
      console.log("Assessment exists:", assessmentData);
      return { success: true, isNewAssessment: false };
    } catch (error) {
      console.error("Code login error:", error);
      toast.error("Login failed. Please try again.");
      return { success: false };
    }
  };

  const logout = () => {
    supabase.auth.signOut().catch(error => {
      console.error("Error signing out from Supabase:", error);
    });
    
    setIsAuthenticated(false);
    setUserRole(null);
    setUserEmail(null);
    setUserName(null);
    setUserCode(null);
    
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
