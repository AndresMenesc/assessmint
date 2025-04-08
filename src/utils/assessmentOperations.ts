
import { supabase } from "@/integrations/supabase/client";
import { Assessment, AssessmentResponse, Section, SubSection, Question, DbAssessment, DbAssessmentResponse, DbQuestion } from "@/types/assessment";
import { safeQueryData, isQueryError, asParam, safeDataFilter, asDbParam } from "./supabaseHelpers";

// Function to create a new assessment in the database
export const createAssessmentInDb = async (assessment: Assessment): Promise<Assessment> => {
  try {
    const dbAssessment: DbAssessment = {
      id: assessment.id || undefined as any,
      self_rater_email: assessment.selfRaterEmail,
      self_rater_name: assessment.selfRaterName,
      code: assessment.code,
      completed: assessment.completed,
      created_at: assessment.createdAt.toISOString(),
      updated_at: assessment.updatedAt.toISOString()
    };

    const { data, error } = await supabase
      .from('assessments')
      .insert(asDbParam<DbAssessment>(dbAssessment))
      .select()
      .single();

    if (error) {
      console.error("Error creating assessment:", error);
      throw error;
    }

    // Transform database format to app format
    const result = data as any;
    return {
      id: result.id,
      selfRaterEmail: result.self_rater_email,
      selfRaterName: result.self_rater_name,
      code: result.code,
      completed: result.completed,
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
      raters: []
    };
  } catch (error) {
    console.error("Unexpected error creating assessment:", error);
    throw error;
  }
};

// Function to update an existing assessment in the database
export const updateAssessmentInDb = async (assessment: Assessment): Promise<Assessment> => {
  try {
    const dbAssessment = {
      self_rater_email: assessment.selfRaterEmail,
      self_rater_name: assessment.selfRaterName,
      code: assessment.code,
      completed: assessment.completed,
      created_at: assessment.createdAt.toISOString(),
      updated_at: assessment.updatedAt.toISOString()
    };

    const { data, error } = await supabase
      .from('assessments')
      .update(asDbParam(dbAssessment))
      .eq('id', asParam(assessment.id))
      .select()
      .single();

    if (error) {
      console.error("Error updating assessment:", error);
      throw error;
    }

    // Transform database format to app format
    const result = data as any;
    return {
      id: result.id,
      selfRaterEmail: result.self_rater_email,
      selfRaterName: result.self_rater_name,
      code: result.code,
      completed: result.completed,
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
      raters: assessment.raters
    };
  } catch (error) {
    console.error("Unexpected error updating assessment:", error);
    throw error;
  }
};

// Function to save assessment to the database, creates or updates as needed
export const saveAssessmentToDb = async (assessment: Assessment): Promise<Assessment> => {
  try {
    if (assessment.id) {
      // If assessment has an ID, update the existing record
      return await updateAssessmentInDb(assessment);
    } else {
      // If assessment does not have an ID, create a new record
      return await createAssessmentInDb(assessment);
    }
  } catch (error) {
    console.error("Error saving assessment:", error);
    throw error;
  }
};

// Function to fetch an assessment by code from the database
export const fetchAssessmentByCode = async (code: string): Promise<Assessment | null> => {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('code', asParam(code))
      .single();

    if (error) {
      // If no record is found, the Supabase client returns an error
      console.warn("No assessment found with this code, or an error occurred:", error);
      return null;
    }

    const result = safeQueryData(data);
    if (!result) return null;
    
    return {
      id: result.id,
      selfRaterEmail: result.self_rater_email,
      selfRaterName: result.self_rater_name,
      code: result.code,
      completed: result.completed,
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
      raters: []
    };
  } catch (error) {
    console.error("Unexpected error fetching assessment by code:", error);
    return null;
  }
};

// Function to fetch an assessment by ID from the database
export const fetchAssessmentById = async (id: string): Promise<Assessment | null> => {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', asParam(id))
      .single();

    if (error) {
      // If no record is found, the Supabase client returns an error
      console.warn("No assessment found with this id, or an error occurred:", error);
      return null;
    }

    const result = safeQueryData(data);
    if (!result) return null;
    
    return {
      id: result.id,
      selfRaterEmail: result.self_rater_email,
      selfRaterName: result.self_rater_name,
      code: result.code,
      completed: result.completed,
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
      raters: []
    };
  } catch (error) {
    console.error("Unexpected error fetching assessment by id:", error);
    return null;
  }
};

// Function to create a new assessment response in the database
export const createAssessmentResponseInDb = async (assessmentResponse: AssessmentResponse): Promise<AssessmentResponse> => {
  try {
    const dbResponse = {
      id: assessmentResponse.id || undefined,
      assessment_id: assessmentResponse.assessment_id,
      question_id: assessmentResponse.questionId,
      score: assessmentResponse.score,
      created_at: assessmentResponse.created_at || new Date().toISOString(),
      updated_at: assessmentResponse.updated_at || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('assessment_responses')
      .insert(asDbParam(dbResponse))
      .select()
      .single();

    if (error) {
      console.error("Error creating assessment response:", error);
      throw error;
    }

    const result = data as any;
    return {
      id: result.id,
      assessment_id: result.assessment_id,
      questionId: result.question_id,
      score: result.score,
      created_at: result.created_at,
      updated_at: result.updated_at
    };
  } catch (error) {
    console.error("Unexpected error creating assessment response:", error);
    throw error;
  }
};

// Function to update an existing assessment response in the database
export const updateAssessmentResponseInDb = async (assessmentResponse: AssessmentResponse): Promise<AssessmentResponse> => {
  try {
    const dbResponse = {
      assessment_id: assessmentResponse.assessment_id,
      question_id: assessmentResponse.questionId,
      score: assessmentResponse.score,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('assessment_responses')
      .update(asDbParam(dbResponse))
      .eq('id', asParam(assessmentResponse.id))
      .select()
      .single();

    if (error) {
      console.error("Error updating assessment response:", error);
      throw error;
    }

    const result = data as any;
    return {
      id: result.id,
      assessment_id: result.assessment_id,
      questionId: result.question_id,
      score: result.score,
      created_at: result.created_at,
      updated_at: result.updated_at
    };
  } catch (error) {
    console.error("Unexpected error updating assessment response:", error);
    throw error;
  }
};

// Function to save assessment response to the database, creates or updates as needed
export const saveAssessmentResponseToDb = async (assessmentResponse: AssessmentResponse): Promise<AssessmentResponse> => {
  try {
    if (assessmentResponse.id) {
      // If assessment response has an ID, update the existing record
      return await updateAssessmentResponseInDb(assessmentResponse);
    } else {
      // If assessment response does not have an ID, create a new record
      return await createAssessmentResponseInDb(assessmentResponse);
    }
  } catch (error) {
    console.error("Error saving assessment response:", error);
    throw error;
  }
};

// Function to fetch assessment responses by assessment ID from the database
export const fetchAssessmentResponsesByAssessmentId = async (assessmentId: string): Promise<AssessmentResponse[]> => {
  try {
    const { data: assessmentResponses, error } = await supabase
      .from("assessment_responses")
      .select("*")
      .eq('assessment_id', asParam(assessmentId));

    if (error) {
      console.error("Error fetching assessment responses:", error);
      return [];
    }

    return safeDataFilter(assessmentResponses).map(ar => {
      const result = ar as any;
      return {
        id: result.id,
        assessment_id: result.assessment_id,
        questionId: result.question_id,
        score: result.score,
        created_at: result.created_at,
        updated_at: result.updated_at
      };
    });
  } catch (error) {
    console.error("Unexpected error fetching assessment responses:", error);
    return [];
  }
};

// Function to fetch an assessment response by ID from the database
export const fetchAssessmentResponseById = async (id: string): Promise<AssessmentResponse | null> => {
  try {
    const { data, error } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('id', asParam(id))
      .single();

    if (error) {
      // If no record is found, the Supabase client returns an error
      console.warn("No assessment response found with this id, or an error occurred:", error);
      return null;
    }

    const result = safeQueryData(data);
    if (!result) return null;
    
    return {
      id: result.id,
      assessment_id: result.assessment_id,
      questionId: result.question_id,
      score: result.score,
      created_at: result.created_at,
      updated_at: result.updated_at
    };
  } catch (error) {
    console.error("Unexpected error fetching assessment response by id:", error);
    return null;
  }
};

// Function to synchronize assessment with the database
export const syncAssessmentWithDb = async (assessment: Assessment): Promise<Assessment> => {
  try {
    // Check if assessment already exists
    const existingAssessment = await fetchAssessmentByCode(assessment.code);

    // When existing assessment found
    if (existingAssessment) {
      // Update the assessment with the existing ID to maintain data integrity
      assessment.id = existingAssessment.id;
      
      const updatedAssessment = await saveAssessmentToDb({
        ...assessment,
        id: existingAssessment.id
      });
      
      return { ...updatedAssessment };
    } 
    // When no existing assessment
    else {
      // Create a new assessment
      const newAssessment = await createAssessmentInDb(assessment);
      return { ...newAssessment };
    }
  } catch (error) {
    console.error("Error synchronizing assessment with database:", error);
    throw error;
  }
};

//
// Export additional assessment operations functions
//

// Initialize a new assessment
export const initializeAssessment = async (email: string, name: string, code: string): Promise<Assessment> => {
  const assessment: Assessment = {
    id: '', // will be set by the database
    selfRaterEmail: email,
    selfRaterName: name,
    code: code,
    raters: [],
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  return await syncAssessmentWithDb(assessment);
};

// Initialize a rater assessment
export const initializeRaterAssessment = async (email: string, name: string, code: string) => {
  const assessment = await fetchAssessmentByCode(code);
  if (!assessment) {
    throw new Error("Assessment not found");
  }
  return { assessment };
};

// Add a new rater to an assessment
export const addRater = (assessment: Assessment, email: string, name: string, raterType: string) => {
  const updatedAssessment = {
    ...assessment,
    raters: [
      ...assessment.raters,
      {
        raterType,
        email,
        name,
        responses: [],
        completed: false
      }
    ]
  };
  
  return updatedAssessment;
};

// Update a response in the assessment
export const updateResponse = (assessment: Assessment, raterType: string, questionId: string, score: number) => {
  const updatedAssessment = {
    ...assessment,
    raters: assessment.raters.map(r => {
      if (r.raterType === raterType) {
        const existingResponseIndex = r.responses.findIndex(resp => resp.questionId === questionId);
        if (existingResponseIndex >= 0) {
          const updatedResponses = [...r.responses];
          updatedResponses[existingResponseIndex] = {
            ...updatedResponses[existingResponseIndex],
            score: score
          };
          return {...r, responses: updatedResponses};
        } else {
          return {...r, responses: [...r.responses, { questionId, score }]};
        }
      }
      return r;
    })
  };
  
  return { updatedAssessment };
};

// Complete an assessment for a rater
export const completeAssessment = (assessment: Assessment, raterType: string) => {
  const updatedAssessment = {
    ...assessment,
    raters: assessment.raters.map(r => {
      if (r.raterType === raterType) {
        return { ...r, completed: true };
      }
      return r;
    })
  };
  
  return updatedAssessment;
};

// Fetch questions from the database
export const fetchQuestions = async (): Promise<Question[]> => {
  try {
    const { data: questionsData, error } = await supabase
      .from('questions')
      .select('*');
      
    if (error) {
      console.error("Error fetching questions:", error);
      return [];
    }
    
    return safeDataFilter(questionsData).map(q => {
      const question = q as DbQuestion;
      return {
        id: question.id,
        text: question.text,
        section: question.section as Section,
        subSection: question.sub_section as SubSection,
        isReversed: question.is_reversed,
        negativeScore: question.negative_score
      };
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
};

// Export all the functions so they can be imported
export {
  // All functions are already exported above
};
