
// Types for the assessment model

// Basic types for assessment sections and subsections
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

// Types for the rater and responses
export enum RaterType {
  SELF = "self",
  RATER1 = "rater1",
  RATER2 = "rater2"
}

// Type for a question in the assessment
export interface Question {
  id: string;
  text: string;
  section: string;
  subSection: string;
  isReversed: boolean;
  negativeScore: boolean;
}

// Type for a response to a question
export interface Response {
  questionId: string;
  score: number;
}

// Extended type used for compatibility with calculation functions
export interface AssessmentResponse extends Response {
  assessment_id: string; // Added for compatibility
}

// Type for assessment result scores
export interface DimensionScore {
  dimension: string;
  subDimension: string;
  score: number;
  isNegative?: boolean;
}

// Type for a rater's responses
export interface RaterResponses {
  raterType: RaterType;
  email: string;
  name: string;
  responses: Response[];
  completed: boolean;
}

// Type for an assessment
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

// Type for the assessment response in database format
export interface AssessmentResponse {
  id?: string;
  assessment_id: string;
  questionId: string;
  score: number;
  created_at?: string;
  updated_at?: string;
}

// Import database types - using export type to fix isolatedModules issue
export type { DbAssessment, DbAssessmentResponse, DbQuestion } from './db-types';
