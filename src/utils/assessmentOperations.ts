import { supabase } from "@/integrations/supabase/client";
import { Assessment, RaterType, Response, Question } from "@/types/assessment";
import { prepareDbObject } from "./dbTypeHelpers";

// Fix database operations to use the correct parameter preparation
// Replace occurrences of asDbParam with prepareDbObject

export async function updateAssessment(assessmentId: string, data: any) {
  try {
    const { error } = await supabase
      .from('assessments')
      .update(prepareDbObject(data))
      .eq('id', assessmentId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating assessment:", error);
    return false;
  }
}

export async function createAssessment(selfRaterEmail: string, selfRaterName: string, code: string) {
  try {
    // Create the assessment record
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('assessments')
      .insert(prepareDbObject({
        self_rater_email: selfRaterEmail,
        self_rater_name: selfRaterName,
        code: code,
        completed: false
      }))
      .select('*')
      .single();
    
    if (assessmentError || !assessmentData) {
      console.error("Error creating assessment:", assessmentError);
      return { success: false, assessmentId: null };
    }
    
    // Create the self-rater record
    const { data: raterData, error: raterError } = await supabase
      .from('raters')
      .insert(prepareDbObject({
        assessment_id: assessmentData.id,
        rater_type: RaterType.SELF,
        email: selfRaterEmail,
        name: selfRaterName,
        completed: false
      }))
      .select('*')
      .single();
    
    if (raterError || !raterData) {
      console.error("Error creating self-rater:", raterError);
      return { success: false, assessmentId: assessmentData.id };
    }
    
    return { 
      success: true, 
      assessmentId: assessmentData.id,
      raterId: raterData.id
    };
  } catch (error) {
    console.error("Error in createAssessment:", error);
    return { success: false, assessmentId: null };
  }
}

export async function addRaterToAssessment(assessmentId: string, email: string, name: string, raterType: RaterType) {
  try {
    // Check if a rater with this email already exists for this assessment
    const { data: existingRaters, error: checkError } = await supabase
      .from('raters')
      .select('*')
      .eq('assessment_id', assessmentId)
      .eq('email', email);
    
    if (checkError) {
      console.error("Error checking existing raters:", checkError);
      return { success: false, raterId: null };
    }
    
    // If rater already exists, return their ID
    if (existingRaters && existingRaters.length > 0) {
      return { 
        success: true, 
        raterId: existingRaters[0].id,
        isExisting: true
      };
    }
    
    // Create new rater
    const { data: raterData, error: raterError } = await supabase
      .from('raters')
      .insert(prepareDbObject({
        assessment_id: assessmentId,
        rater_type: raterType,
        email: email,
        name: name,
        completed: false
      }))
      .select('*')
      .single();
    
    if (raterError || !raterData) {
      console.error("Error adding rater:", raterError);
      return { success: false, raterId: null };
    }
    
    return { 
      success: true, 
      raterId: raterData.id,
      isExisting: false
    };
  } catch (error) {
    console.error("Error in addRaterToAssessment:", error);
    return { success: false, raterId: null };
  }
}

export async function saveResponses(raterId: string, responses: Response[]) {
  try {
    // First, get the rater to update their completion status
    const { data: raterData, error: raterError } = await supabase
      .from('raters')
      .select('*')
      .eq('id', raterId)
      .single();
    
    if (raterError || !raterData) {
      console.error("Error fetching rater:", raterError);
      return { success: false };
    }
    
    // Insert all responses
    const preparedResponses = responses.map(response => prepareDbObject({
      rater_id: raterId,
      question_id: response.questionId,
      score: response.score
    }));
    
    const { error: responsesError } = await supabase
      .from('responses')
      .insert(preparedResponses);
    
    if (responsesError) {
      console.error("Error saving responses:", responsesError);
      return { success: false };
    }
    
    // Update rater as completed
    const { error: updateError } = await supabase
      .from('raters')
      .update({ completed: true })
      .eq('id', raterId);
    
    if (updateError) {
      console.error("Error updating rater completion:", updateError);
      return { success: false };
    }
    
    // Check if all raters have completed for this assessment
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('raters')
      .select('*')
      .eq('assessment_id', raterData.assessment_id);
    
    if (assessmentError || !assessmentData) {
      console.error("Error checking assessment completion:", assessmentError);
      return { success: true, allCompleted: false };
    }
    
    const allCompleted = assessmentData.every(rater => rater.completed);
    
    // If all completed, update the assessment status
    if (allCompleted) {
      const { error: completeError } = await supabase
        .from('assessments')
        .update({ completed: true })
        .eq('id', raterData.assessment_id);
      
      if (completeError) {
        console.error("Error updating assessment completion:", completeError);
      }
    }
    
    return { 
      success: true, 
      allCompleted,
      assessmentId: raterData.assessment_id
    };
  } catch (error) {
    console.error("Error in saveResponses:", error);
    return { success: false };
  }
}

export async function getAssessmentByCode(code: string) {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('code', code)
      .single();
    
    if (error || !data) {
      console.error("Error fetching assessment by code:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getAssessmentByCode:", error);
    return null;
  }
}

export async function getRaterByEmail(assessmentId: string, email: string) {
  try {
    const { data, error } = await supabase
      .from('raters')
      .select('*')
      .eq('assessment_id', assessmentId)
      .eq('email', email)
      .single();
    
    if (error || !data) {
      console.error("Error fetching rater by email:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getRaterByEmail:", error);
    return null;
  }
}

export async function getResponsesForRater(raterId: string) {
  try {
    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .eq('rater_id', raterId);
    
    if (error || !data) {
      console.error("Error fetching responses for rater:", error);
      return [];
    }
    
    return data.map(mapResponseData);
  } catch (error) {
    console.error("Error in getResponsesForRater:", error);
    return [];
  }
}

export function mapResponseData(responseData: any): Response {
  return {
    questionId: responseData.question_id,
    score: responseData.score
  };
}

export async function getAllQuestions(): Promise<Question[]> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('id');
    
    if (error || !data) {
      console.error("Error fetching questions:", error);
      return [];
    }
    
    return data.map(q => ({
      id: q.id,
      text: q.text,
      section: q.section,
      subSection: q.sub_section,
      isReversed: q.is_reversed,
      negativeScore: q.negative_score
    }));
  } catch (error) {
    console.error("Error in getAllQuestions:", error);
    return [];
  }
}

export async function getAssessmentDetails(assessmentId: string) {
  try {
    // Get the assessment data
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();
    
    if (assessmentError || !assessmentData) {
      console.error("Error fetching assessment details:", assessmentError);
      return null;
    }
    
    // Get all raters for this assessment
    const { data: ratersData, error: ratersError } = await supabase
      .from('raters')
      .select('*')
      .eq('assessment_id', assessmentId);
    
    if (ratersError || !ratersData) {
      console.error("Error fetching raters:", ratersError);
      return null;
    }
    
    // Get all responses for each rater
    const raters = [];
    for (const rater of ratersData) {
      const { data: responsesData, error: responsesError } = await supabase
        .from('responses')
        .select('*')
        .eq('rater_id', rater.id);
      
      if (responsesError) {
        console.error(`Error fetching responses for rater ${rater.id}:`, responsesError);
        continue;
      }
      
      const responses = responsesData ? responsesData.map(mapResponseData) : [];
      
      raters.push({
        id: rater.id,
        raterType: rater.rater_type,
        email: rater.email,
        name: rater.name,
        completed: rater.completed,
        responses
      });
    }
    
    return {
      id: assessmentData.id,
      selfRaterEmail: assessmentData.self_rater_email,
      selfRaterName: assessmentData.self_rater_name,
      code: assessmentData.code,
      completed: assessmentData.completed,
      createdAt: new Date(assessmentData.created_at),
      updatedAt: new Date(assessmentData.updated_at),
      raters
    };
  } catch (error) {
    console.error("Error in getAssessmentDetails:", error);
    return null;
  }
}

export async function getAllAssessments() {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error || !data) {
      console.error("Error fetching all assessments:", error);
      return [];
    }
    
    return data.map(assessment => ({
      id: assessment.id,
      selfRaterEmail: assessment.self_rater_email,
      selfRaterName: assessment.self_rater_name,
      code: assessment.code,
      completed: assessment.completed,
      createdAt: new Date(assessment.created_at),
      updatedAt: new Date(assessment.updated_at)
    }));
  } catch (error) {
    console.error("Error in getAllAssessments:", error);
    return [];
  }
}

export async function deleteAssessment(assessmentId: string) {
  try {
    // First delete all related data
    // 1. Delete responses for all raters
    const { data: ratersData, error: ratersError } = await supabase
      .from('raters')
      .select('id')
      .eq('assessment_id', assessmentId);
    
    if (ratersError) {
      console.error("Error fetching raters for deletion:", ratersError);
      return false;
    }
    
    if (ratersData && ratersData.length > 0) {
      const raterIds = ratersData.map(r => r.id);
      
      // Delete responses for these raters
      const { error: responsesError } = await supabase
        .from('responses')
        .delete()
        .in('rater_id', raterIds);
      
      if (responsesError) {
        console.error("Error deleting responses:", responsesError);
        return false;
      }
    }
    
    // 2. Delete raters
    const { error: deleteRatersError } = await supabase
      .from('raters')
      .delete()
      .eq('assessment_id', assessmentId);
    
    if (deleteRatersError) {
      console.error("Error deleting raters:", deleteRatersError);
      return false;
    }
    
    // 3. Delete results if they exist
    const { error: deleteResultsError } = await supabase
      .from('results')
      .delete()
      .eq('assessment_id', assessmentId);
    
    if (deleteResultsError) {
      console.error("Error deleting results:", deleteResultsError);
      // Continue anyway as results might not exist
    }
    
    // 4. Finally delete the assessment
    const { error: deleteAssessmentError } = await supabase
      .from('assessments')
      .delete()
      .eq('id', assessmentId);
    
    if (deleteAssessmentError) {
      console.error("Error deleting assessment:", deleteAssessmentError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteAssessment:", error);
    return false;
  }
}

export async function saveResults(assessmentId: string, dimensionScores: any, selfAwareness: number, coachabilityAwareness: number, profileType: string) {
  try {
    const { error } = await supabase
      .from('results')
      .insert(prepareDbObject({
        assessment_id: assessmentId,
        dimension_scores: dimensionScores,
        self_awareness: selfAwareness,
        coachability_awareness: coachabilityAwareness,
        profile_type: profileType
      }));
    
    if (error) {
      console.error("Error saving results:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in saveResults:", error);
    return false;
  }
}

export async function getResults(assessmentId: string) {
  try {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single();
    
    if (error || !data) {
      console.error("Error fetching results:", error);
      return null;
    }
    
    return {
      assessmentId: data.assessment_id,
      dimensionScores: data.dimension_scores,
      selfAwareness: data.self_awareness,
      coachabilityAwareness: data.coachability_awareness,
      profileType: data.profile_type,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error("Error in getResults:", error);
    return null;
  }
}
