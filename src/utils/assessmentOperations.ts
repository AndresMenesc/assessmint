import { Assessment, RaterType, Question, AssessmentResponse, RaterResponses } from "@/types/assessment";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchAssessmentByCode,
  createAssessmentInDb,
  syncAssessmentWithDb
} from "@/utils/assessmentDbUtils";
import { toast } from "sonner";
import { safeQueryData, isQueryError, safeDataFilter, asParam } from "./supabaseHelpers";

/**
 * Fetch questions from the database
 */
export const fetchQuestions = async (): Promise<Question[]> => {
  const { data, error } = await supabase.from('questions').select('*');
  
  if (error) {
    console.error("Error fetching questions:", error);
    throw new Error("Failed to load questions");
  }
  
  // Filter out any error responses and convert to Question type
  return safeDataFilter(data).map(q => ({
    id: q.id,
    text: q.text,
    section: q.section as any,
    subSection: q.sub_section as any,
    isReversed: q.is_reversed,
    negativeScore: q.negative_score
  }));
};

/**
 * Initialize an assessment for the self-rater
 */
export const initializeAssessment = async (
  email: string,
  name: string,
  code: string
): Promise<Assessment | null> => {
  try {
    // Check if an assessment with this code already exists
    const existingAssessment = await fetchAssessmentByCode(code);
    
    if (existingAssessment) {
      // Assessment with this code exists
      console.log("Assessment with this code found:", existingAssessment);
      return existingAssessment;
    }
    
    // Create a new assessment
    console.log("Creating new assessment with code:", code);
    const now = new Date();
    const assessmentId = uuidv4();
    
    const newAssessment: Assessment = {
      id: assessmentId,
      selfRaterEmail: email,
      selfRaterName: name,
      code,
      completed: false,
      createdAt: now,
      updatedAt: now,
      raters: [
        {
          raterType: RaterType.SELF,
          email,
          name,
          completed: false,
          responses: []
        }
      ]
    };
    
    // Save to the database
    const saved = await createAssessmentInDb(newAssessment);
    
    if (!saved) {
      throw new Error("Failed to create assessment");
    }
    
    return newAssessment;
  } catch (error) {
    console.error("Error initializing assessment:", error);
    toast.error("Error initializing assessment");
    throw error;
  }
};

/**
 * Initializes a rater assessment for someone rating another person
 */
export const initializeRaterAssessment = async (
  raterEmail: string, 
  raterName: string, 
  code: string
): Promise<{ assessment: Assessment; raterType: RaterType } | null> => {
  try {
    // Check if an assessment with this code exists
    const assessmentData = await fetchAssessmentByCode(code);
    
    if (!assessmentData) {
      toast.error("Invalid assessment code. No assessment found with this code.");
      throw new Error("Invalid assessment code");
    }
    
    // Check if this rater has already completed an assessment for this code
    const existingRater = assessmentData.raters.find(r => 
      r.email.toLowerCase() === raterEmail.toLowerCase() && r.raterType !== RaterType.SELF
    );
    
    if (existingRater) {
      if (existingRater.completed) {
        toast.error("You have already submitted an assessment for this person.", {
          description: "You cannot submit multiple assessments for the same person."
        });
        throw new Error("Rater already completed assessment");
      } else {
        // Rater exists but didn't complete their assessment
        return { assessment: assessmentData, raterType: existingRater.raterType };
      }
    }
    
    // Determine rater type
    let raterType: RaterType;
    const hasRater1 = assessmentData.raters.some(r => r.raterType === RaterType.RATER1);
    const hasRater2 = assessmentData.raters.some(r => r.raterType === RaterType.RATER2);
    
    if (!hasRater1) {
      // If no rater1 exists, assign as rater1
      raterType = RaterType.RATER1;
    } else if (!hasRater2) {
      // If rater1 exists but no rater2, assign as rater2
      raterType = RaterType.RATER2;
    } else {
      // Both rater types already exist
      toast.error("This assessment already has the maximum number of raters.", {
        description: "No more raters can be added to this assessment."
      });
      throw new Error("Assessment full");
    }
    
    // Add the new rater
    const updatedRaters = [
      ...assessmentData.raters,
      {
        raterType,
        responses: [],
        completed: false,
        email: raterEmail,
        name: raterName
      }
    ];
    
    const updatedAssessment = {
      ...assessmentData,
      raters: updatedRaters,
      updatedAt: new Date()
    };
    
    // Update in database
    const success = await updateAssessmentInDb(assessmentData.id, {
      raters: updatedRaters,
      updatedAt: updatedAssessment.updatedAt
    });
    
    if (!success) {
      throw new Error("Failed to update assessment in database");
    }
    
    return { assessment: updatedAssessment, raterType };
  } catch (error) {
    console.error("Error initializing rater assessment:", error);
    throw error;
  }
};

/**
 * Adds a rater to an existing assessment
 */
export const addRater = (
  assessment: Assessment,
  email: string,
  name: string,
  raterType: RaterType
): Assessment | null => {
  if (assessment.raters.some(r => r.raterType === raterType)) {
    toast.error("This rater type already exists in the assessment.");
    return null;
  }
  
  const updatedRaters = [
    ...assessment.raters,
    {
      raterType,
      responses: [],
      completed: false,
      email,
      name
    }
  ];
  
  const updatedAssessment = {
    ...assessment,
    raters: updatedRaters,
    updatedAt: new Date()
  };
  
  syncAssessmentWithDb(updatedAssessment);
  
  toast.success(`${name} (${email}) has been added as a rater.`);
  
  return updatedAssessment;
};

/**
 * Updates a response for a question in an assessment
 */
export const updateResponse = (
  assessment: Assessment,
  currentRater: RaterType,
  questionId: string,
  score: number,
  currentResponses: AssessmentResponse[]
): { updatedAssessment: Assessment; updatedResponses: AssessmentResponse[] } | null => {
  if (!assessment) return null;
  
  const existingResponseIndex = currentResponses.findIndex(r => r.questionId === questionId);
  let updatedResponses = [...currentResponses];
  
  if (existingResponseIndex !== -1) {
    updatedResponses[existingResponseIndex] = {
      ...updatedResponses[existingResponseIndex],
      score
    };
  } else {
    updatedResponses.push({
      questionId,
      score
    });
  }
  
  const raterIndex = assessment.raters.findIndex(r => r.raterType === currentRater);
  if (raterIndex !== -1) {
    const updatedRaters = [...assessment.raters];
    updatedRaters[raterIndex] = {
      ...updatedRaters[raterIndex],
      responses: updatedResponses
    };
    
    const updatedAssessment = {
      ...assessment,
      raters: updatedRaters,
      updatedAt: new Date()
    };
    
    syncAssessmentWithDb(updatedAssessment);
    
    return { updatedAssessment, updatedResponses };
  }
  
  return null;
};

/**
 * Marks the current rater's assessment as completed
 */
export const completeAssessment = (
  assessment: Assessment,
  currentRater: RaterType
): Assessment | null => {
  if (!assessment) return null;
  
  const raterIndex = assessment.raters.findIndex(r => r.raterType === currentRater);
  if (raterIndex !== -1) {
    const updatedRaters = [...assessment.raters];
    updatedRaters[raterIndex] = {
      ...updatedRaters[raterIndex],
      completed: true
    };
    
    const selfCompleted = updatedRaters.find(r => r.raterType === RaterType.SELF)?.completed || false;
    const rater1Exists = updatedRaters.some(r => r.raterType === RaterType.RATER1);
    const rater2Exists = updatedRaters.some(r => r.raterType === RaterType.RATER2);
    const rater1Completed = updatedRaters.find(r => r.raterType === RaterType.RATER1)?.completed || false;
    const rater2Completed = updatedRaters.find(r => r.raterType === RaterType.RATER2)?.completed || false;
    
    const allRatersAdded = rater1Exists && rater2Exists;
    const allRatersCompleted = selfCompleted && 
      (rater1Exists ? rater1Completed : true) && 
      (rater2Exists ? rater2Completed : true);
    
    const allCompleted = allRatersAdded && allRatersCompleted;
    
    const updatedAssessment = {
      ...assessment,
      raters: updatedRaters,
      completed: allCompleted,
      updatedAt: new Date()
    };
    
    // Save to database
    syncAssessmentWithDb(updatedAssessment)
      .then(success => {
        if (success && allCompleted) {
          // If all raters have completed, save the results
          import('./assessmentDbUtils').then(dbUtils => {
            dbUtils.saveAssessmentResults(updatedAssessment)
              .then(resultSaved => {
                if (resultSaved) {
                  console.log("Assessment results saved successfully");
                } else {
                  console.error("Failed to save assessment results");
                }
              });
          });
        }
      })
      .catch(error => {
        console.error("Error syncing assessment:", error);
      });
    
    if (currentRater === RaterType.SELF) {
      toast.success("Self-Assessment Completed", {
        description: "Thank you for completing your self-assessment. Your results will be available once all raters have completed their assessments."
      });
    } else {
      toast.success("Assessment Completed", {
        description: "Thank you for your assessment. The results will be available to the person you rated once all assessments are complete."
      });
    }
    
    return updatedAssessment;
  }
  
  return null;
};
