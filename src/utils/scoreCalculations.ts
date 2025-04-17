import { AssessmentResponse, Question, RaterResponses, RaterType, Section } from "../types/assessment";
import { questions } from "../data/questions";

// Calculate the score for a specific dimension
export function calculateDimensionScore(responses: AssessmentResponse[], dimension: Section): number {
  const dimensionQuestions = questions.filter(q => q.section === dimension);
  
  console.log(`Calculating ${dimension} score from ${responses.length} responses and ${dimensionQuestions.length} questions`);
  
  let totalScore = 0;
  let answeredQuestions = 0;
  
  for (const question of dimensionQuestions) {
    const response = responses.find(r => r.questionId === question.id);
    if (response) {
      let score = response.score;
      
      // Apply reverse scoring if needed
      if (question.isReversed) {
        const originalScore = score;
        score = 6 - score; // Reverses 1->5, 2->4, 3->3, 4->2, 5->1
        console.log(`  Question ${question.id} (reversed): Original score ${originalScore} -> ${score}`);
      } else {
        console.log(`  Question ${question.id}: Score ${score}`);
      }
      
      // Apply negative scoring if needed (for Insecure, Cautious, Flexible, and Avoidant sections)
      if (question.negativeScore) {
        const originalScore = score;
        score = -score;
        console.log(`  Question ${question.id} (negative): Original score ${originalScore} -> ${score}`);
      }
      
      totalScore += score;
      answeredQuestions++;
      console.log(`  Running total: ${totalScore}`);
    }
  }
  
  console.log(`Calculated ${dimension} score: ${totalScore} (from ${answeredQuestions} questions)`);
  
  // If no questions were answered for this dimension, return 0
  if (answeredQuestions === 0) {
    console.warn(`No answered questions found for dimension ${dimension}`);
    return 0;
  }
  
  return totalScore;
}

// Calculate coachability score (10-50 scale)
export function calculateCoachabilityScore(responses: AssessmentResponse[]): number {
  const coachabilityQuestions = questions.filter(q => q.section === Section.COACHABILITY);
  let totalScore = 0;
  let answeredQuestions = 0;
  
  for (const question of coachabilityQuestions) {
    const response = responses.find(r => r.questionId === question.id);
    if (response) {
      let score = response.score;
      
      // Apply reverse scoring if needed (specific to coachability section)
      if (question.isReversed) {
        score = 6 - score; // Reverses 1->5, 2->4, 3->3, 4->2, 5->1
      }
      
      totalScore += score;
      answeredQuestions++;
    }
  }
  
  // Return the score even if not all questions are answered, but ensure it's still on 10-50 scale
  // by adjusting for missing questions
  if (answeredQuestions === 0) return 0;
  
  // Since each question is 1-5 points, and we have 10 coachability questions,
  // the max possible score is 50 (10 questions * 5 points)
  const maxQuestions = coachabilityQuestions.length;
  const scalingFactor = maxQuestions / answeredQuestions;
  const scaledScore = Math.round(totalScore * scalingFactor);
  
  console.log(`Coachability score: ${scaledScore} (from ${answeredQuestions}/${maxQuestions} questions)`);
  return scaledScore;
}

// Calculate self-awareness (comparing self vs others' ratings)
export function calculateSelfAwareness(
  selfResponses: AssessmentResponse[],
  otherResponses: AssessmentResponse[][]
): number {
  if (!selfResponses.length || otherResponses.length === 0) {
    return 0;
  }

  // Calculate average score for each question from other raters
  const averageOtherScores: { [key: string]: number } = {};
  const otherScoresCounts: { [key: string]: number } = {};

  // Initialize with all questions
  questions.forEach(q => {
    averageOtherScores[q.id] = 0;
    otherScoresCounts[q.id] = 0;
  });

  // Sum up all other rater scores
  otherResponses.forEach(raterResponses => {
    raterResponses.forEach(response => {
      const question = questions.find(q => q.id === response.questionId);
      if (question) {
        let score = response.score;
        if (question.isReversed) {
          score = 6 - score;
        }
        if (question.negativeScore) {
          score = -score;
        }
        
        averageOtherScores[question.id] += score;
        otherScoresCounts[question.id] += 1;
      }
    });
  });

  // Calculate average for each question
  Object.keys(averageOtherScores).forEach(questionId => {
    if (otherScoresCounts[questionId] > 0) {
      averageOtherScores[questionId] /= otherScoresCounts[questionId];
    }
  });

  // Calculate absolute difference between self scores and average other scores
  let totalDifference = 0;
  let totalComparisonPoints = 0;

  selfResponses.forEach(response => {
    const question = questions.find(q => q.id === response.questionId);
    if (question && otherScoresCounts[question.id] > 0) {
      let selfScore = response.score;
      if (question.isReversed) {
        selfScore = 6 - selfScore;
      }
      if (question.negativeScore) {
        selfScore = -selfScore;
      }
      
      totalDifference += Math.abs(selfScore - averageOtherScores[question.id]);
      totalComparisonPoints++;
    }
  });

  // Avoid division by zero
  if (totalComparisonPoints === 0) {
    return 0;
  }

  // Calculate self-awareness percentage based on the formula:
  // OVERALL SELF AWARENESS = 100 - (Absolute value of the Average sum of differences / Max possible difference) * 100
  // Max possible difference per question is 4 (1 vs 5)
  const maxPossibleDifference = totalComparisonPoints * 4;
  const selfAwareness = 100 - ((totalDifference / maxPossibleDifference) * 100);
  
  // Return as percentage (0-100)
  console.log(`Self-awareness: ${selfAwareness.toFixed(2)}% (diff: ${totalDifference}, points: ${totalComparisonPoints})`);
  return Math.max(0, Math.min(100, selfAwareness));
}

// Calculate coachability awareness (comparing self vs others on coachability)
export function calculateCoachabilityAwareness(
  selfResponses: AssessmentResponse[],
  otherResponses: AssessmentResponse[][]
): number {
  // Filter only coachability responses
  const coachabilityQuestions = questions.filter(q => q.section === Section.COACHABILITY);
  const coachabilityIds = coachabilityQuestions.map(q => q.id);
  
  const selfCoachResponses = selfResponses.filter(r => 
    coachabilityIds.includes(r.questionId)
  );
  
  const otherCoachResponses = otherResponses.map(raterResponses => 
    raterResponses.filter(r => coachabilityIds.includes(r.questionId))
  );
  
  // Use the same self-awareness calculation method but only for coachability questions
  return calculateSelfAwareness(selfCoachResponses, otherCoachResponses);
}

// Determine profile type based on dimension scores using the archetypes provided
export function determineProfileType(
  esteemScore: number,
  trustScore: number,
  driverScore: number,
  adaptabilityScore: number,
  problemResolutionScore: number
): string {
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

  // Get categories for each dimension based on their scores
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
  return 'Unidentified Profile';
}

export function calculateAllResults(assessment: RaterResponses[]): {
  dimensionScores: { dimension: string, score: number, min: number, max: number, color: string }[],
  selfAwareness: number,
  coachabilityAwareness: number,
  profileType: string,
  completed: boolean,
  rawScores: {
    esteemScore: number,
    trustScore: number,
    driverScore: number,
    adaptabilityScore: number,
    problemResolutionScore: number,
    coachabilityScore: number
  }
} {
  // Filter responses by rater type
  const selfRater = assessment.find(rater => rater.raterType === RaterType.SELF);
  const otherRaters = assessment.filter(rater => 
    rater.raterType !== RaterType.SELF && rater.completed
  );
  
  // Check if we have all required responses
  const allCompleted = selfRater?.completed && otherRaters.length >= 2;
  
  if (!selfRater || otherRaters.length < 2) {
    return {
      dimensionScores: [],
      selfAwareness: 0,
      coachabilityAwareness: 0,
      profileType: "",
      completed: false,
      rawScores: {
        esteemScore: 0,
        trustScore: 0,
        driverScore: 0,
        adaptabilityScore: 0,
        problemResolutionScore: 0,
        coachabilityScore: 0
      }
    };
  }
  
  // Calculate dimension scores for self-rater
  const selfEsteemScore = calculateDimensionScore(selfRater.responses, Section.ESTEEM);
  const selfTrustScore = calculateDimensionScore(selfRater.responses, Section.TRUST);
  const selfDriverScore = calculateDimensionScore(selfRater.responses, Section.DRIVER);
  const selfAdaptabilityScore = calculateDimensionScore(selfRater.responses, Section.ADAPTABILITY);
  const selfProblemResolutionScore = calculateDimensionScore(selfRater.responses, Section.PROBLEM_RESOLUTION);
  const selfCoachabilityScore = calculateCoachabilityScore(selfRater.responses);
  
  console.log("Self rater dimension scores:", {
    selfEsteemScore,
    selfTrustScore,
    selfDriverScore,
    selfAdaptabilityScore,
    selfProblemResolutionScore,
    selfCoachabilityScore
  });
  
  // Calculate scores for each rater and keep track of totals for averaging
  let totalEsteemScore = selfEsteemScore;
  let totalTrustScore = selfTrustScore;
  let totalDriverScore = selfDriverScore;
  let totalAdaptabilityScore = selfAdaptabilityScore;
  let totalProblemResolutionScore = selfProblemResolutionScore;
  let raterCount = 1; // Start with 1 for self-rater
  
  // Individual scores for each rater
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
  
  // Calculate scores for each other rater and add to totals
  otherRaters.forEach((rater, index) => {
    const esteemScore = calculateDimensionScore(rater.responses, Section.ESTEEM);
    const trustScore = calculateDimensionScore(rater.responses, Section.TRUST);
    const driverScore = calculateDimensionScore(rater.responses, Section.DRIVER);
    const adaptabilityScore = calculateDimensionScore(rater.responses, Section.ADAPTABILITY);
    const problemResolutionScore = calculateDimensionScore(rater.responses, Section.PROBLEM_RESOLUTION);
    const coachabilityScore = calculateCoachabilityScore(rater.responses);
    
    console.log(`Rater ${index + 1} dimension scores:`, {
      esteemScore,
      trustScore,
      driverScore,
      adaptabilityScore,
      problemResolutionScore,
      coachabilityScore
    });
    
    // Add to totals
    totalEsteemScore += esteemScore;
    totalTrustScore += trustScore;
    totalDriverScore += driverScore;
    totalAdaptabilityScore += adaptabilityScore;
    totalProblemResolutionScore += problemResolutionScore;
    raterCount++;
    
    // Store individual rater scores
    if (index === 0) {
      rater1EsteemScore = esteemScore;
      rater1TrustScore = trustScore;
      rater1DriverScore = driverScore;
      rater1AdaptabilityScore = adaptabilityScore;
      rater1ProblemResolutionScore = problemResolutionScore;
      rater1CoachabilityScore = coachabilityScore;
    } else if (index === 1) {
      rater2EsteemScore = esteemScore;
      rater2TrustScore = trustScore;
      rater2DriverScore = driverScore;
      rater2AdaptabilityScore = adaptabilityScore;
      rater2ProblemResolutionScore = problemResolutionScore;
      rater2CoachabilityScore = coachabilityScore;
    }
  });
  
  // Calculate averages
  const avgEsteemScore = totalEsteemScore / raterCount;
  const avgTrustScore = totalTrustScore / raterCount;
  const avgDriverScore = totalDriverScore / raterCount;
  const avgAdaptabilityScore = totalAdaptabilityScore / raterCount;
  const avgProblemResolutionScore = totalProblemResolutionScore / raterCount;
  
  console.log("Average dimension scores:", {
    avgEsteemScore,
    avgTrustScore,
    avgDriverScore,
    avgAdaptabilityScore,
    avgProblemResolutionScore
  });
  
  // Calculate self-awareness
  const selfAwareness = calculateSelfAwareness(
    selfRater.responses,
    otherRaters.map(rater => rater.responses)
  );
  
  // Calculate coachability awareness
  const coachabilityAwareness = calculateCoachabilityAwareness(
    selfRater.responses,
    otherRaters.map(rater => rater.responses)
  );
  
  // Determine profile type based on average scores
  const profileType = determineProfileType(
    avgEsteemScore,
    avgTrustScore,
    avgDriverScore,
    avgAdaptabilityScore,
    avgProblemResolutionScore
  );
  
  // Format dimension scores for display
  // Include both individual rater scores and the average score
  const dimensionScores = [
    { 
      dimension: "Esteem", 
      selfScore: selfEsteemScore,
      rater1Score: rater1EsteemScore,
      rater2Score: rater2EsteemScore,
      avgScore: Number(avgEsteemScore.toFixed(1)),
      min: -28, 
      max: 28, 
      color: "#4169E1" 
    },
    { 
      dimension: "Trust", 
      selfScore: selfTrustScore,
      rater1Score: rater1TrustScore,
      rater2Score: rater2TrustScore,
      avgScore: Number(avgTrustScore.toFixed(1)),
      min: -28, 
      max: 28, 
      color: "#20B2AA" 
    },
    { 
      dimension: "Business Drive", 
      selfScore: selfDriverScore,
      rater1Score: rater1DriverScore,
      rater2Score: rater2DriverScore,
      avgScore: Number(avgDriverScore.toFixed(1)),
      min: -28, 
      max: 28, 
      color: "#9370DB" 
    },
    { 
      dimension: "Adaptability", 
      selfScore: selfAdaptabilityScore,
      rater1Score: rater1AdaptabilityScore,
      rater2Score: rater2AdaptabilityScore,
      avgScore: Number(avgAdaptabilityScore.toFixed(1)),
      min: -28, 
      max: 28, 
      color: "#3CB371" 
    },
    { 
      dimension: "Problem Resolution", 
      selfScore: selfProblemResolutionScore,
      rater1Score: rater1ProblemResolutionScore,
      rater2Score: rater2ProblemResolutionScore,
      avgScore: Number(avgProblemResolutionScore.toFixed(1)),
      min: -28, 
      max: 28, 
      color: "#FF7F50" 
    },
    { 
      dimension: "Coachability", 
      selfScore: selfCoachabilityScore,
      rater1Score: rater1CoachabilityScore,
      rater2Score: rater2CoachabilityScore,
      avgScore: selfCoachabilityScore, // Only using self score for coachability (as before)
      min: 10, 
      max: 50, 
      color: selfCoachabilityScore <= 30 ? "#ef4444" : selfCoachabilityScore <= 40 ? "#eab308" : "#22c55e" 
    }
  ];
  
  // Store raw scores for debugging in ProfileCard
  const rawScores = {
    esteemScore: avgEsteemScore,
    trustScore: avgTrustScore,
    driverScore: avgDriverScore,
    adaptabilityScore: avgAdaptabilityScore,
    problemResolutionScore: avgProblemResolutionScore,
    coachabilityScore: selfCoachabilityScore
  };
  
  return {
    dimensionScores,
    selfAwareness,
    coachabilityAwareness,
    profileType,
    completed: allCompleted,
    rawScores
  };
}
