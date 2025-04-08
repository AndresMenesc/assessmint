
import React, { createContext, useContext, useState, useEffect } from "react";
import { Assessment, RaterType, Question, AssessmentResponse, Response } from "@/types/assessment";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchAssessmentByCode, 
  syncAssessmentWithDb,
  saveAssessmentResults,
} from "@/utils/assessmentDbUtils";
import {
  createAssessment,
  getAssessmentByCode,
  getRaterByEmail,
  getResponsesForRater,
  addRaterToAssessment as addRaterDbOperation,
  getAllQuestions,
} from "@/utils/assessmentOperations";
import { calculateResults } from "@/utils/calculateAllResults";
import { 
  asParam, 
  safeDataFilter, 
  safeQueryData, 
  safeRowAccess, 
  getRowField, 
  safePrepareResponses 
} from "@/utils/supabaseUtils";

interface AssessmentContextProps {
  assessment: Assessment | null;
  setAssessment: (assessment: Assessment | null) => void;
  questions: Question[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  currentRater: RaterType;
  setCurrentRater: (rater: RaterType) => void;
  responses: Response[];
  updateResponse: (questionId: string, score: number) => void;
  loading: boolean;
  initializeAssessment: (email: string, name: string, code: string) => Promise<void>;
  initializeRaterAssessment: (email: string, name: string, code: string) => Promise<void>;
  completeAssessment: () => Promise<void>;
  addRater: (email: string, name: string, raterType: RaterType) => void;
  resetAssessment: () => void;
  getResults: (assessmentToUse?: Assessment) => any;
}

const AssessmentContext = createContext<AssessmentContextProps | undefined>(undefined);

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
  
  const auth = useAuth();
  const userEmail = auth?.userEmail;
  const userName = auth?.userName;
  
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const fetchedQuestions = await getAllQuestions();
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error("Error loading questions:", error);
        toast.error("Error loading questions");
      }
    };
    
    loadQuestions();
  }, []);
  
  const initializeAssessmentHandler = async (email: string, name: string, code: string): Promise<void> => {
    setLoading(true);
    try {
      console.log(`Initializing assessment with email: ${email}, name: ${name}, code: ${code}`);
      
      const result = await createAssessment(email, name, code);
      
      if (!result.success || !result.assessmentId) {
        throw new Error("Failed to create assessment");
      }
      
      const initializedAssessment: Assessment = {
        id: result.assessmentId,
        selfRaterEmail: email,
        selfRaterName: name,
        code,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        raters: [
          {
            raterType: RaterType.SELF,
            email: email,
            name: name,
            responses: [],
            completed: false
          }
        ]
      };
      
      setAssessment(initializedAssessment);
      setCurrentRater(RaterType.SELF);
      
      try {
        const { data, error } = await supabase
          .from('assessment_responses')
          .select('*')
          .eq('assessment_id', asParam(initializedAssessment.id));
          
        console.log("Assessment responses in DB:", data, "Error:", error);
      } catch (dbError) {
        console.error("Error checking assessment responses:", dbError);
      }
    } catch (error) {
      console.error("Error initializing assessment:", error);
      if (error instanceof Error) {
        toast.error("Error initializing assessment");
      } else {
        toast.error("Error initializing assessment");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const initializeRaterAssessmentHandler = async (email: string, name: string, code: string): Promise<void> => {
    setLoading(true);
    try {
      console.log(`Initializing rater assessment with email: ${email}, name: ${name}, code: ${code}`);
      
      const assessmentData = await getAssessmentByCode(code);
      
      if (!assessmentData) {
        throw new Error("Assessment not found");
      }
      
      const rater = await getRaterByEmail(assessmentData.id, email);
      if (rater && rater.completed) {
        throw new Error("Assessment already completed");
      }
      
      const raterType = rater ? rater.rater_type as RaterType : 
                       email === assessmentData.self_rater_email ? RaterType.SELF : RaterType.RATER1;
      
      if (!rater) {
        await addRaterDbOperation(assessmentData.id, email, name, raterType);
      }
      
      const responses = rater ? await getResponsesForRater(rater.id) : [];
      
      const raterAssessment: Assessment = {
        id: assessmentData.id,
        selfRaterEmail: assessmentData.self_rater_email,
        selfRaterName: assessmentData.self_rater_name,
        code: assessmentData.code,
        completed: assessmentData.completed,
        createdAt: new Date(assessmentData.created_at),
        updatedAt: new Date(assessmentData.updated_at),
        raters: [
          {
            raterType,
            email,
            name,
            responses,
            completed: rater ? rater.completed : false
          }
        ]
      };
      
      setAssessment(raterAssessment);
      setCurrentRater(raterType);
      
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
  
  const addRaterHandler = (email: string, name: string, raterType: RaterType) => {
    if (!assessment) return;
    
    console.log(`Adding rater: ${email}, ${name}, ${raterType} to assessment ${assessment.id}`);
    
    const existingRaterIndex = assessment.raters.findIndex(r => r.raterType === raterType);
    
    if (existingRaterIndex >= 0) {
      const updatedRaters = [...assessment.raters];
      updatedRaters[existingRaterIndex] = {
        ...updatedRaters[existingRaterIndex],
        email,
        name
      };
      
      setAssessment({
        ...assessment,
        raters: updatedRaters
      });
    } else {
      setAssessment({
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
      });
    }
  };
  
  const updateResponseHandler = (questionId: string, score: number) => {
    if (!assessment) return;
    
    const currentRaterResponses = assessment.raters.find(r => r.raterType === currentRater)?.responses || [];
    console.log(`Updating response for question ${questionId} with score ${score}, rater: ${currentRater}`);
    
    const updatedRaters = assessment.raters.map(rater => {
      if (rater.raterType !== currentRater) {
        return rater;
      }
      
      const existingResponseIndex = rater.responses.findIndex(r => r.questionId === questionId);
      
      if (existingResponseIndex >= 0) {
        const updatedResponses = [...rater.responses];
        updatedResponses[existingResponseIndex] = {
          ...updatedResponses[existingResponseIndex],
          score
        };
        
        return {
          ...rater,
          responses: updatedResponses
        };
      } else {
        return {
          ...rater,
          responses: [
            ...rater.responses,
            {
              questionId,
              score
            }
          ]
        };
      }
    });
    
    setAssessment({
      ...assessment,
      raters: updatedRaters
    });
  };
  
  const completeAssessmentHandler = async (): Promise<void> => {
    if (!assessment) return;
    
    console.log(`Completing assessment for rater: ${currentRater}, assessment ID: ${assessment.id}`);
    
    const updatedRaters = assessment.raters.map(rater => {
      if (rater.raterType === currentRater) {
        return {
          ...rater,
          completed: true
        };
      }
      return rater;
    });
    
    const allCompleted = updatedRaters.every(r => r.completed);
    
    const updatedAssessment = {
      ...assessment,
      raters: updatedRaters,
      completed: allCompleted
    };
    
    setAssessment(updatedAssessment);
    
    if (allCompleted) {
      console.log("All raters completed, saving final results");
      await saveAssessmentResults(updatedAssessment);
    }
  };
  
  const resetAssessment = () => {
    setAssessment(null);
    setCurrentQuestionIndex(0);
    setCurrentRater(RaterType.SELF);
  };
  
  const responses = assessment?.raters.find(r => r.raterType === currentRater)?.responses || [];
  
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
        
        const fetchRatersFromAssessmentResponses = async () => {
          const { data: ratersData, error } = await supabase
            .from('assessment_responses')
            .select('*')
            .eq('assessment_id', asParam(targetAssessment.id));
            
          if (error) {
            console.error("Error fetching from assessment_responses:", error);
            return null;
          }
          
          if (ratersData && ratersData.length > 0) {
            console.log("Found data in assessment_responses table:", ratersData);
            
            const processedRaters = safeDataFilter(ratersData).map(rater => {
              return {
                raterType: getRowField(rater, 'rater_type', RaterType.SELF) as RaterType,
                email: getRowField(rater, 'email', '') || '',
                name: getRowField(rater, 'name', '') || '',
                completed: !!getRowField(rater, 'completed', false),
                responses: safePrepareResponses(getRowField(rater, 'responses', [])) || []
              };
            });
            
            console.log("Calculating results with fetched raters from assessment_responses:", processedRaters);
            const results = calculateResults(processedRaters);
            
            return results || {
              dimensionScores: [],
              selfAwareness: 0,
              coachabilityAwareness: 0,
              profileType: ""
            };
          }
          
          return {
            dimensionScores: [],
            selfAwareness: 0,
            coachabilityAwareness: 0,
            profileType: ""
          };
        };
        
        return fetchRatersFromAssessmentResponses();
      }
      
      let hasResponses = false;
      targetAssessment.raters.forEach(rater => {
        if (rater.responses && rater.responses.length > 0) {
          hasResponses = true;
        }
      });
      
      if (!hasResponses) {
        console.log("No responses found in assessment object:", targetAssessment);
        
        const fetchResponsesFromAssessmentResponses = async () => {
          const { data: responsesData, error: responsesError } = await supabase
            .from('assessment_responses')
            .select('*')
            .eq('assessment_id', asParam(targetAssessment.id));
            
          if (responsesError || !responsesData) {
            console.error("Error fetching from assessment_responses:", responsesError);
            return {
              dimensionScores: [],
              selfAwareness: 0,
              coachabilityAwareness: 0,
              profileType: ""
            };
          }
          
          console.log(`Found ${responsesData.length} entries in assessment_responses`);
          
          const processedRaters = safeDataFilter(responsesData).map(rater => {
            return {
              raterType: getRowField(rater, 'rater_type', RaterType.SELF) as RaterType,
              email: getRowField(rater, 'email', '') || '',
              name: getRowField(rater, 'name', '') || '',
              completed: !!getRowField(rater, 'completed', false),
              responses: safePrepareResponses(getRowField(rater, 'responses', [])) || []
            };
          });
          
          const results = calculateResults(processedRaters);
          return results || {
            dimensionScores: [],
            selfAwareness: 0,
            coachabilityAwareness: 0,
            profileType: ""
          };
        };
        
        return fetchResponsesFromAssessmentResponses();
      }
      
      const results = calculateResults(targetAssessment.raters);
      console.log("Calculated results:", results);
      
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
      updateResponse: updateResponseHandler,
      loading,
      initializeAssessment: initializeAssessmentHandler,
      initializeRaterAssessment: initializeRaterAssessmentHandler,
      completeAssessment: completeAssessmentHandler,
      addRater: addRaterHandler,
      resetAssessment,
      getResults
    }}>
      {children}
    </AssessmentContext.Provider>
  );
};
