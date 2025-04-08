
// Additional type definitions to help with Supabase database operations

// Type for Database Tables
export interface DbAssessment {
  id?: string;
  self_rater_email: string;
  self_rater_name: string;
  code: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbAssessmentResponse {
  id?: string;
  assessment_id: string;
  rater_type: string;
  responses: any[];
  email?: string | null;
  name?: string | null;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DbQuestion {
  id: string;
  text: string;
  section: string;
  sub_section: string;
  is_reversed: boolean;
  negative_score: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DbResponse {
  id?: string;
  rater_id: string;
  question_id: string;
  score: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbResult {
  id?: string;
  assessment_id: string;
  dimension_scores: any;
  self_awareness: number | null;
  coachability_awareness: number | null;
  profile_type: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbAdminUser {
  id?: string;
  email: string;
  name?: string | null;
  role: string;
  password: string;
  created_at?: string;
  updated_at?: string;
}

// Helper type for Supabase RLS policies
export type UserRole = 'super_admin' | 'admin' | 'rater' | null;
