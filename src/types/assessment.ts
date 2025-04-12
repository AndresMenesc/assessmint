
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
  questionId: string;
  score: number;
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
  dimension?: string;
  name?: string;
  score?: number;
  selfScore?: number;
  othersScore?: number;
  rater1Score?: number;
  rater2Score?: number;
  min: number;
  max: number;
  color: string;
}
