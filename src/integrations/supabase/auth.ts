
import { supabase } from './client';
import { DbAdminUser, UserRole } from '@/types/db-types';
import { 
  safeQueryData, 
  safeDataFilter, 
  getRowField,
  getDbFormValues
} from '@/utils/supabaseHelpers';
import * as bcrypt from 'bcryptjs';

// Function to authenticate admin user
export const authenticateUser = async (email: string, password: string): Promise<{
  authenticated: boolean;
  role: UserRole;
  email: string;
  name: string | null;
}> => {
  try {
    // Look up the admin user by email
    const { data: user, error } = await supabase
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
      
    const safeUser = safeQueryData<DbAdminUser>(user as DbAdminUser);
    if (!safeUser) {
      console.error("User not found");
      return {
        authenticated: false,
        role: null,
        email: "",
        name: null
      };
    }
    
    // For security, always use compare for password checking
    const userPassword = getRowField(safeUser, 'password', '');
    const userRole = getRowField(safeUser, 'role', 'rater') as UserRole;
    const userEmail = getRowField(safeUser, 'email', '');
    const userName = getRowField(safeUser, 'name', userEmail);
    
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
