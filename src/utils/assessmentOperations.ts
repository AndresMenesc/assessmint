
import { v4 as uuidv4 } from "uuid";
import { Assessment, RaterResponses, RaterType, AssessmentResponse, Question, Section, SubSection } from "@/types/assessment";
import { toast } from "sonner";
import { createAssessmentInDb, fetchAssessmentByCode, syncAssessmentWithDb, updateAssessmentInDb } from "./assessmentDbUtils";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches all questions from the database
 */
export const fetchQuestions = async (): Promise<Question[]> => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('id');
      
    if (error) {
      console.error("Error fetching questions:", error);
      throw error;
    }
    
    // Map database questions to our Question type with proper enum conversion
    return data.map(q => ({
      id: q.id,
      text: q.text,
      section: q.section as Section, // Cast the string to Section enum
      subSection: q.sub_section as SubSection, // Cast the string to SubSection enum
      isReversed: q.is_reversed,
      negativeScore: q.negative_score
    }));
  } catch (error) {
    console.error("Error in fetchQuestions:", error);
    throw error;
  }
};

/**
 * Initializes a new assessment for the self-rater
 */
export const initializeAssessment = async (
  selfEmail: string, 
  selfName: string, 
  code: string
): Promise<Assessment | null> => {
  try {
    console.log("Initializing assessment for:", selfEmail, selfName, "with code:", code);
    
    // Check if an assessment with this code already exists
    const existingAssessment = await fetchAssessmentByCode(code);
    
    if (existingAssessment) {
      // Check if this is the same self-rater
      const selfRater = existingAssessment.raters.find(r => r.raterType === RaterType.SELF);
      
      if (selfRater && selfRater.email.toLowerCase() === selfEmail.toLowerCase()) {
        // This is the same person - allow them to continue their assessment
        console.log("Same user continuing assessment with code:", code);
        
        // Check if self-assessment is already completed
        if (selfRater.completed) {
          toast.info("You have already completed this assessment.", {
            description: "The results will be available once all raters have completed their assessments."
          });
        } else {
          toast.info("Continuing your existing assessment.", {
            description: "Your previous responses have been saved."
          });
        }
        
        return existingAssessment;
      } else {
        // Different person trying to use the same code
        toast.error("This assessment code is already in use by another person.", {
          description: "Please create a new assessment with a different code."
        });
        throw new Error("Code already used by different person");
      }
    } else {
      // Creating new assessment
      const newAssessment: Assessment = {
        id: uuidv4(),
        selfRaterEmail: selfEmail,
        selfRaterName: selfName,
        code: code,
        raters: [
          {
            raterType: RaterType.SELF,
            responses: [],
            completed: false,
            email: selfEmail,
            name: selfName
          }
        ],
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const success = await createAssessmentInDb(newAssessment);
      
      if (!success) {
        throw new Error("Failed to create assessment in database");
      }
      
      return newAssessment;
    }
  } catch (error) {
    console.error("Error initializing assessment:", error);
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
