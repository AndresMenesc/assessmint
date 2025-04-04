
import React, { createContext, useContext, useState, useEffect } from "react";
import { Assessment, RaterType, Question, AssessmentResponse } from "@/types/assessment";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchAssessmentByCode, 
  createAssessmentInDb, 
  syncAssessmentWithDb,
  saveAssessmentResults
} from "@/utils/assessmentDbUtils";
import {
  initializeAssessment as initAssessment,
  initializeRaterAssessment as initRaterAssessment,
  addRater as addNewRater,
  updateResponse as updateRaterResponse,
  completeAssessment as completeRaterAssessment,
  fetchQuestions
} from "@/utils/assessmentOperations";

// Import the real calculation functions
import { calculateAllResults as calculateResults } from "@/utils/calculateAllResults";

// Define the context type
interface AssessmentContextProps {
  assessment: Assessment | null;
  setAssessment: (assessment: Assessment | null) => void;
  questions: Question[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  currentRater: RaterType;
  setCurrentRater: (rater: RaterType) => void;
  responses: AssessmentResponse[];
  updateResponse: (questionId: string, score: number) => void;
  loading: boolean;
  initializeAssessment: (email: string, name: string, code: string) => Promise<void>;
  initializeRaterAssessment: (email: string, name: string, code: string) => Promise<void>;
  completeAssessment: () => Promise<void>;
  addRater: (email: string, name: string, raterType: RaterType) => void;
  resetAssessment: () => void;
  getResults: (assessmentToUse?: Assessment) => any;
}

// Create context with a default value
const AssessmentContext = createContext<AssessmentContextProps | undefined>(undefined);

// Custom hook to use the assessment context
export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
};

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentRater, setCurrentRater] = useState<RaterType>(RaterType.SELF);
  const [loading, setLoading] = useState<boolean>(false);
  const { userEmail, userName } = useAuth();
  
  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const fetchedQuestions = await fetchQuestions();
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error("Error loading questions:", error);
        toast.error("Error loading questions");
      }
    };
    
    loadQuestions();
  }, []);
  
  // Initialize a new assessment or load existing
  const initializeAssessment = async (email: string, name: string, code: string): Promise<void> => {
    setLoading(true);
    try {
      console.log(`Initializing assessment with email: ${email}, name: ${name}, code: ${code}`);
      const initializedAssessment = await initAssessment(email, name, code);
      
      if (initializedAssessment) {
        console.log("Assessment initialized successfully:", initializedAssessment);
        console.log("Assessment ID:", initializedAssessment.id);
        console.log("Raters:", JSON.stringify(initializedAssessment.raters));
        
        setAssessment(initializedAssessment);
        setCurrentRater(RaterType.SELF);
        
        // Verify that the assessment was saved in the database
        try {
          const { data, error } = await supabase
            .from('assessment_responses')
            .select('*')
            .eq('assessment_id', initializedAssessment.id);
            
          console.log("Assessment responses in DB:", data, "Error:", error);
        } catch (dbError) {
          console.error("Error checking assessment responses:", dbError);
        }
      }
    } catch (error) {
      console.error("Error initializing assessment:", error);
      if (error instanceof Error) {
        // No need to display toast here, the initAssessment function already does it
      } else {
        toast.error("Error initializing assessment");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Initialize as a rater for someone else's assessment
  const initializeRaterAssessment = async (email: string, name: string, code: string): Promise<void> => {
    setLoading(true);
    try {
      console.log(`Initializing rater assessment with email: ${email}, name: ${name}, code: ${code}`);
      const result = await initRaterAssessment(email, name, code);
      
      if (result) {
        console.log("Rater assessment initialized successfully:", result);
        setAssessment(result.assessment);
        setCurrentRater(result.raterType);
      }
    } catch (error) {
      console.error("Error initializing rater assessment:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error initializing rater assessment");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Add a rater to the assessment (by self-rater)
  const addRater = (email: string, name: string, raterType: RaterType) => {
    if (!assessment) return;
    
    console.log(`Adding rater: ${email}, ${name}, ${raterType} to assessment ${assessment.id}`);
    const updatedAssessment = addNewRater(assessment, email, name, raterType);
    
    if (updatedAssessment) {
      console.log("Rater added successfully, updated assessment:", updatedAssessment);
      setAssessment(updatedAssessment);
    }
  };
  
  // Update response for current question
  const updateResponse = (questionId: string, score: number) => {
    if (!assessment) return;
    
    const currentRaterResponses = assessment.raters.find(r => r.raterType === currentRater)?.responses || [];
    console.log(`Updating response for question ${questionId} with score ${score}, rater: ${currentRater}`);
    
    const result = updateRaterResponse(assessment, currentRater, questionId, score, currentRaterResponses);
    if (result) {
      console.log("Response updated successfully");
      setAssessment(result.updatedAssessment);
    }
  };
  
  // Mark current rater's assessment as complete
  const completeAssessment = async (): Promise<void> => {
    if (!assessment) return;
    
    console.log(`Completing assessment for rater: ${currentRater}, assessment ID: ${assessment.id}`);
    const updatedAssessment = completeRaterAssessment(assessment, currentRater);
    
    if (updatedAssessment) {
      console.log("Assessment completed successfully");
      setAssessment(updatedAssessment);
      
      // If all raters have completed, save the final results
      const allRatersCompleted = updatedAssessment.raters.every(r => r.completed);
      if (allRatersCompleted) {
        console.log("All raters completed, saving final results");
        await saveAssessmentResults(updatedAssessment);
      }
    }
  };
  
  // Reset the assessment
  const resetAssessment = () => {
    setAssessment(null);
    setCurrentQuestionIndex(0);
    setCurrentRater(RaterType.SELF);
  };
  
  // Get the responses for the current rater
  const responses = assessment?.raters.find(r => r.raterType === currentRater)?.responses || [];
  
  // Calculate and return results using the real calculation function
  const getResults = (assessmentToUse?: Assessment) => {
    const targetAssessment = assessmentToUse || assessment;
    
    if (!targetAssessment) {
      console.log("No assessment provided to getResults");
      return {
        dimensionScores: [],
        selfAwareness: 0,
        coachabilityAwareness: 0,
        profileType: ""
      };
    }
    
    console.log("Calculating results for assessment:", targetAssessment);
    
    try {
      if (!targetAssessment.raters || targetAssessment.raters.length === 0) {
        console.log("Assessment has no raters:", targetAssessment);
        return {
          dimensionScores: [],
          selfAwareness: 0,
          coachabilityAwareness: 0,
          profileType: ""
        };
      }
      
      // Check if raters have responses
      let hasResponses = false;
      targetAssessment.raters.forEach(rater => {
        if (rater.responses && rater.responses.length > 0) {
          hasResponses = true;
        }
      });
      
      if (!hasResponses) {
        console.log("No responses found in assessment:", targetAssessment);
        return {
          dimensionScores: [],
          selfAwareness: 0,
          coachabilityAwareness: 0,
          profileType: ""
        };
      }
      
      // Use the real calculation function
      const results = calculateResults(targetAssessment.raters);
      
      if (!results) {
        console.log("No results calculated for assessment:", targetAssessment);
        return {
          dimensionScores: [],
          selfAwareness: 0,
          coachabilityAwareness: 0,
          profileType: ""
        };
      }
      
      return results;
    } catch (error) {
      console.error("Error calculating results:", error);
      return {
        dimensionScores: [],
        selfAwareness: 0, 
        coachabilityAwareness: 0,
        profileType: ""
      };
    }
  };
  
  return (
    <AssessmentContext.Provider value={{
      assessment,
      setAssessment,
      questions,
      currentQuestionIndex,
      setCurrentQuestionIndex,
      currentRater,
      setCurrentRater,
      responses,
      updateResponse,
      loading,
      initializeAssessment,
      initializeRaterAssessment,
      completeAssessment,
      addRater,
      resetAssessment,
      getResults
    }}>
      {children}
    </AssessmentContext.Provider>
  );
};
