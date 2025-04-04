import { Assessment, RaterResponses, RaterType } from "@/types/assessment";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateAllResults } from "./calculateAllResults";

/**
 * Converts an Assessment object to the format expected by the database
 */
export const assessmentToDbFormat = (assessment: Assessment) => {
  return {
    id: assessment.id,
    self_rater_email: assessment.selfRaterEmail,
    self_rater_name: assessment.selfRaterName,
    code: assessment.code,
    completed: assessment.completed,
    created_at: assessment.createdAt.toISOString(),
    updated_at: assessment.updatedAt.toISOString()
  };
};

/**
 * Converts a database assessment record to our app's Assessment format
 */
export const dbToAssessmentFormat = async (data: any): Promise<Assessment | null> => {
  if (!data) return null;
  
  try {
    // Get the raters for this assessment
    const { data: ratersData, error: ratersError } = await supabase
      .from('raters')
      .select('*')
      .eq('assessment_id', data.id);
      
    if (ratersError) {
      console.error("Error fetching raters:", ratersError);
      throw ratersError;
    }
    
    // Convert raters data to our app's format
    let raters: RaterResponses[] = [];
    
    if (ratersData && ratersData.length > 0) {
      // For each rater, get their responses
      for (const rater of ratersData) {
        const { data: responsesData, error: responsesError } = await supabase
          .from('responses')
          .select('*')
          .eq('rater_id', rater.id);
          
        if (responsesError) {
          console.error("Error fetching responses for rater:", responsesError);
          continue;
        }
        
        const responses = responsesData ? responsesData.map(r => ({
          questionId: r.question_id,
          score: r.score
        })) : [];
        
        raters.push({
          raterType: rater.rater_type as RaterType,
          responses,
          completed: rater.completed,
          email: rater.email,
          name: rater.name
        });
      }
    }
    
    return {
      id: data.id,
      selfRaterEmail: data.self_rater_email,
      selfRaterName: data.self_rater_name,
      code: data.code,
      completed: data.completed,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      raters: raters
    };
  } catch (error) {
    console.error("Error in dbToAssessmentFormat:", error);
    return null;
  }
};

/**
 * Synchronizes an assessment with the database
 */
export const syncAssessmentWithDb = async (assessmentData: Assessment) => {
  try {
    const dbAssessment = assessmentToDbFormat(assessmentData);
    
    // First update the assessment
    const { error } = await supabase
      .from('assessments')
      .upsert(dbAssessment, {
        onConflict: 'id'
      });
      
    if (error) {
      console.error("Error syncing assessment with database:", error);
      throw error;
    }
    
    // Then handle raters and their responses
    for (const rater of assessmentData.raters) {
      // Find or create the rater in the database
      const { data: existingRaters, error: findRaterError } = await supabase
        .from('raters')
        .select('id')
        .eq('assessment_id', assessmentData.id)
        .eq('rater_type', rater.raterType)
        .maybeSingle();
        
      if (findRaterError) {
        console.error("Error finding rater:", findRaterError);
        continue;
      }
      
      let raterId: string;
      
      if (existingRaters) {
        // Update existing rater
        raterId = existingRaters.id;
        
        const { error: updateRaterError } = await supabase
          .from('raters')
          .update({
            name: rater.name,
            email: rater.email,
            completed: rater.completed,
            updated_at: new Date().toISOString()
          })
          .eq('id', raterId);
          
        if (updateRaterError) {
          console.error("Error updating rater:", updateRaterError);
          continue;
        }
      } else {
        // Create new rater
        const { data: newRater, error: createRaterError } = await supabase
          .from('raters')
          .insert({
            assessment_id: assessmentData.id,
            rater_type: rater.raterType,
            name: rater.name,
            email: rater.email,
            completed: rater.completed
          })
          .select('id')
          .single();
          
        if (createRaterError || !newRater) {
          console.error("Error creating rater:", createRaterError);
          continue;
        }
        
        raterId = newRater.id;
      }
      
      // Now handle responses for this rater
      for (const response of rater.responses) {
        // Find or create response
        const { data: existingResponse, error: findResponseError } = await supabase
          .from('responses')
          .select('id')
          .eq('rater_id', raterId)
          .eq('question_id', response.questionId)
          .maybeSingle();
          
        if (findResponseError) {
          console.error("Error finding response:", findResponseError);
          continue;
        }
        
        if (existingResponse) {
          // Update existing response
          const { error: updateResponseError } = await supabase
            .from('responses')
            .update({
              score: response.score,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingResponse.id);
            
          if (updateResponseError) {
            console.error("Error updating response:", updateResponseError);
          }
        } else {
          // Create new response
          const { error: createResponseError } = await supabase
            .from('responses')
            .insert({
              rater_id: raterId,
              question_id: response.questionId,
              score: response.score
            });
            
          if (createResponseError) {
            console.error("Error creating response:", createResponseError);
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error in syncAssessmentWithDb:", error);
    return false;
  }
};

/**
 * Fetches an assessment by code from the database
 */
export const fetchAssessmentByCode = async (code: string) => {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('code', code)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching assessment:", error);
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    return dbToAssessmentFormat(data);
  } catch (error) {
    console.error("Error in fetchAssessmentByCode:", error);
    toast.error("Error loading assessment");
    return null;
  }
};

/**
 * Creates a new assessment in the database
 */
export const createAssessmentInDb = async (assessment: Assessment) => {
  try {
    const dbAssessment = assessmentToDbFormat(assessment);
    
    // First create the assessment
    const { error } = await supabase
      .from('assessments')
      .insert(dbAssessment);
      
    if (error) {
      console.error("Error saving new assessment to database:", error);
      throw error;
    }
    
    // Then create the initial self-rater
    const selfRater = assessment.raters.find(r => r.raterType === 'self');
    if (selfRater) {
      const { data: raterData, error: raterError } = await supabase
        .from('raters')
        .insert({
          assessment_id: assessment.id,
          rater_type: selfRater.raterType,
          name: selfRater.name,
          email: selfRater.email,
          completed: selfRater.completed
        })
        .select('id')
        .single();
        
      if (raterError || !raterData) {
        console.error("Error saving self-rater to database:", raterError);
        // Continue even if there's an error with the rater
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error in createAssessmentInDb:", error);
    return false;
  }
};

/**
 * Updates an assessment in the database
 */
export const updateAssessmentInDb = async (assessmentId: string, updates: Partial<Assessment>) => {
  try {
    // Convert dates to ISO strings and property names to snake_case for database
    const dbUpdates: Record<string, any> = {};
    
    if (updates.selfRaterEmail !== undefined) dbUpdates.self_rater_email = updates.selfRaterEmail;
    if (updates.selfRaterName !== undefined) dbUpdates.self_rater_name = updates.selfRaterName;
    if (updates.code !== undefined) dbUpdates.code = updates.code;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.createdAt !== undefined) dbUpdates.created_at = updates.createdAt.toISOString();
    if (updates.updatedAt !== undefined) dbUpdates.updated_at = updates.updatedAt.toISOString();
    
    const { error } = await supabase
      .from('assessments')
      .update(dbUpdates)
      .eq('id', assessmentId);
      
    if (error) {
      console.error("Error updating assessment in database:", error);
      throw error;
    }
    
    // If raters are included in the updates, sync them too
    if (updates.raters) {
      // This would require fetching the full assessment and then using syncAssessmentWithDb
      // We're not implementing this here to keep the function focused
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateAssessmentInDb:", error);
    return false;
  }
};

/**
 * Saves assessment results to the database
 */
export const saveAssessmentResults = async (assessment: Assessment) => {
  try {
    const results = calculateAllResults(assessment.raters);
    
    if (!results) {
      console.error("No results to save");
      return false;
    }

    const { data, error } = await supabase
      .from('results')
      .upsert({
        assessment_id: assessment.id,
        dimension_scores: JSON.stringify(results.dimensionScores),
        self_awareness: results.selfAwareness,
        coachability_awareness: results.coachabilityAwareness,
        profile_type: results.profileType
      }, {
        onConflict: 'assessment_id'
      });

    if (error) {
      console.error("Error saving results:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error in saveAssessmentResults:", error);
    return false;
  }
};
