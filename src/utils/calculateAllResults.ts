import { RaterResponses, Section } from "@/types/assessment";
import { calculateDimensionScore, calculateCoachabilityScore, calculateSelfAwareness, calculateCoachabilityAwareness } from "./scoreCalculations";

/**
 * Calculate assessment results based on all raters' responses
 */
export const calculateAllResults = (raters: RaterResponses[]) => {
  if (!raters || raters.length === 0) {
    console.log("No raters provided to calculateAllResults");
    return null;
  }
  
  try {
    console.log("Calculating results for raters:", raters);
    
    // Find self rater and other raters
    const selfRater = raters.find(r => r.raterType === 'self');
    const otherRaters = raters.filter(r => r.raterType !== 'self' && r.completed);
    
    console.log("Self rater:", selfRater);
    console.log("Other raters:", otherRaters);
    
    // For individual results, we might be calculating for a single rater
    const isSingleRaterMode = raters.length === 1;
    
    let dimensionScores;
    let profileType = '';
    
    if (isSingleRaterMode) {
      // Single rater mode - just show their individual scores
      const rater = raters[0];
      
      if (!rater.responses || rater.responses.length === 0) {
        console.log("No responses found for rater:", rater);
        return null;
      }
      
      // Calculate actual dimension scores from responses
      const esteemScore = calculateDimensionScore(rater.responses, Section.ESTEEM);
      const trustScore = calculateDimensionScore(rater.responses, Section.TRUST);
      const driverScore = calculateDimensionScore(rater.responses, Section.DRIVER);
      const adaptabilityScore = calculateDimensionScore(rater.responses, Section.ADAPTABILITY);
      const problemResolutionScore = calculateDimensionScore(rater.responses, Section.PROBLEM_RESOLUTION);
      
      console.log("Single rater scores:", {
        esteemScore,
        trustScore,
        driverScore,
        adaptabilityScore,
        problemResolutionScore
      });
      
      // Normalize scores to 0-5 scale for display
      const normalizeScore = (score: number, min: number, max: number) => {
        return ((score - min) / (max - min)) * 5;
      };
      
      dimensionScores = [
        { 
          name: "Esteem", 
          score: normalizeScore(esteemScore, -28, 28), 
          min: 0, 
          max: 5, 
          color: "#4169E1" // Royal Blue
        },
        { 
          name: "Trust", 
          score: normalizeScore(trustScore, -28, 28), 
          min: 0, 
          max: 5, 
          color: "#20B2AA" // Light Sea Green
        },
        { 
          name: "Business Drive", 
          score: normalizeScore(driverScore, -28, 28), 
          min: 0, 
          max: 5, 
          color: "#9370DB" // Medium Purple
        },
        { 
          name: "Adaptability", 
          score: normalizeScore(adaptabilityScore, -28, 28), 
          min: 0, 
          max: 5, 
          color: "#3CB371" // Medium Sea Green
        },
        { 
          name: "Problem Resolution", 
          score: normalizeScore(problemResolutionScore, -28, 28), 
          min: 0, 
          max: 5, 
          color: "#FF7F50" // Coral
        }
      ];
      
      // If this is the self rater, add coachability score
      if (rater.raterType === 'self') {
        const coachabilityScore = calculateCoachabilityScore(rater.responses);
        dimensionScores.push({
          name: "Coachability", 
          score: coachabilityScore, 
          min: 10, 
          max: 50,
          color: getCoachabilityColor(coachabilityScore)
        });
        
        // Determine profile type
        profileType = determineProfileType(
          esteemScore,
          trustScore,
          driverScore,
          adaptabilityScore,
          problemResolutionScore
        );
      }
    } else {
      // Normal mode - calculate aggregate scores from all raters
      if (!selfRater) {
        console.log("No self rater found");
        return null;
      }
      
      if (!selfRater.responses || selfRater.responses.length === 0) {
        console.log("No responses found for self rater:", selfRater);
        return null;
      }
      
      // Calculate dimension scores for self rater
      const esteemScore = calculateDimensionScore(selfRater.responses, Section.ESTEEM);
      const trustScore = calculateDimensionScore(selfRater.responses, Section.TRUST);
      const driverScore = calculateDimensionScore(selfRater.responses, Section.DRIVER);
      const adaptabilityScore = calculateDimensionScore(selfRater.responses, Section.ADAPTABILITY);
      const problemResolutionScore = calculateDimensionScore(selfRater.responses, Section.PROBLEM_RESOLUTION);
      
      console.log("Self scores:", { esteemScore, trustScore, driverScore, adaptabilityScore, problemResolutionScore });
      
      // Calculate average scores from other raters
      let otherEsteemTotal = 0;
      let otherTrustTotal = 0;
      let otherDriverTotal = 0;
      let otherAdaptabilityTotal = 0;
      let otherProblemResolutionTotal = 0;
      let otherCount = 0;
      
      otherRaters.forEach(rater => {
        if (!rater.responses || rater.responses.length === 0) {
          console.log("No responses found for rater:", rater);
          return; // Skip this rater
        }
        
        const eScore = calculateDimensionScore(rater.responses, Section.ESTEEM);
        const tScore = calculateDimensionScore(rater.responses, Section.TRUST);
        const dScore = calculateDimensionScore(rater.responses, Section.DRIVER);
        const aScore = calculateDimensionScore(rater.responses, Section.ADAPTABILITY);
        const prScore = calculateDimensionScore(rater.responses, Section.PROBLEM_RESOLUTION);
        
        console.log(`Rater ${rater.name} scores:`, { eScore, tScore, dScore, aScore, prScore });
        
        otherEsteemTotal += eScore;
        otherTrustTotal += tScore;
        otherDriverTotal += dScore;
        otherAdaptabilityTotal += aScore;
        otherProblemResolutionTotal += prScore;
        otherCount++;
      });
      
      const otherEsteemScore = otherCount > 0 ? otherEsteemTotal / otherCount : 0;
      const otherTrustScore = otherCount > 0 ? otherTrustTotal / otherCount : 0;
      const otherDriverScore = otherCount > 0 ? otherDriverTotal / otherCount : 0;
      const otherAdaptabilityScore = otherCount > 0 ? otherAdaptabilityTotal / otherCount : 0;
      const otherProblemResolutionScore = otherCount > 0 ? otherProblemResolutionTotal / otherCount : 0;
      
      console.log("Others average scores:", {
        otherEsteemScore, otherTrustScore, otherDriverScore, otherAdaptabilityScore, otherProblemResolutionScore
      });
      
      // Normalize scores to 0-5 scale for display
      const normalizeScore = (score: number, min: number, max: number) => {
        return ((score - min) / (max - min)) * 5;
      };
      
      dimensionScores = [
        { 
          name: "Esteem", 
          selfScore: normalizeScore(esteemScore, -28, 28), 
          othersScore: normalizeScore(otherEsteemScore, -28, 28), 
          min: 0, 
          max: 5, 
          color: "#4169E1" // Royal Blue
        },
        { 
          name: "Trust", 
          selfScore: normalizeScore(trustScore, -28, 28), 
          othersScore: normalizeScore(otherTrustScore, -28, 28), 
          min: 0, 
          max: 5, 
          color: "#20B2AA" // Light Sea Green
        },
        { 
          name: "Business Drive", 
          selfScore: normalizeScore(driverScore, -28, 28), 
          othersScore: normalizeScore(otherDriverScore, -28, 28), 
          min: 0, 
          max: 5, 
          color: "#9370DB" // Medium Purple
        },
        { 
          name: "Adaptability", 
          selfScore: normalizeScore(adaptabilityScore, -28, 28), 
          othersScore: normalizeScore(otherAdaptabilityScore, -28, 28), 
          min: 0, 
          max: 5, 
          color: "#3CB371" // Medium Sea Green
        },
        { 
          name: "Problem Resolution", 
          selfScore: normalizeScore(problemResolutionScore, -28, 28), 
          othersScore: normalizeScore(otherProblemResolutionScore, -28, 28), 
          min: 0, 
          max: 5, 
          color: "#FF7F50" // Coral
        }
      ];
      
      // Calculate self awareness - using original scores (not normalized)
      const selfAwareness = otherCount > 0 ? 
        calculateSelfAwareness(selfRater.responses, otherRaters.map(r => r.responses)) : 0;
      
      // Calculate coachability
      const coachabilityScore = calculateCoachabilityScore(selfRater.responses);
      const coachabilityAwareness = otherCount > 0 ? 
        calculateCoachabilityAwareness(selfRater.responses, otherRaters.map(r => r.responses)) : 0;
      
      console.log("Calculated awareness metrics:", { selfAwareness, coachabilityAwareness });
      
      // Add coachability score to dimension scores
      dimensionScores.push({
        name: "Coachability", 
        selfScore: coachabilityScore, 
        othersScore: 0, // Others don't rate coachability
        min: 10, 
        max: 50,
        color: getCoachabilityColor(coachabilityScore)
      });
      
      // Determine profile type based on actual scores
      profileType = determineProfileType(
        esteemScore,
        trustScore,
        driverScore,
        adaptabilityScore,
        problemResolutionScore
      );
      
      console.log("Determined profile type:", profileType);
      
      return {
        dimensionScores,
        selfAwareness,
        coachabilityAwareness,
        profileType,
        rawScores: {
          esteemScore,
          trustScore,
          driverScore,
          adaptabilityScore,
          problemResolutionScore
        }
      };
    }
    
    // If we only have a single rater, don't calculate awareness metrics
    return {
      dimensionScores,
      selfAwareness: 0,
      coachabilityAwareness: 0,
      profileType
    };
  } catch (error) {
    console.error("Error calculating results:", error);
    return null;
  }
};

/**
 * Helper function to determine profile type based on dimension scores
 * These use the exact score ranges from the provided behavioral profile archetypes
 */
function determineProfileType(
  esteemScore: number,
  trustScore: number,
  driverScore: number,
  adaptabilityScore: number,
  problemResolutionScore: number
): string {
  console.log("Determining profile type with scores:", { 
    esteemScore, trustScore, driverScore, adaptabilityScore, problemResolutionScore 
  });
  
  // 1. The Balanced Achiever
  if (esteemScore >= 1 && esteemScore <= 15 && 
      trustScore >= 10 && trustScore <= 28 && 
      driverScore >= 10 && driverScore <= 28 && 
      adaptabilityScore >= -28 && adaptabilityScore <= -5 && 
      problemResolutionScore >= 15 && problemResolutionScore <= 28) {
    return "The Balanced Achiever";
  }
  
  // 2. The Supportive Driver
  if (esteemScore >= -10 && esteemScore <= 5 && 
      trustScore >= 10 && trustScore <= 28 && 
      driverScore >= 10 && driverScore <= 28 && 
      adaptabilityScore >= -15 && adaptabilityScore <= -5 && 
      problemResolutionScore >= 5 && problemResolutionScore <= 20) {
    return "The Supportive Driver";
  }
  
  // 3. The Process Improver
  if (esteemScore >= -10 && esteemScore <= 5 && 
      trustScore >= 10 && trustScore <= 28 && 
      driverScore >= 0 && driverScore <= 15 && 
      adaptabilityScore >= 10 && adaptabilityScore <= 28 && 
      problemResolutionScore >= 5 && problemResolutionScore <= 15) {
    return "The Process Improver";
  }
  
  // 4. The Technical Authority
  if (esteemScore >= 10 && esteemScore <= 28 && 
      trustScore >= -15 && trustScore <= 5 && 
      driverScore >= 0 && driverScore <= 15 && 
      adaptabilityScore >= 10 && adaptabilityScore <= 28 && 
      problemResolutionScore >= 15 && problemResolutionScore <= 28) {
    return "The Technical Authority";
  }
  
  // 5. The Harmonizing Adaptor
  if (esteemScore >= -15 && esteemScore <= 5 && 
      trustScore >= 20 && trustScore <= 28 && 
      driverScore >= 0 && driverScore <= 15 && 
      adaptabilityScore >= -28 && adaptabilityScore <= -10 && 
      problemResolutionScore >= -5 && problemResolutionScore <= 5) {
    return "The Harmonizing Adaptor";
  }
  
  // 6. The Analytical Resolver
  if (esteemScore >= -20 && esteemScore <= 5 && 
      trustScore >= -20 && trustScore <= 5 && 
      driverScore >= -28 && driverScore <= -10 && 
      adaptabilityScore >= 20 && adaptabilityScore <= 28 && 
      problemResolutionScore >= 5 && problemResolutionScore <= 20) {
    return "The Analytical Resolver";
  }
  
  // 7. The Growth Catalyst
  if (esteemScore >= 5 && esteemScore <= 20 && 
      trustScore >= 0 && trustScore <= 15 && 
      driverScore >= 20 && driverScore <= 28 && 
      adaptabilityScore >= -28 && adaptabilityScore <= -10 && 
      problemResolutionScore >= 15 && problemResolutionScore <= 28) {
    return "The Growth Catalyst";
  }
  
  // 8. The Diplomatic Stabilizer
  if (esteemScore >= -28 && esteemScore <= -10 && 
      trustScore >= 10 && trustScore <= 28 && 
      driverScore >= -20 && driverScore <= 5 && 
      adaptabilityScore >= 5 && adaptabilityScore <= 15 && 
      problemResolutionScore >= -15 && problemResolutionScore <= 5) {
    return "The Diplomatic Stabilizer";
  }
  
  // 9. The Confident Avoider
  if (esteemScore >= 10 && esteemScore <= 28 && 
      trustScore >= -5 && trustScore <= 15 && 
      driverScore >= 5 && driverScore <= 20 && 
      adaptabilityScore >= -10 && adaptabilityScore <= 10 && 
      problemResolutionScore >= -28 && problemResolutionScore <= -15) {
    return "The Confident Avoider";
  }
  
  // 10. The Direct Implementer
  if (esteemScore >= -5 && esteemScore <= 15 && 
      trustScore >= -5 && trustScore <= 15 && 
      driverScore >= 10 && driverScore <= 28 && 
      adaptabilityScore >= 10 && adaptabilityScore <= 28 && 
      problemResolutionScore >= 20 && problemResolutionScore <= 28) {
    return "The Direct Implementer";
  }
  
  // Default profile if no specific match is found
  return "The Balanced Achiever";
}

/**
 * Helper function to get the color for coachability score
 */
function getCoachabilityColor(score: number): string {
  if (score <= 30) return "#ef4444"; // red
  if (score <= 40) return "#eab308"; // yellow
  return "#22c55e"; // green
}
