import { Assessment, RaterResponses, RaterType } from "@/types/assessment";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateAllResults } from "./calculateAllResults";
import { Json } from "@/integrations/supabase/types";

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
    // Get the rater responses for this assessment using the new assessment_responses table
    const { data: responsesData, error: responsesError } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('assessment_id', data.id);
      
    if (responsesError) {
      console.error("Error fetching assessment responses:", responsesError);
      throw responsesError;
    }
    
    // Convert responses data to our app's RaterResponses format
    let raters: RaterResponses[] = [];
    
    if (responsesData && responsesData.length > 0) {
      // Map the responses from the new table format
      raters = responsesData.map(r => ({
        raterType: r.rater_type as RaterType,
        responses: r.responses as any[] || [],
        completed: r.completed,
        email: r.email || "", 
        name: r.name || ""
      }));
    }
    
    // If no rater data exists in the new table, try getting from the old raters table
    // This is for backward compatibility during migration
    if (raters.length === 0) {
      const { data: oldRatersData, error: oldRatersError } = await supabase
        .from('raters')
        .select('*')
        .eq('assessment_id', data.id);
        
      if (!oldRatersError && oldRatersData && oldRatersData.length > 0) {
        for (const rater of oldRatersData) {
          // For each old rater, check if there's data in the new responses table
          const { data: newResponsesData, error: newResponsesError } = await supabase
            .from('assessment_responses')
            .select('*')
            .eq('assessment_id', data.id)
            .eq('rater_type', rater.rater_type)
            .maybeSingle();
          
          if (!newResponsesError && newResponsesData) {
            // If we found data in the new table, use that
            raters.push({
              raterType: rater.rater_type as RaterType,
              responses: newResponsesData.responses as any[] || [],
              completed: newResponsesData.completed,
              email: rater.email,
              name: rater.name
            });
          } else {
            // Otherwise, get responses from the old responses table
            const { data: oldResponsesData } = await supabase
              .from('responses')
              .select('*')
              .eq('rater_id', rater.id);
              
            const responses = oldResponsesData ? oldResponsesData.map(r => ({
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
    
    // Then handle raters and their responses using the new table
    for (const rater of assessmentData.raters) {
      // Check if we already have an entry for this rater type
      const { data: existingResponse, error: findResponseError } = await supabase
        .from('assessment_responses')
        .select('id')
        .eq('assessment_id', assessmentData.id)
        .eq('rater_type', rater.raterType)
        .maybeSingle();
        
      if (findResponseError) {
        console.error("Error finding assessment response:", findResponseError);
        continue;
      }
      
      if (existingResponse) {
        // Update existing responses - convert responses to Json type
        const { error: updateError } = await supabase
          .from('assessment_responses')
          .update({
            responses: JSON.parse(JSON.stringify(rater.responses)) as Json, // Convert to a valid Json type
            completed: rater.completed,
            email: rater.email,
            name: rater.name,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingResponse.id);
          
        if (updateError) {
          console.error("Error updating assessment responses:", updateError);
          continue;
        }
      } else {
        // Create new responses - convert responses to Json type
        const { error: createError } = await supabase
          .from('assessment_responses')
          .insert({
            assessment_id: assessmentData.id,
            rater_type: rater.raterType,
            responses: JSON.parse(JSON.stringify(rater.responses)) as Json, // Convert to a valid Json type
            completed: rater.completed,
            email: rater.email,
            name: rater.name
          });
          
        if (createError) {
          console.error("Error creating assessment responses:", createError);
          continue;
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
    
    // Then create the initial rater responses in the new table
    const selfRater = assessment.raters.find(r => r.raterType === 'self');
    if (selfRater) {
      const { error: raterError } = await supabase
        .from('assessment_responses')
        .insert({
          assessment_id: assessment.id,
          rater_type: selfRater.raterType,
          responses: JSON.parse(JSON.stringify(selfRater.responses)) as Json, // Convert to a valid Json type
          completed: selfRater.completed,
          email: selfRater.email,
          name: selfRater.name
        });
        
      if (raterError) {
        console.error("Error saving self-rater responses to database:", raterError);
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
      for (const rater of updates.raters) {
        const { data: existingResponse, error: findResponseError } = await supabase
          .from('assessment_responses')
          .select('id')
          .eq('assessment_id', assessmentId)
          .eq('rater_type', rater.raterType)
          .maybeSingle();
          
        if (findResponseError) {
          console.error("Error finding assessment response:", findResponseError);
          continue;
        }
        
        if (existingResponse) {
          // Update existing responses - convert responses to Json type
          const { error: updateError } = await supabase
            .from('assessment_responses')
            .update({
              responses: JSON.parse(JSON.stringify(rater.responses)) as Json, // Convert to a valid Json type
              completed: rater.completed,
              email: rater.email,
              name: rater.name,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingResponse.id);
            
          if (updateError) {
            console.error("Error updating assessment responses:", updateError);
            continue;
          }
        } else {
          // Create new responses - convert responses to Json type
          const { error: createError } = await supabase
            .from('assessment_responses')
            .insert({
              assessment_id: assessmentId,
              rater_type: rater.raterType,
              responses: JSON.parse(JSON.stringify(rater.responses)) as Json, // Convert to a valid Json type
              completed: rater.completed,
              email: rater.email,
              name: rater.name
            });
            
          if (createError) {
            console.error("Error creating assessment responses:", createError);
            continue;
          }
        }
      }
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
        dimension_scores: results.dimensionScores,
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
