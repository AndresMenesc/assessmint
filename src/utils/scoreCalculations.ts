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

// Helper function to categorize scores into ranges
export function categorizeScore(score: number): 'Low' | 'Neutral' | 'High' {
  if (score <= -10) return 'Low';
  if (score >= 10) return 'High';
  return 'Neutral';
}

// Helper function to categorize adaptability specifically
export function categorizeAdaptability(score: number): 'High Flexibility' | 'Balanced' | 'High Precision' {
  if (score <= -10) return 'High Flexibility';
  if (score >= 10) return 'High Precision';
  return 'Balanced';
}

// Helper function to categorize problem resolution
export function categorizeProblemResolution(score: number): 'Avoidant' | 'Balanced' | 'Direct' {
  if (score <= -10) return 'Avoidant';
  if (score >= 10) return 'Direct';
  return 'Balanced';
}

// Determine profile type based on dimension scores using the archetypes provided
export function determineProfileType(
  esteemScore: number,
  trustScore: number,
  driverScore: number,
  adaptabilityScore: number,
  problemResolutionScore: number
): string {
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
  const otherRaters = assessment.filter(r => r.raterType !== RaterType.SELF && r.completed);
  
  // Check if we have all required responses
  const allCompleted = selfRater?.completed && otherRaters.length > 0;
  
  if (!selfRater) {
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

  // Calculate scores for each rater
  const calculateScoresForRater = (rater: RaterResponses) => ({
    esteem: calculateDimensionScore(rater.responses, Section.ESTEEM),
    trust: calculateDimensionScore(rater.responses, Section.TRUST),
    driver: calculateDimensionScore(rater.responses, Section.DRIVER),
    adaptability: calculateDimensionScore(rater.responses, Section.ADAPTABILITY),
    problemResolution: calculateDimensionScore(rater.responses, Section.PROBLEM_RESOLUTION),
    coachability: calculateCoachabilityScore(rater.responses)
  });

  // Get scores for each completed rater
  const completedRaters = assessment.filter(r => r.completed);

  // Calculate average scores across all completed raters
  const averageScores = completedRaters.reduce((acc, rater) => {
    const scores = calculateScoresForRater(rater);
    return {
      esteem: acc.esteem + scores.esteem,
      trust: acc.trust + scores.trust,
      driver: acc.driver + scores.driver,
      adaptability: acc.adaptability + scores.adaptability,
      problemResolution: acc.problemResolution + scores.problemResolution,
      coachability: acc.coachability + scores.coachability
    };
  }, {
    esteem: 0,
    trust: 0,
    driver: 0,
    adaptability: 0,
    problemResolution: 0,
    coachability: 0
  });

  const raterCount = completedRaters.length;
  const finalScores = {
    esteem: averageScores.esteem / raterCount,
    trust: averageScores.trust / raterCount,
    driver: averageScores.driver / raterCount,
    adaptability: averageScores.adaptability / raterCount,
    problemResolution: averageScores.problemResolution / raterCount,
    coachability: averageScores.coachability / raterCount
  };

  // Calculate profile type based on averaged scores
  const profileType = determineProfileType(
    finalScores.esteem,
    finalScores.trust,
    finalScores.driver,
    finalScores.adaptability,
    finalScores.problemResolution
  );

  // Format dimension scores for display
  const dimensionScores = [
    { 
      dimension: "Esteem", 
      score: finalScores.esteem,
      min: -28, 
      max: 28, 
      color: "#4169E1" 
    },
    { 
      dimension: "Trust", 
      score: finalScores.trust,
      min: -28, 
      max: 28, 
      color: "#20B2AA" 
    },
    { 
      dimension: "Business Drive", 
      score: finalScores.driver,
      min: -28, 
      max: 28, 
      color: "#9370DB" 
    },
    { 
      dimension: "Adaptability", 
      score: finalScores.adaptability,
      min: -28, 
      max: 28, 
      color: "#3CB371" 
    },
    { 
      dimension: "Problem Resolution", 
      score: finalScores.problemResolution,
      min: -28, 
      max: 28, 
      color: "#FF7F50" 
    },
    { 
      dimension: "Coachability", 
      score: finalScores.coachability,
      min: 10, 
      max: 50, 
      color: finalScores.coachability <= 30 ? "#ef4444" : finalScores.coachability <= 40 ? "#eab308" : "#22c55e"
    }
  ];

  // Calculate awareness metrics
  const selfAwareness = selfRater && otherRaters.length > 0 ? 
    calculateSelfAwareness(selfRater.responses, otherRaters.map(r => r.responses)) : 0;
  const coachabilityAwareness = selfRater && otherRaters.length > 0 ? 
    calculateCoachabilityAwareness(selfRater.responses, otherRaters.map(r => r.responses)) : 0;

  // Map the finalScores object to match the expected rawScores structure
  const rawScores = {
    esteemScore: finalScores.esteem,
    trustScore: finalScores.trust,
    driverScore: finalScores.driver,
    adaptabilityScore: finalScores.adaptability,
    problemResolutionScore: finalScores.problemResolution,
    coachabilityScore: finalScores.coachability
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
