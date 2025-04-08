
export enum RaterType {
  SELF = "self",
  RATER1 = "rater1",
  RATER2 = "rater2"
}

export enum Section {
  ESTEEM = "ESTEEM",
  TRUST = "TRUST",
  DRIVER = "DRIVER",
  ADAPTABILITY = "ADAPTABILITY",
  PROBLEM_RESOLUTION = "PROBLEM_RESOLUTION",
  COACHABILITY = "COACHABILITY"
}

export enum SubSection {
  INSECURE = "INSECURE",
  PRIDE = "PRIDE",
  TRUSTING = "TRUSTING",
  CAUTIOUS = "CAUTIOUS",
  RESERVED = "RESERVED",
  HUSTLE = "HUSTLE",
  PRECISE = "PRECISE",
  FLEXIBLE = "FLEXIBLE",
  DIRECT = "DIRECT",
  AVOIDANT = "AVOIDANT",
  COACHABILITY = "COACHABILITY"
}

export interface AssessmentResponse {
  id?: string;
  assessment_id?: string;
  questionId: string;
  score: number;
  created_at?: string;
  updated_at?: string;
}

export interface RaterResponses {
  raterType: RaterType;
  responses: AssessmentResponse[];
  completed: boolean;
  email: string;
  name: string;
}

export interface Assessment {
  id: string;
  selfRaterEmail: string;
  selfRaterName: string;
  code: string;
  raters: RaterResponses[];
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  text: string;
  section: Section;
  subSection: SubSection;
  isReversed: boolean;
  negativeScore: boolean;
}

export interface DimensionScore {
  dimension: string;
  score: number;
  min: number;
  max: number;
  color: string;
}

// Database interface mappings
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
}
