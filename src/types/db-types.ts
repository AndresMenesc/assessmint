
import { Json } from "@/integrations/supabase/types";

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

export interface DbAssessment {
  id: string;
  self_rater_email: string;
  self_rater_name: string;
  code: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbAssessmentResponse {
  id: string;
  assessment_id: string;
  rater_type: string;
  responses: Json;
  email?: string | null;
  name?: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbAdminUser {
  id: string;
  role: string;
  email: string;
  password: string;
  name?: string | null;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'super_admin' | 'admin' | 'rater' | null;

export interface RaterResponses {
  raterType: string;
  email: string;
  name: string;
  responses: any[];
  completed: boolean;
}
