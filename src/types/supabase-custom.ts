
// Define custom types for tables that aren't in the auto-generated types

export interface AdminUser {
  id?: string;
  email: string;
  name?: string;
  role: 'super_admin' | 'admin' | 'rater';
  password: string;
  created_at?: string;
  updated_at?: string;
}

export interface Question {
  id: string;
  text: string;
  section: string;
  sub_section: string;
  is_reversed: boolean;
  negative_score: boolean;
  created_at?: string;
  updated_at?: string;
}
