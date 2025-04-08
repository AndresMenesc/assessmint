import { Response, Section, SubSection, AssessmentResponse } from "@/types/assessment";
import { getQuestions } from "@/data/questions";

/**
 * Calculates the total score for a given section based on the provided responses.
 * @param {Response[]} responses - An array of responses to assessment questions.
 * @param {string} section - The section for which to calculate the score.
 * @returns {number} The total score for the specified section.
 */
export function calculateSectionScore(responses: Response[], section: string): number {
  // Filter responses to include only those that belong to the specified section
  const sectionResponses = responses.filter(response => {
    const question = getQuestions().find(q => q.id === response.questionId);
    return question ? question.section === section : false;
  });

  // Calculate the total score by summing the scores of the filtered responses
  return sectionResponses.reduce((total, response) => total + response.score, 0);
}

/**
 * Calculates the total score for a given sub-section based on the provided responses.
 * @param {Response[]} responses - An array of responses to assessment questions.
 * @param {string} subSection - The sub-section for which to calculate the score.
 * @returns {number} The total score for the specified sub-section.
 */
export function calculateSubSectionScore(responses: Response[], subSection: string): number {
  // Filter responses to include only those that belong to the specified sub-section
  const subSectionResponses = responses.filter(response => {
    const question = getQuestions().find(q => q.id === response.questionId);
    return question ? question.subSection === subSection : false;
  });

  // Calculate the total score by summing the scores of the filtered responses
  return subSectionResponses.reduce((total, response) => total + response.score, 0);
}

/**
 * Calculates dimension scores based on the provided responses.
 * @param {Response[]} responses - An array of responses to assessment questions.
 * @returns {{ [key: string]: number }} An object containing the calculated dimension scores.
 */
/**
 * Modified function to handle Response or AssessmentResponse objects
 */
export function calculateDimensionScores(responses: Response[] | AssessmentResponse[]): { [key: string]: number } {
  // For AssessmentResponse types, extract just what we need
  const normalizedResponses = responses.map(r => ({
    questionId: r.questionId,
    score: r.score
  }));

  const esteemScore = calculateEsteemScore(normalizedResponses);
  const trustScore = calculateTrustScore(normalizedResponses);
  const driverScore = calculateDriverScore(normalizedResponses);
  const adaptabilityScore = calculateAdaptabilityScore(normalizedResponses);
  const problemResolutionScore = calculateProblemResolutionScore(normalizedResponses);
  const coachabilityScore = calculateCoachabilityScore(normalizedResponses);
  const directScore = calculateDirectScore(normalizedResponses);

  return {
    [Section.ESTEEM]: esteemScore,
    [Section.TRUST]: trustScore,
    [Section.DRIVER]: driverScore,
    [Section.ADAPTABILITY]: adaptabilityScore,
    [Section.PROBLEM_RESOLUTION]: problemResolutionScore,
    [SubSection.COACHABILITY]: coachabilityScore,
    [SubSection.DIRECT]: directScore
  };
}

/**
 * Calculates the Esteem score based on the provided responses.
 * @param {Response[]} responses - An array of responses to assessment questions.
 * @returns {number} The calculated Esteem score.
 */
/**
 * Modified calculation functions to handle both types
 */
export function calculateEsteemScore(responses: Response[] | AssessmentResponse[]): number {
  // Convert to simple Response format
  const simpleResponses = responses.map(r => ({
    questionId: r.questionId,
    score: r.score
  }));
  
  const insecureScore = calculateSubSectionScore(simpleResponses, SubSection.INSECURE);
  const prideScore = calculateSubSectionScore(simpleResponses, SubSection.PRIDE);

  // Get all questions for the "Insecure" sub-section
  const insecureQuestions = getQuestions().filter(q => q.subSection === SubSection.INSECURE);
  const prideQuestions = getQuestions().filter(q => q.subSection === SubSection.PRIDE);

  // Calculate the maximum possible score for "Insecure" and "Pride"
  const maxInsecureScore = insecureQuestions.length * 7;
  const maxPrideScore = prideQuestions.length * 7;

  // Calculate the adjusted scores
  const adjustedInsecureScore = maxInsecureScore - insecureScore;
  const adjustedPrideScore = maxPrideScore - prideScore;

  return adjustedInsecureScore + adjustedPrideScore;
}

/**
 * Calculates the Trust score based on the provided responses.
 * @param {Response[]} responses - An array of responses to assessment questions.
 * @returns {number} The calculated Trust score.
 */
export function calculateTrustScore(responses: Response[] | AssessmentResponse[]): number {
  // Convert to simple Response format
  const simpleResponses = responses.map(r => ({
    questionId: r.questionId,
    score: r.score
  }));

  const trustingScore = calculateSubSectionScore(simpleResponses, SubSection.TRUSTING);
  const cautiousScore = calculateSubSectionScore(simpleResponses, SubSection.CAUTIOUS);

  // Get all questions for the "Trusting" and "Cautious" sub-sections
  const trustingQuestions = getQuestions().filter(q => q.subSection === SubSection.TRUSTING);
  const cautiousQuestions = getQuestions().filter(q => q.subSection === SubSection.CAUTIOUS);

  // Calculate the maximum possible score for "Trusting" and "Cautious"
  const maxTrustingScore = trustingQuestions.length * 7;
  const maxCautiousScore = cautiousQuestions.length * 7;

  // Calculate the adjusted scores
  const adjustedTrustingScore = maxTrustingScore - trustingScore;
  const adjustedCautiousScore = maxCautiousScore - cautiousScore;

  return adjustedTrustingScore + adjustedCautiousScore;
}

/**
 * Calculates the Driver score based on the provided responses.
 * @param {Response[]} responses - An array of responses to assessment questions.
 * @returns {number} The calculated Driver score.
 */
export function calculateDriverScore(responses: Response[] | AssessmentResponse[]): number {
  // Convert to simple Response format
  const simpleResponses = responses.map(r => ({
    questionId: r.questionId,
    score: r.score
  }));

  const hustleScore = calculateSubSectionScore(simpleResponses, SubSection.HUSTLE);
  const preciseScore = calculateSubSectionScore(simpleResponses, SubSection.PRECISE);

  // Get all questions for the "Hustle" and "Precise" sub-sections
  const hustleQuestions = getQuestions().filter(q => q.subSection === SubSection.HUSTLE);
  const preciseQuestions = getQuestions().filter(q => q.subSection === SubSection.PRECISE);

  // Calculate the maximum possible score for "Hustle" and "Precise"
  const maxHustleScore = hustleQuestions.length * 7;
  const maxPreciseScore = preciseQuestions.length * 7;

  // Calculate the adjusted scores
  const adjustedHustleScore = maxHustleScore - hustleScore;
  const adjustedPreciseScore = maxPreciseScore - preciseScore;

  return adjustedHustleScore + adjustedPreciseScore;
}

/**
 * Calculates the Adaptability score based on the provided responses.
 * @param {Response[]} responses - An array of responses to assessment questions.
 * @returns {number} The calculated Adaptability score.
 */
export function calculateAdaptabilityScore(responses: Response[] | AssessmentResponse[]): number {
  // Convert to simple Response format
  const simpleResponses = responses.map(r => ({
    questionId: r.questionId,
    score: r.score
  }));

  const flexibleScore = calculateSubSectionScore(simpleResponses, SubSection.FLEXIBLE);
  const reservedScore = calculateSubSectionScore(simpleResponses, SubSection.RESERVED);

  // Get all questions for the "Flexible" and "Reserved" sub-sections
  const flexibleQuestions = getQuestions().filter(q => q.subSection === SubSection.FLEXIBLE);
  const reservedQuestions = getQuestions().filter(q => q.subSection === SubSection.RESERVED);

  // Calculate the maximum possible score for "Flexible" and "Reserved"
  const maxFlexibleScore = flexibleQuestions.length * 7;
  const maxReservedScore = reservedQuestions.length * 7;

  // Calculate the adjusted scores
  const adjustedFlexibleScore = maxFlexibleScore - flexibleScore;
  const adjustedReservedScore = maxReservedScore - reservedScore;

  return adjustedFlexibleScore + adjustedReservedScore;
}

/**
 * Calculates the Problem Resolution score based on the provided responses.
 * @param {Response[]} responses - An array of responses to assessment questions.
 * @returns {number} The calculated Problem Resolution score.
 */
export function calculateProblemResolutionScore(responses: Response[] | AssessmentResponse[]): number {
  // Convert to simple Response format
  const simpleResponses = responses.map(r => ({
    questionId: r.questionId,
    score: r.score
  }));

  const directScore = calculateSubSectionScore(simpleResponses, SubSection.DIRECT);
  const avoidantScore = calculateSubSectionScore(simpleResponses, SubSection.AVOIDANT);

  // Get all questions for the "Direct" and "Avoidant" sub-sections
  const directQuestions = getQuestions().filter(q => q.subSection === SubSection.DIRECT);
  const avoidantQuestions = getQuestions().filter(q => q.subSection === SubSection.AVOIDANT);

  // Calculate the maximum possible score for "Direct" and "Avoidant"
  const maxDirectScore = directQuestions.length * 7;
  const maxAvoidantScore = avoidantQuestions.length * 7;

  // Calculate the adjusted scores
  const adjustedDirectScore = maxDirectScore - directScore;
  const adjustedAvoidantScore = maxAvoidantScore - avoidantScore;

  return adjustedDirectScore + adjustedAvoidantScore;
}

/**
 * Calculates the Coachability score based on the provided responses.
 * @param {Response[]} responses - An array of responses to assessment questions.
 * @returns {number} The calculated Coachability score.
 */
export function calculateCoachabilityScore(responses: Response[] | AssessmentResponse[]): number {
  // Convert to simple Response format
  const simpleResponses = responses.map(r => ({
    questionId: r.questionId,
    score: r.score
  }));

  return calculateSubSectionScore(simpleResponses, SubSection.COACHABILITY);
}

/**
 * Calculates the Direct score based on the provided responses.
 * @param {Response[]} responses - An array of responses to assessment questions.
 * @returns {number} The calculated Direct score.
 */
export function calculateDirectScore(responses: Response[] | AssessmentResponse[]): number {
  // Convert to simple Response format
  const simpleResponses = responses.map(r => ({
    questionId: r.questionId,
    score: r.score
  }));

  return calculateSubSectionScore(simpleResponses, SubSection.DIRECT);
}
