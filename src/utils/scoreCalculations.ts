
import { RaterResponses, DimensionScore, Question, SubSection, Section } from "@/types/assessment";

/**
 * Calculates dimension scores for all provided raters
 * @param raters Array of rater responses
 * @returns Array of dimension scores
 */
export function calculateDimensionScores(raters: RaterResponses[]): DimensionScore[] {
  const dimensionScores: DimensionScore[] = [];

  try {
    // Check if there's at least one rater
    if (!raters || raters.length === 0) {
      return dimensionScores;
    }

    // Group raters by type
    const selfRater = raters.find(r => r.raterType === 'self');
    const otherRaters = raters.filter(r => r.raterType !== 'self');
    
    // Process each section and subsection
    for (const section of Object.values(Section)) {
      for (const subSection of Object.values(SubSection)) {
        // Calculate scores for self-rater
        if (selfRater) {
          const selfScore = calculateSubSectionScore(selfRater, section, subSection);
          if (selfScore !== null) {
            dimensionScores.push({
              dimension: `Self_${section}`,
              subDimension: subSection,
              score: selfScore
            });
          }
        }
        
        // Calculate aggregate scores for other raters
        if (otherRaters.length > 0) {
          const combinedScore = calculateCombinedSubSectionScore(otherRaters, section, subSection);
          if (combinedScore !== null) {
            dimensionScores.push({
              dimension: `Rater_${section}`,
              subDimension: subSection,
              score: combinedScore
            });
          }
        }
      }
    }
    
    // Add coachability score
    const coachabilityScore = calculateCoachabilityScore(raters);
    if (coachabilityScore !== null) {
      dimensionScores.push({
        dimension: "Coachability",
        subDimension: "COACHABILITY",
        score: coachabilityScore
      });
    }
    
  } catch (error) {
    console.error("Error calculating dimension scores:", error);
  }
  
  return dimensionScores;
}

/**
 * Calculates score for a specific subsection for a single rater
 */
function calculateSubSectionScore(
  rater: RaterResponses, 
  section: string, 
  subSection: string
): number | null {
  try {
    const relevantResponses = rater.responses.filter(response => {
      // We need to find matching questions from the response
      // Simplified approach - we'll enhance this later
      return response.questionId.includes(section) && response.questionId.includes(subSection);
    });
    
    if (relevantResponses.length === 0) return null;
    
    // Calculate average score
    const totalScore = relevantResponses.reduce((sum, response) => sum + response.score, 0);
    return totalScore / relevantResponses.length;
  } catch (error) {
    console.error(`Error calculating ${section}/${subSection} score:`, error);
    return null;
  }
}

/**
 * Calculates combined score for a specific subsection across multiple raters
 */
function calculateCombinedSubSectionScore(
  raters: RaterResponses[],
  section: string,
  subSection: string
): number | null {
  try {
    let totalScore = 0;
    let totalResponses = 0;
    
    for (const rater of raters) {
      const relevantResponses = rater.responses.filter(response => {
        return response.questionId.includes(section) && response.questionId.includes(subSection);
      });
      
      if (relevantResponses.length > 0) {
        const raterScore = relevantResponses.reduce((sum, response) => sum + response.score, 0);
        totalScore += raterScore;
        totalResponses += relevantResponses.length;
      }
    }
    
    if (totalResponses === 0) return null;
    
    return totalScore / totalResponses;
  } catch (error) {
    console.error(`Error calculating combined ${section}/${subSection} score:`, error);
    return null;
  }
}

/**
 * Calculates coachability score across all raters
 */
export function calculateCoachabilityScore(raters: RaterResponses[]): number | null {
  try {
    let totalScore = 0;
    let totalResponses = 0;
    
    for (const rater of raters) {
      // Identify coachability questions based on question ID pattern
      const coachabilityResponses = rater.responses.filter(response => {
        return response.questionId.includes("COACHABILITY");
      });
      
      if (coachabilityResponses.length > 0) {
        const raterScore = coachabilityResponses.reduce((sum, response) => sum + response.score, 0);
        totalScore += raterScore;
        totalResponses += coachabilityResponses.length;
      }
    }
    
    if (totalResponses === 0) return null;
    
    return totalScore / totalResponses;
  } catch (error) {
    console.error("Error calculating coachability score:", error);
    return null;
  }
}
