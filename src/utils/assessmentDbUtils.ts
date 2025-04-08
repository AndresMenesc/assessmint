
import { Assessment, RaterResponses, RaterType } from "@/types/assessment";
import { DbAssessment, DbAssessmentResponse, DbAdminUser } from "@/types/db-types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateAllResults } from "./calculateAllResults";
import { Json } from "@/integrations/supabase/types";
import { 
  safeQueryData, 
  safeDataAccess, 
  isQueryError, 
  asParam, 
  safeDataFilter, 
  safeRowAccess, 
  asDbParam, 
  getRowField,
  getDbFormValues,
  safePrepareResponses,
  safeJsonSerialize
} from "./supabaseHelpers";

/**
 * Converts an Assessment object to the format expected by the database
 */
export const assessmentToDbFormat = (assessment: Assessment): DbAssessment => {
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
 * Fetches an assessment from the database by code
 */
export const fetchAssessmentByCode = async (code: string): Promise<Assessment | null> => {
  try {
    console.log("Fetching assessment by code:", code);
    
    // Query the assessments table first
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('code', asParam(code))
      .single();
      
    if (assessmentError) {
      if (assessmentError.code === 'PGRST116') {
        // Assessment not found
        console.log(`No assessment found with code: ${code}`);
        return null;
      }
      throw assessmentError;
    }
    
    const safeData = safeQueryData<DbAssessment>(assessmentData as DbAssessment);
    if (!safeData) {
      console.error("Invalid assessment data");
      return null;
    }
    
    // Now fetch all raters and their responses for this assessment
    const { data: responseData, error: responseError } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('assessment_id', asParam(safeData.id));
      
    if (responseError) {
      console.error("Error fetching assessment responses:", responseError);
      throw responseError;
    }
    
    // Convert the database response to our Assessment type
    const assessment: Assessment = {
      id: safeData.id || '',
      code: safeData.code,
      selfRaterEmail: safeData.self_rater_email,
      selfRaterName: safeData.self_rater_name,
      completed: safeData.completed,
      createdAt: new Date(safeData.created_at),
      updatedAt: new Date(safeData.updated_at),
      raters: safeDataFilter(responseData).map(r => {
        const raterType = getRowField(r, 'rater_type', RaterType.SELF) as RaterType;
        const email = getRowField(r, 'email', '');
        const name = getRowField(r, 'name', '');
        const completed = getRowField(r, 'completed', false);
        const responses = safePrepareResponses(getRowField(r, 'responses', []));
        
        return {
          raterType,
          email: email || '',
          name: name || '',
          responses,
          completed
        };
      })
    };
    
    console.log("Assessment found:", assessment);
    return assessment;
  } catch (error) {
    console.error("Error fetching assessment by code:", error);
    throw error;
  }
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
      .eq('assessment_id', asParam(data.id));
      
    if (responsesError) {
      console.error("Error fetching assessment responses:", responsesError);
      throw responsesError;
    }
    
    // Convert responses data to our app's RaterResponses format
    let raters: RaterResponses[] = [];
    
    if (responsesData && Array.isArray(responsesData) && responsesData.length > 0) {
      console.log("Found responses data in assessment_responses table:", responsesData);
      
      // Map the responses from the new table format
      raters = safeDataFilter(responsesData).map(r => {
        const safeR = safeRowAccess(r, {
          rater_type: RaterType.SELF,
          responses: [],
          completed: false,
          email: "",
          name: ""
        });
        
        return {
          raterType: safeR.rater_type as RaterType, 
          responses: safeR.responses as any[] || [],
          completed: safeR.completed,
          email: safeR.email || "", 
          name: safeR.name || ""
        };
      });
    }
    
    // If no rater data exists in the new table, try getting from the old raters table
    // This is for backward compatibility during migration
    if (raters.length === 0) {
      console.log("No responses found in assessment_responses, checking legacy tables");
      const { data: oldRatersData, error: oldRatersError } = await supabase
        .from('raters')
        .select('*')
        .eq('assessment_id', asParam(data.id));
        
      if (!oldRatersError && oldRatersData && Array.isArray(oldRatersData) && oldRatersData.length > 0) {
        console.log("Found raters in legacy raters table:", oldRatersData);
        
        for (const rater of safeDataFilter(oldRatersData)) {
          const safeRater = safeRowAccess(rater, {
            rater_type: RaterType.SELF,
            id: '',
            email: '',
            name: '',
            completed: false
          });
          
          // For each old rater, check if there's data in the new responses table
          const { data: newResponsesData, error: newResponsesError } = await supabase
            .from('assessment_responses')
            .select('*')
            .eq('assessment_id', asParam(data.id))
            .eq('rater_type', asParam(safeRater.rater_type))
            .maybeSingle();
          
          if (!newResponsesError && newResponsesData && !isQueryError(newResponsesData)) {
            const safeData = safeRowAccess(newResponsesData, {
              rater_type: safeRater.rater_type,
              completed: safeRater.completed,
              email: safeRater.email,
              name: safeRater.name,
              responses: []
            });
            
            // If we found data in the new table, use that
            raters.push({
              raterType: safeData.rater_type as RaterType,
              responses: safeData.responses as any[] || [],
              completed: safeData.completed,
              email: safeData.email || '',
              name: safeData.name || ''
            });
          } else {
            // Otherwise, get responses from the old responses table
            const { data: oldResponsesData } = await supabase
              .from('responses')
              .select('*')
              .eq('rater_id', asParam(safeRater.id));
              
            const responses = safeDataFilter(oldResponsesData).map(r => {
              const safeR = safeRowAccess(r, {
                question_id: '',
                score: 0
              });
              
              return {
                questionId: safeR.question_id,
                score: safeR.score
              };
            });
            
            raters.push({
              raterType: safeRater.rater_type as RaterType,
              responses,
              completed: safeRater.completed,
              email: safeRater.email,
              name: safeRater.name
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
export const syncAssessmentWithDb = async (assessmentData: Assessment): Promise<boolean> => {
  try {
    console.log("Syncing assessment with DB:", assessmentData.id);
    console.log("Assessment data:", JSON.stringify(assessmentData));
    const dbAssessment = assessmentToDbFormat(assessmentData);
    
    // First update the assessment
    const { error } = await supabase
      .from('assessments')
      .upsert(getDbFormValues<DbAssessment>(dbAssessment));
      
    if (error) {
      console.error("Error syncing assessment with database:", error);
      throw error;
    }
    
    // Then handle raters and their responses using the new table
    for (const rater of assessmentData.raters) {
      console.log(`Processing rater ${rater.raterType} with email ${rater.email}`);
      
      // Check if we already have an entry for this rater type
      const { data: existingResponse, error: findResponseError } = await supabase
        .from('assessment_responses')
        .select('id')
        .eq('assessment_id', asParam(assessmentData.id))
        .eq('rater_type', asParam(rater.raterType))
        .maybeSingle();
        
      if (findResponseError) {
        console.error("Error finding assessment response:", findResponseError);
        continue;
      }
      
      // Prepare responses data for database
      const safeResponses = safeJsonSerialize(rater.responses || []);
      console.log(`Responses for rater ${rater.raterType}:`, JSON.stringify(safeResponses));
      
      const safeEmail = rater.email || null;
      const safeName = rater.name || null;
      
      if (existingResponse && !isQueryError(existingResponse)) {
        console.log(`Updating existing responses for rater ${rater.raterType}, ID: ${getRowField(existingResponse, 'id', '')}`);
        
        // Update existing responses
        const updateData: Partial<DbAssessmentResponse> = {
          responses: safeResponses,
          completed: rater.completed,
          email: safeEmail,
          name: safeName,
          updated_at: new Date().toISOString()
        };
        
        const { data, error: updateError } = await supabase
          .from('assessment_responses')
          .update(getDbFormValues<Partial<DbAssessmentResponse>>(updateData))
          .eq('id', getRowField(existingResponse, 'id', ''))
          .select();
          
        if (updateError) {
          console.error("Error updating assessment responses:", updateError);
          console.error("Error details:", updateError.details);
          console.error("Error message:", updateError.message);
          continue;
        }
        console.log("Update successful:", data);
      } else {
        console.log(`Creating new responses for rater ${rater.raterType}`);
        
        // Create new responses
        const insertData: DbAssessmentResponse = {
          assessment_id: assessmentData.id,
          rater_type: rater.raterType,
          responses: safeResponses,
          completed: rater.completed,
          email: safeEmail,
          name: safeName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data, error: createError } = await supabase
          .from('assessment_responses')
          .insert(getDbFormValues<DbAssessmentResponse>(insertData))
          .select();
          
        if (createError) {
          console.error("Error creating assessment responses:", createError);
          console.error("Error details:", createError.details);
          console.error("Error message:", createError.message);
          continue;
        }
        console.log("Insert successful:", data);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error in syncAssessmentWithDb:", error);
    return false;
  }
};

/**
 * Creates a new assessment in the database
 */
export const createAssessmentInDb = async (assessment: Assessment): Promise<boolean> => {
  try {
    console.log("Creating new assessment in DB:", assessment.id);
    console.log("Assessment data:", JSON.stringify(assessment));
    
    const dbAssessment = assessmentToDbFormat(assessment);
    
    // First create the assessment
    const { error } = await supabase
      .from('assessments')
      .insert(asDbParam(dbAssessment));
      
    if (error) {
      console.error("Error saving new assessment to database:", error);
      throw error;
    }
    
    // Then create the initial rater responses in the new table
    const selfRater = assessment.raters.find(r => r.raterType === 'self');
    if (selfRater) {
      console.log("Adding self-rater responses to DB");
      
      // Safely prepare responses data
      const safeResponses = selfRater.responses || [];
      const safeEmail = selfRater.email || null;
      const safeName = selfRater.name || null;
      
      const insertData: DbAssessmentResponse = {
        assessment_id: assessment.id,
        rater_type: selfRater.raterType,
        responses: safeResponses as unknown as Json,
        completed: selfRater.completed,
        email: safeEmail,
        name: safeName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error: raterError } = await supabase
        .from('assessment_responses')
        .insert(asDbParam(insertData))
        .select();
        
      if (raterError) {
        console.error("Error saving self-rater responses to database:", raterError);
        console.error("Error details:", raterError.details);
        console.error("Error message:", raterError.message);
      } else {
        console.log("Successfully added self-rater responses:", data);
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
export const updateAssessmentInDb = async (assessmentId: string, updates: Partial<Assessment>): Promise<boolean> => {
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
      .update(asDbParam(dbUpdates))
      .eq('id', asParam(assessmentId));
      
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
          .eq('assessment_id', asParam(assessmentId))
          .eq('rater_type', asParam(rater.raterType))
          .maybeSingle();
          
        if (findResponseError) {
          console.error("Error finding assessment response:", findResponseError);
          continue;
        }
        
        const safeResponses = rater.responses || [];
        const safeEmail = rater.email || null;
        const safeName = rater.name || null;
        
        if (existingResponse && !isQueryError(existingResponse)) {
          // Update existing responses
          const updateData: Partial<DbAssessmentResponse> = {
            responses: JSON.parse(JSON.stringify(safeResponses)) as Json,
            completed: rater.completed,
            email: safeEmail,
            name: safeName,
            updated_at: new Date().toISOString()
          };
          
          const { error: updateError } = await supabase
            .from('assessment_responses')
            .update(asDbParam(updateData))
            .eq('id', existingResponse.id);
            
          if (updateError) {
            console.error("Error updating assessment responses:", updateError);
            continue;
          }
        } else {
          // Create new responses
          const insertData: DbAssessmentResponse = {
            assessment_id: assessmentId,
            rater_type: rater.raterType,
            responses: JSON.parse(JSON.stringify(safeResponses)) as Json,
            completed: rater.completed,
            email: safeEmail,
            name: safeName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { error: createError } = await supabase
            .from('assessment_responses')
            .insert(asDbParam(insertData));
            
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
export const saveAssessmentResults = async (assessment: Assessment): Promise<boolean> => {
  try {
    const results = calculateAllResults(assessment.raters);
    
    if (!results) {
      console.error("No results to save");
      return false;
    }

    // Create an object that matches the structure of the results table
    const resultsData = {
      assessment_id: assessment.id,
      dimension_scores: results.dimensionScores,
      self_awareness: results.selfAwareness,
      coachability_awareness: results.coachabilityAwareness,
      profile_type: results.profileType
    };

    const { data, error } = await supabase
      .from('results')
      .upsert(getDbFormValues(resultsData), {
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
