
import { supabase } from './client';
import { DbAdminUser, UserRole } from '@/types/db-types';
import { 
  safeQueryData, 
  safeDataFilter, 
  getRowField,
  getDbFormValues
} from '@/utils/supabaseHelpers';
import * as bcrypt from 'bcryptjs';
import { PostgrestError } from '@supabase/supabase-js';

// Function to authenticate admin user
export const authenticateUser = async (email: string, password: string): Promise<{
  authenticated: boolean;
  role: UserRole;
  email: string;
  name: string | null;
}> => {
  try {
    // Look up the admin user by email
    const { data: userData, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
      
    if (error) {
      console.error("Authentication error:", error);
      return {
        authenticated: false,
        role: null,
        email: "",
        name: null
      };
    }
    
    // Handle potential error or null response
    if (!userData) {
      console.error("User not found");
      return {
        authenticated: false,
        role: null,
        email: "",
        name: null
      };
    }
      
    // For security, always use compare for password checking
    const userPassword = getRowField(userData, 'password', '');
    const userRole = getRowField(userData, 'role', 'rater') as UserRole;
    const userEmail = getRowField(userData, 'email', '');
    const userName = getRowField(userData, 'name', userEmail);
    
    // In a real production app, we would use bcrypt or similar
    // For this demo, we'll just compare directly
    const authenticated = userPassword === password;
    
    if (authenticated) {
      return {
        authenticated: true,
        role: userRole,
        email: userEmail,
        name: userName
      };
    } else {
      return {
        authenticated: false,
        role: null,
        email: "",
        name: null
      };
    }
  } catch (error) {
    console.error("Unexpected error during authentication:", error);
    return {
      authenticated: false,
      role: null,
      email: "",
      name: null
    };
  }
};

// We could add other auth-related functions here
