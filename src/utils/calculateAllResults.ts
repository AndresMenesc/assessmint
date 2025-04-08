
import { RaterType, RaterResponses, DimensionScore, Question } from "@/types/assessment";
import { calculateDimensionScores, calculateCoachabilityScore } from "./scoreCalculations";

// Calculate self-awareness score based on differences between self and rater scores
function calculateSelfAwareness(dimensionScores: DimensionScore[]): number {
  const selfScores = dimensionScores.filter(d => d.dimension.includes("Self_"));
  const raterScores = dimensionScores.filter(d => d.dimension.includes("Rater_"));

  if (selfScores.length === 0 || raterScores.length === 0) {
    return 0;
  }

  // Calculate the difference between self and rater scores
  let totalDiff = 0;
  let count = 0;
  
  for (const selfScore of selfScores) {
    const matchingRaterScores = raterScores.filter(rs => 
      rs.dimension.replace("Rater_", "") === selfScore.dimension.replace("Self_", "") && 
      rs.subDimension === selfScore.subDimension
    );
    
    if (matchingRaterScores.length > 0) {
      const avgRaterScore = matchingRaterScores.reduce((sum, rs) => sum + rs.score, 0) / matchingRaterScores.length;
      const diff = Math.abs(selfScore.score - avgRaterScore);
      totalDiff += diff;
      count++;
    }
  }
  
  if (count === 0) return 0;
  
  // Calculate average difference and convert to a 0-100 scale
  // Lower difference = higher awareness
  const avgDiff = totalDiff / count;
  const maxPossibleDiff = 5; // Assuming 1-5 scale
  
  // Convert to 0-100 scale where 100 means perfect awareness (no difference)
  const awarenessScore = 100 - ((avgDiff / maxPossibleDiff) * 100);
  return Math.max(0, Math.min(100, awarenessScore));
}

// Calculate coachability awareness based on coachability scores
function calculateCoachabilityAwareness(dimensionScores: DimensionScore[]): number {
  const coachabilityScores = dimensionScores.filter(d => d.subDimension === "COACHABILITY");
  
  if (coachabilityScores.length === 0) {
    return 0;
  }
  
  // Average the coachability scores and convert to 0-100
  const totalScore = coachabilityScores.reduce((sum, score) => sum + score.score, 0);
  const avgScore = totalScore / coachabilityScores.length;
  
  // Convert 1-5 scale to 0-100
  return ((avgScore - 1) / 4) * 100;
}

// Determine profile type based on scores
function determineProfileType(selfAwareness: number, coachabilityAwareness: number): string {
  const selfThreshold = 70;
  const coachabilityThreshold = 70;
  
  // Convert scores to ranges: high or low
  const highSelfAwareness = selfAwareness >= selfThreshold;
  const highCoachability = coachabilityAwareness >= coachabilityThreshold;
  
  if (highSelfAwareness && highCoachability) {
    return "Champion";
  } else if (highSelfAwareness && !highCoachability) {
    return "Independent";
  } else if (!highSelfAwareness && highCoachability) {
    return "Receptive";
  } else {
    return "Resistant";
  }
}

// Calculate all results for the assessment
export function calculateResults(raters: RaterResponses[]) {
  try {
    if (!raters || raters.length === 0) {
      console.error("No raters provided for calculations");
      return null;
    }
    
    // Calculate dimension scores for all raters
    const dimensionScores = calculateDimensionScores(raters);
    
    if (!dimensionScores || dimensionScores.length === 0) {
      console.error("Failed to calculate dimension scores");
      return null;
    }
    
    // Calculate self-awareness score
    const selfAwareness = calculateSelfAwareness(dimensionScores);
    
    // Calculate coachability awareness
    const coachabilityAwareness = calculateCoachabilityAwareness(dimensionScores);
    
    // Determine profile type
    const profileType = determineProfileType(selfAwareness, coachabilityAwareness);
    
    return {
      dimensionScores,
      selfAwareness,
      coachabilityAwareness,
      profileType
    };
  } catch (error) {
    console.error("Error calculating results:", error);
    return null;
  }
}
