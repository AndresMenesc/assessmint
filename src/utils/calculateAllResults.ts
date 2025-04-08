// Import correct function names
import { 
  calculateDimensionScores,
  calculateCoachabilityScore,
} from "./scoreCalculations";
import { calculateSelfAwarenessScore } from "./scoreCalculations";
import { Response, AssessmentResponse, toAssessmentResponse } from "@/types/assessment";
import { Question } from "@/types/assessment";
import { getQuestions } from "@/data/questions";

// Function to calculate all results for an assessment
export function calculateResults(selfResponses: Response[], rater1Responses: Response[], rater2Responses: Response[], assessmentId: string) {
  // Convert Response[] to AssessmentResponse[]
  const selfAssessmentResponses = selfResponses.map(r => toAssessmentResponse(r, assessmentId));
  const rater1AssessmentResponses = rater1Responses.map(r => toAssessmentResponse(r, assessmentId));
  const rater2AssessmentResponses = rater2Responses.map(r => toAssessmentResponse(r, assessmentId));
  
  const esteemScore = calculateDimensionScores(selfAssessmentResponses, rater1AssessmentResponses, rater2AssessmentResponses, "ESTEEM");
  const trustScore = calculateDimensionScores(selfAssessmentResponses, rater1AssessmentResponses, rater2AssessmentResponses, "TRUST");
  const driverScore = calculateDimensionScores(selfAssessmentResponses, rater1AssessmentResponses, rater2AssessmentResponses, "DRIVER");
  const adaptabilityScore = calculateDimensionScores(selfAssessmentResponses, rater1AssessmentResponses, rater2AssessmentResponses, "ADAPTABILITY");
  const problemResolutionScore = calculateDimensionScores(selfAssessmentResponses, rater1AssessmentResponses, rater2AssessmentResponses, "PROBLEM_RESOLUTION");
  const coachabilityScore = calculateDimensionScores(selfAssessmentResponses, rater1AssessmentResponses, rater2AssessmentResponses, "COACHABILITY");
  
  // Calculate self-awareness and coachability scores
  const selfAwareness = calculateSelfAwarenessScore(
    selfAssessmentResponses, 
    rater1AssessmentResponses, 
    rater2AssessmentResponses
  );
  
  const coachabilityAwareness = calculateCoachabilityScore(
    selfAssessmentResponses, 
    rater1AssessmentResponses,
    rater2AssessmentResponses
  );
  
  // Combine all dimension scores
  const dimensionScores = [
    ...esteemScore,
    ...trustScore,
    ...driverScore,
    ...adaptabilityScore,
    ...problemResolutionScore,
    ...coachabilityScore
  ];
  
  // Determine profile type based on scores
  const profileType = determineProfileType(dimensionScores);
  
  return {
    dimensionScores,
    selfAwareness,
    coachabilityAwareness,
    profileType
  };
}

// Helper function to determine profile type based on dimension scores
function determineProfileType(dimensionScores: any[]) {
  // This is a placeholder for the actual profile type determination logic
  // In a real implementation, this would analyze the scores and return a profile type
  
  // Example implementation:
  const esteemInsecure = dimensionScores.find(s => s.dimension === "ESTEEM" && s.subDimension === "INSECURE")?.score || 0;
  const esteemPride = dimensionScores.find(s => s.dimension === "ESTEEM" && s.subDimension === "PRIDE")?.score || 0;
  const trustTrusting = dimensionScores.find(s => s.dimension === "TRUST" && s.subDimension === "TRUSTING")?.score || 0;
  const trustCautious = dimensionScores.find(s => s.dimension === "TRUST" && s.subDimension === "CAUTIOUS")?.score || 0;
  
  // Simple logic for demonstration purposes
  if (esteemInsecure > 7 && trustCautious > 7) {
    return "Cautious Performer";
  } else if (esteemPride > 7 && trustTrusting > 7) {
    return "Confident Collaborator";
  } else if (esteemPride > 7 && trustCautious > 7) {
    return "Independent Achiever";
  } else if (esteemInsecure > 7 && trustTrusting > 7) {
    return "Team Player";
  } else {
    return "Balanced Profile";
  }
}

// Function to get all questions with their metadata
export function getAllQuestions(): Question[] {
  return getQuestions();
}

// Function to calculate scores for a specific section
export function calculateSectionScores(
  selfResponses: Response[], 
  rater1Responses: Response[], 
  rater2Responses: Response[], 
  section: string,
  assessmentId: string
) {
  const selfAssessmentResponses = selfResponses.map(r => toAssessmentResponse(r, assessmentId));
  const rater1AssessmentResponses = rater1Responses.map(r => toAssessmentResponse(r, assessmentId));
  const rater2AssessmentResponses = rater2Responses.map(r => toAssessmentResponse(r, assessmentId));
  
  return calculateDimensionScores(
    selfAssessmentResponses,
    rater1AssessmentResponses,
    rater2AssessmentResponses,
    section
  );
}

// Function to calculate overall assessment score
export function calculateOverallScore(dimensionScores: any[]) {
  if (!dimensionScores || dimensionScores.length === 0) {
    return 0;
  }
  
  // Calculate average of all dimension scores
  const totalScore = dimensionScores.reduce((sum, score) => sum + score.score, 0);
  return totalScore / dimensionScores.length;
}

// Function to format results for database storage
export function formatResultsForDb(results: any, assessmentId: string) {
  return {
    assessment_id: assessmentId,
    dimension_scores: results.dimensionScores,
    self_awareness: results.selfAwareness,
    coachability_awareness: results.coachabilityAwareness,
    profile_type: results.profileType,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}
