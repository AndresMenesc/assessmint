
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
    const rater1 = raters.find(r => r.raterType === 'rater1' && r.completed);
    const rater2 = raters.find(r => r.raterType === 'rater2' && r.completed);
    
    console.log("Self rater:", selfRater);
    console.log("Other raters:", otherRaters);
    console.log("Rater 1:", rater1);
    console.log("Rater 2:", rater2);
    
    // For individual results, we might be calculating for a single rater
    const isSingleRaterMode = raters.length === 1;
    
    let dimensionScores;
    let profileType = '';
    let rawScores = {};
    
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
      
      // Store raw scores for debugging
      rawScores = {
        esteemScore,
        trustScore,
        driverScore,
        adaptabilityScore,
        problemResolutionScore
      };
      
      // Use the raw scores directly without normalization
      dimensionScores = [
        { 
          name: "Esteem", 
          score: esteemScore,
          min: -28, 
          max: 28, 
          color: "#4169E1" // Royal Blue
        },
        { 
          name: "Trust", 
          score: trustScore,
          min: -28, 
          max: 28, 
          color: "#20B2AA" // Light Sea Green
        },
        { 
          name: "Business Drive", 
          score: driverScore,
          min: -28, 
          max: 28, 
          color: "#9370DB" // Medium Purple
        },
        { 
          name: "Adaptability", 
          score: adaptabilityScore,
          min: -28, 
          max: 28, 
          color: "#3CB371" // Medium Sea Green
        },
        { 
          name: "Problem Resolution", 
          score: problemResolutionScore,
          min: -28, 
          max: 28, 
          color: "#FF7F50" // Coral
        }
      ];
      
      // Calculate coachability score for all rater types, not just self
      const coachabilityScore = calculateCoachabilityScore(rater.responses);
      dimensionScores.push({
        name: "Coachability", 
        score: coachabilityScore, 
        min: 10, 
        max: 50,
        color: getCoachabilityColor(coachabilityScore)
      });
      
      // Store coachability in raw scores
      rawScores = {
        ...rawScores,
        coachabilityScore
      };
      
      // Determine profile type
      if (rater.raterType === 'self') {
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
      const selfEsteemScore = calculateDimensionScore(selfRater.responses, Section.ESTEEM);
      const selfTrustScore = calculateDimensionScore(selfRater.responses, Section.TRUST);
      const selfDriverScore = calculateDimensionScore(selfRater.responses, Section.DRIVER);
      const selfAdaptabilityScore = calculateDimensionScore(selfRater.responses, Section.ADAPTABILITY);
      const selfProblemResolutionScore = calculateDimensionScore(selfRater.responses, Section.PROBLEM_RESOLUTION);
      
      console.log("Self scores:", { selfEsteemScore, selfTrustScore, selfDriverScore, selfAdaptabilityScore, selfProblemResolutionScore });
      
      // Calculate coachability score for self
      const selfCoachabilityScore = calculateCoachabilityScore(selfRater.responses);
      
      // Calculate scores for rater1 and rater2 if available
      let rater1EsteemScore = 0;
      let rater1TrustScore = 0;
      let rater1DriverScore = 0;
      let rater1AdaptabilityScore = 0;
      let rater1ProblemResolutionScore = 0;
      let rater1CoachabilityScore = 0;
      
      let rater2EsteemScore = 0;
      let rater2TrustScore = 0;
      let rater2DriverScore = 0;
      let rater2AdaptabilityScore = 0;
      let rater2ProblemResolutionScore = 0;
      let rater2CoachabilityScore = 0;
      
      let raterCount = 1; // Start with 1 for self
      
      if (rater1 && rater1.responses && rater1.responses.length > 0) {
        rater1EsteemScore = calculateDimensionScore(rater1.responses, Section.ESTEEM);
        rater1TrustScore = calculateDimensionScore(rater1.responses, Section.TRUST);
        rater1DriverScore = calculateDimensionScore(rater1.responses, Section.DRIVER);
        rater1AdaptabilityScore = calculateDimensionScore(rater1.responses, Section.ADAPTABILITY);
        rater1ProblemResolutionScore = calculateDimensionScore(rater1.responses, Section.PROBLEM_RESOLUTION);
        rater1CoachabilityScore = calculateCoachabilityScore(rater1.responses);
        raterCount++;
        
        console.log("Rater 1 scores:", {
          rater1EsteemScore,
          rater1TrustScore,
          rater1DriverScore,
          rater1AdaptabilityScore,
          rater1ProblemResolutionScore,
          rater1CoachabilityScore
        });
      }
      
      if (rater2 && rater2.responses && rater2.responses.length > 0) {
        rater2EsteemScore = calculateDimensionScore(rater2.responses, Section.ESTEEM);
        rater2TrustScore = calculateDimensionScore(rater2.responses, Section.TRUST);
        rater2DriverScore = calculateDimensionScore(rater2.responses, Section.DRIVER);
        rater2AdaptabilityScore = calculateDimensionScore(rater2.responses, Section.ADAPTABILITY);
        rater2ProblemResolutionScore = calculateDimensionScore(rater2.responses, Section.PROBLEM_RESOLUTION);
        rater2CoachabilityScore = calculateCoachabilityScore(rater2.responses);
        raterCount++;
        
        console.log("Rater 2 scores:", {
          rater2EsteemScore,
          rater2TrustScore,
          rater2DriverScore,
          rater2AdaptabilityScore,
          rater2ProblemResolutionScore,
          rater2CoachabilityScore
        });
      }
      
      // Calculate average scores across all raters
      const avgEsteemScore = (selfEsteemScore + rater1EsteemScore + rater2EsteemScore) / raterCount;
      const avgTrustScore = (selfTrustScore + rater1TrustScore + rater2TrustScore) / raterCount;
      const avgDriverScore = (selfDriverScore + rater1DriverScore + rater2DriverScore) / raterCount;
      const avgAdaptabilityScore = (selfAdaptabilityScore + rater1AdaptabilityScore + rater2AdaptabilityScore) / raterCount;
      const avgProblemResolutionScore = (selfProblemResolutionScore + rater1ProblemResolutionScore + rater2ProblemResolutionScore) / raterCount;
      const avgCoachabilityScore = (selfCoachabilityScore + rater1CoachabilityScore + rater2CoachabilityScore) / raterCount;
      
      console.log("Average scores:", {
        avgEsteemScore,
        avgTrustScore,
        avgDriverScore,
        avgAdaptabilityScore,
        avgProblemResolutionScore,
        avgCoachabilityScore
      });
      
      // Store raw scores for debugging
      rawScores = {
        esteemScore: avgEsteemScore,
        trustScore: avgTrustScore,
        driverScore: avgDriverScore,
        adaptabilityScore: avgAdaptabilityScore,
        problemResolutionScore: avgProblemResolutionScore,
        coachabilityScore: avgCoachabilityScore
      };
      
      // Use the average scores for the dimension scores
      dimensionScores = [
        { 
          name: "Esteem", 
          score: avgEsteemScore,
          min: -28, 
          max: 28, 
          color: "#4169E1" // Royal Blue
        },
        { 
          name: "Trust", 
          score: avgTrustScore,
          min: -28, 
          max: 28, 
          color: "#20B2AA" // Light Sea Green
        },
        { 
          name: "Business Drive", 
          score: avgDriverScore,
          min: -28, 
          max: 28, 
          color: "#9370DB" // Medium Purple
        },
        { 
          name: "Adaptability", 
          score: avgAdaptabilityScore,
          min: -28, 
          max: 28, 
          color: "#3CB371" // Medium Sea Green
        },
        { 
          name: "Problem Resolution", 
          score: avgProblemResolutionScore,
          min: -28, 
          max: 28, 
          color: "#FF7F50" // Coral
        }
      ];
      
      // Add coachability score
      dimensionScores.push({
        name: "Coachability", 
        score: avgCoachabilityScore,
        min: 10, 
        max: 50,
        color: getCoachabilityColor(avgCoachabilityScore)
      });
      
      // Determine profile type based on average scores
      profileType = determineProfileType(
        avgEsteemScore,
        avgTrustScore,
        avgDriverScore,
        avgAdaptabilityScore,
        avgProblemResolutionScore
      );
      
      console.log("Determined profile type:", profileType);
      
      // Calculate awareness metrics
      const selfAwareness = otherRaters.length > 0 ? 
        calculateSelfAwareness(selfRater.responses, otherRaters.map(r => r.responses)) : 0;
      
      const coachabilityAwareness = otherRaters.length > 0 ? 
        calculateCoachabilityAwareness(selfRater.responses, otherRaters.map(r => r.responses)) : 0;
      
      return {
        dimensionScores,
        selfAwareness,
        coachabilityAwareness,
        profileType,
        rawScores
      };
    }
    
    // If we only have a single rater, don't calculate awareness metrics
    return {
      dimensionScores,
      selfAwareness: 0,
      coachabilityAwareness: 0,
      profileType,
      rawScores
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
  console.log("Determining profile with scores:", { 
    esteemScore, 
    trustScore, 
    driverScore, 
    adaptabilityScore, 
    problemResolutionScore 
  });

  // Helper function to categorize scores into ranges
  const categorizeScore = (score: number): 'Low' | 'Neutral' | 'High' => {
    if (score <= -10) return 'Low';
    if (score >= 10) return 'High';
    return 'Neutral';
  };

  // Helper function to categorize adaptability specifically
  const categorizeAdaptability = (score: number): 'High Flexibility' | 'Balanced' | 'High Precision' => {
    if (score <= -10) return 'High Flexibility';
    if (score >= 10) return 'High Precision';
    return 'Balanced';
  };

  // Helper function to categorize problem resolution
  const categorizeProblemResolution = (score: number): 'Avoidant' | 'Balanced' | 'Direct' => {
    if (score <= -10) return 'Avoidant';
    if (score >= 10) return 'Direct';
    return 'Balanced';
  };

  // Get categories for each dimension
  const esteem = categorizeScore(esteemScore);
  const trust = categorizeScore(trustScore);
  const drive = categorizeScore(driverScore);
  const adaptability = categorizeAdaptability(adaptabilityScore);
  const problemResolution = categorizeProblemResolution(problemResolutionScore);

  // Log the categorizations for debugging
  console.log('Profile Categories:', {
    esteem,
    trust,
    drive,
    adaptability,
    problemResolution
  });
  
  // Match profile patterns
  if (esteem === 'Neutral' && trust === 'High' && drive === 'High' && 
      adaptability === 'High Flexibility' && problemResolution === 'Direct') {
    return 'The Trusting Driven Flexible';
  }

  if (esteem === 'High' && trust === 'Low' && drive === 'Neutral' && 
      adaptability === 'High Precision' && problemResolution === 'Direct') {
    return 'The Confident Cautious Precise';
  }

  if (esteem === 'Low' && trust === 'High' && drive === 'Low' && 
      adaptability === 'Balanced' && problemResolution === 'Avoidant') {
    return 'The Modest Trusting Reserved';
  }

  if (esteem === 'Neutral' && trust === 'Neutral' && drive === 'Neutral' && 
      adaptability === 'Balanced' && problemResolution === 'Balanced') {
    return 'The Complete Neutral';
  }

  if (esteem === 'Low' && trust === 'Low' && drive === 'Neutral' && 
      adaptability === 'High Precision' && problemResolution === 'Direct') {
    return 'The Modest Cautious Precise';
  }

  if (esteem === 'High' && trust === 'High' && drive === 'Low' && 
      adaptability === 'High Flexibility' && problemResolution === 'Balanced') {
    return 'The Confident Trusting Reserved';
  }

  if (esteem === 'High' && trust === 'High' && drive === 'High' && 
      adaptability === 'Balanced' && problemResolution === 'Direct') {
    return 'The Confident Trusting Direct';
  }

  if (esteem === 'Low' && trust === 'Neutral' && drive === 'Neutral' && 
      adaptability === 'High Precision' && problemResolution === 'Balanced') {
    return 'The Modest Precise Balanced';
  }

  if (esteem === 'Neutral' && trust === 'Low' && drive === 'Neutral' && 
      adaptability === 'High Flexibility' && problemResolution === 'Avoidant') {
    return 'The Cautious Flexible Avoider';
  }

  if (esteem === 'Low' && trust === 'Neutral' && drive === 'High' && 
      adaptability === 'Balanced' && problemResolution === 'Direct') {
    return 'The Modest Driven Direct';
  }

  if (esteem === 'High' && trust === 'Neutral' && drive === 'Low' && 
      adaptability === 'High Precision' && problemResolution === 'Balanced') {
    return 'The Confident Reserved Precise';
  }

  if (esteem === 'Neutral' && trust === 'Low' && drive === 'Neutral' && 
      adaptability === 'Balanced' && problemResolution === 'Balanced') {
    return 'The Low Trust Balanced Profile';
  }

  if (esteem === 'Neutral' && trust === 'Neutral' && drive === 'Low' && 
      adaptability === 'High Flexibility' && problemResolution === 'Balanced') {
    return 'The Highly Flexible Reserved';
  }

  if (esteem === 'High' && trust === 'High' && drive === 'High' && 
      adaptability === 'High Precision' && problemResolution === 'Direct') {
    return 'The Triply High Direct';
  }

  if (esteem === 'Low' && trust === 'Low' && drive === 'Low' && 
      adaptability === 'High Flexibility' && problemResolution === 'Avoidant') {
    return 'The Triply Low Avoider';
  }

  if (esteem === 'High' && trust === 'Low' && drive === 'High' && 
      adaptability === 'High Flexibility' && problemResolution === 'Avoidant') {
    return 'The Mixed Extreme';
  }

  // If no match is found
  return 'No Profile Defined';
}

/**
 * Helper function to get the color for coachability score
 */
function getCoachabilityColor(score: number): string {
  if (score <= 30) return "#ef4444"; // red
  if (score <= 40) return "#eab308"; // yellow
  return "#22c55e"; // green
}
