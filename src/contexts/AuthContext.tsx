// Import statements remain the same
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { safeQueryData, safeDataAccess } from '@/utils/supabaseHelpers';

// Type definitions
export type UserRole = 'super_admin' | 'admin' | 'rater' | null;

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
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  verifySession: () => Promise<boolean>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  role: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  verifySession: async () => false,
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
      const safeUserData = safeQueryData(userData);
      if (!safeUserData) {
        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
        return false;
      }
      
      // Set user state and role based on database
      const userRole = safeDataAccess(safeUserData, 'role') as UserRole;
      
      setIsAuthenticated(true);
      setUser({
        id: safeDataAccess(safeUserData, 'id'),
        role: userRole,
        email: safeDataAccess(safeUserData, 'email'),
        name: safeDataAccess(safeUserData, 'name') || safeDataAccess(safeUserData, 'email')
      });
      // Use the as UserRole type assertion
      setRole(userRole as UserRole);
      
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
      const safeUserData = safeQueryData(userData);
      if (!safeUserData) {
        toast.error('User data not found');
        setLoading(false);
        return;
      }
      
      // Verify password
      if (safeDataAccess(safeUserData, 'password') !== password) {
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
      const userRole = safeDataAccess(safeUserData, 'role') as UserRole;
      
      setIsAuthenticated(true);
      setUser({
        id: safeDataAccess(safeUserData, 'id'),
        role: userRole,
        email: safeDataAccess(safeUserData, 'email'),
        name: safeDataAccess(safeUserData, 'name') || safeDataAccess(safeUserData, 'email')
      });
      // Use the as UserRole type assertion
      setRole(userRole as UserRole);
      
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An error occurred during sign in');
    } finally {
      setLoading(false);
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
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An error occurred during sign out');
    } finally {
      setLoading(false);
    }
  };

  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        role,
        loading,
        signIn,
        signOut,
        verifySession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
