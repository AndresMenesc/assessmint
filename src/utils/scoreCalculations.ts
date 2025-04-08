// Fix imports
import { questions } from "../data/questions";
import { AssessmentResponse } from "@/types/assessment";

export function calculateDimensionScores(
  selfResponses: AssessmentResponse[], 
  rater1Responses: AssessmentResponse[], 
  rater2Responses: AssessmentResponse[],
  dimension: string
) {
  const selfDimensionResponses = selfResponses.filter(response => {
    const question = questions.find(q => q.id === response.questionId);
    return question && question.section === dimension;
  });

  const rater1DimensionResponses = rater1Responses.filter(response => {
    const question = questions.find(q => q.id === response.questionId);
    return question && question.section === dimension;
  });

  const rater2DimensionResponses = rater2Responses.filter(response => {
    const question = questions.find(q => q.id === response.questionId);
    return question && question.section === dimension;
  });

  const selfTotal = selfDimensionResponses.reduce((sum, response) => sum + response.score, 0);
  const rater1Total = rater1DimensionResponses.reduce((sum, response) => sum + response.score, 0);
  const rater2Total = rater2DimensionResponses.reduce((sum, response) => sum + response.score, 0);

  const selfCount = selfDimensionResponses.length;
  const rater1Count = rater1DimensionResponses.length;
  const rater2Count = rater2DimensionResponses.length;

  let average = 0;

  if (selfCount > 0 || rater1Count > 0 || rater2Count > 0) {
    const totalScore = selfTotal + rater1Total + rater2Total;
    const totalCount = selfCount + rater1Count + rater2Count;
    average = totalScore / totalCount;
  }

  return average;
}

export function calculateSelfAwarenessScore(
  selfResponses: AssessmentResponse[],
  rater1Responses: AssessmentResponse[],
  rater2Responses: AssessmentResponse[]
) {
  const selfAwarenessQuestions = questions.filter(question => question.subSection === "COACHABILITY");

  const selfResponsesFiltered = selfResponses.filter(response =>
    selfAwarenessQuestions.some(question => question.id === response.questionId)
  );

  const rater1ResponsesFiltered = rater1Responses.filter(response =>
    selfAwarenessQuestions.some(question => question.id === response.questionId)
  );

  const rater2ResponsesFiltered = rater2Responses.filter(response =>
    selfAwarenessQuestions.some(question => question.id === response.questionId)
  );

  const selfTotal = selfResponsesFiltered.reduce((sum, response) => sum + response.score, 0);
  const rater1Total = rater1ResponsesFiltered.reduce((sum, response) => sum + response.score, 0);
  const rater2Total = rater2ResponsesFiltered.reduce((sum, response) => sum + response.score, 0);

  const selfCount = selfResponsesFiltered.length;
  const rater1Count = rater1ResponsesFiltered.length;
  const rater2Count = rater2ResponsesFiltered.length;

  let average = 0;

  if (selfCount > 0 || rater1Count > 0 || rater2Count > 0) {
    const totalScore = selfTotal + rater1Total + rater2Total;
    const totalCount = selfCount + rater1Count + rater2Count;
    average = totalScore / totalCount;
  }

  return average;
}

export function calculateCoachabilityScore(
  selfResponses: AssessmentResponse[],
  rater1Responses: AssessmentResponse[],
  rater2Responses: AssessmentResponse[]
) {
  const coachabilityQuestions = questions.filter(question => question.subSection === "COACHABILITY");

  const selfResponsesFiltered = selfResponses.filter(response =>
    coachabilityQuestions.some(question => question.id === response.questionId)
  );

  const rater1ResponsesFiltered = rater1Responses.filter(response =>
    coachabilityQuestions.some(question => question.id === response.questionId)
  );

  const rater2ResponsesFiltered = rater2Responses.filter(response =>
    coachabilityQuestions.some(question => question.id === response.questionId)
  );

  const selfTotal = selfResponsesFiltered.reduce((sum, response) => sum + response.score, 0);
  const rater1Total = rater1ResponsesFiltered.reduce((sum, response) => sum + response.score, 0);
  const rater2Total = rater2ResponsesFiltered.reduce((sum, response) => sum + response.score, 0);

  const selfCount = selfResponsesFiltered.length;
  const rater1Count = rater1ResponsesFiltered.length;
  const rater2Count = rater2ResponsesFiltered.length;

  let average = 0;

  if (selfCount > 0 || rater1Count > 0 || rater2Count > 0) {
    const totalScore = selfTotal + rater1Total + rater2Total;
    const totalCount = selfCount + rater1Count + rater2Count;
    average = totalScore / totalCount;
  }

  return average;
}
