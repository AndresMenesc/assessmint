// Import statements remain the same
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { safeQueryData, safeDataFilter } from '@/utils/supabaseUtils';
import { DbAdminUser, UserRole } from '@/types/db-types';

// Type definitions
export interface AdminUser {
  id?: string;
  role: UserRole;
  email: string;
  name?: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AdminUser | null;
  role: UserRole;
  userRole: UserRole; // Added alias for backward compatibility
  userEmail: string | null;
  userName: string | null;
  userCode?: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  codeLogin: (email: string, name: string, code: string, isSelf: boolean) => Promise<{ success: boolean; isNewAssessment?: boolean; }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  verifySession: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  role: null,
  userRole: null,
  userEmail: null,
  userName: null,
  loading: true,
  signIn: async () => {},
  login: async () => false,
  codeLogin: async () => ({ success: false }),
  signOut: async () => {},
  logout: async () => {},
  verifySession: async () => false,
  resetPassword: async () => false,
  updatePassword: async () => false,
});

// Hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [userCode, setUserCode] = useState<string | null>(null);

  // Verify session on component mount
  useEffect(() => {
    const checkAuth = async () => {
      await verifySession();
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Function to verify the user's session
  const verifySession = async (): Promise<boolean> => {
    try {
      // Get session data from Supabase
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
        return false;
      }
      
      // Get user data from admin_users table
      const { data: userData, error: userError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', session.session.user.email)
        .single();
        
      if (userError || !userData) {
        console.error('Error fetching user data:', userError);
        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
        return false;
      }
      
      // Safe data access
      const safeUserData = safeQueryData<DbAdminUser>(userData as DbAdminUser);
      if (!safeUserData) {
        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
        return false;
      }
      
      // Set user state and role based on database
      const userRoleValue = safeUserData.role as UserRole;
      
      setIsAuthenticated(true);
      setUser({
        id: safeUserData.id,
        role: userRoleValue,
        email: safeUserData.email,
        name: safeUserData.name || safeUserData.email
      });
      
      setRole(userRoleValue);
      
      return true;
    } catch (error) {
      console.error('Error verifying session:', error);
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
      return false;
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Check if user exists in admin_users table
      const { data: userData, error: userError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();
        
      if (userError) {
        toast.error('Invalid email or password');
        setLoading(false);
        return;
      }
      
      // Safe data access
      const safeUserData = safeQueryData<DbAdminUser>(userData as DbAdminUser);
      if (!safeUserData) {
        toast.error('User data not found');
        setLoading(false);
        return;
      }
      
      // Verify password
      if (safeUserData.password !== password) {
        toast.error('Invalid email or password');
        setLoading(false);
        return;
      }
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      
      // Set user state and role
      const userRoleValue = safeUserData.role as UserRole;
      
      setIsAuthenticated(true);
      setUser({
        id: safeUserData.id,
        role: userRoleValue,
        email: safeUserData.email,
        name: safeUserData.name || safeUserData.email
      });
      setRole(userRoleValue);
      
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  // Login function (alias for backward compatibility)
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signIn(email, password);
      return isAuthenticated;
    } catch (error) {
      return false;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
      setUserCode(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An error occurred during sign out');
    } finally {
      setLoading(false);
    }
  };

  // Logout function (alias for backward compatibility)
  const logout = async (): Promise<void> => {
    await signOut();
  };

  // For assessment login with code
  const codeLogin = async (email: string, name: string, code: string, isSelf: boolean) => {
    try {
      setLoading(true);
      
      // Store the code
      setUserCode(code);
      
      // For simplicity, set as authenticated with rater role
      setIsAuthenticated(true);
      setUser({
        role: 'rater',
        email: email,
        name: name
      });
      setRole('rater');
      
      // Success response (simplified)
      return { success: true, isNewAssessment: isSelf && code.length <= 5 };
    } catch (error) {
      console.error('Code login error:', error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Reset password function 
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        toast.error(error.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  };

  // Update password function
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Update password error:', error);
      return false;
    }
  };

  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        role,
        userRole: role, // Alias for backward compatibility
        userEmail: user?.email || null,
        userName: user?.name || null,
        userCode,
        loading,
        signIn,
        login,
        codeLogin,
        signOut,
        logout,
        verifySession,
        resetPassword,
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
