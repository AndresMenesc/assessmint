
import { Json } from "@/integrations/supabase/types";
import { RaterType } from "@/types/assessment";

/**
 * Helper function to correctly type and prepare objects for Supabase database operations
 */
export function prepareDbObject<T>(obj: any, defaults: Record<string, any> = {}): T {
  // Start with defaults
  const result = { ...defaults };
  
  // Add provided values, filtering out undefined
  for (const key in obj) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  
  // Add timestamps if not provided
  if (!result.created_at && defaults.created_at === undefined) {
    result.created_at = new Date().toISOString();
  }
  if (!result.updated_at && defaults.updated_at === undefined) {
    result.updated_at = new Date().toISOString();
  }
  
  return result as T;
}

/**
 * Helper to prepare responses array for database compatibility
 */
export function prepareResponsesForDb(responses: any[]): Json {
  if (!responses || !Array.isArray(responses)) {
    return [] as unknown as Json;
  }
  return responses as unknown as Json;
}

/**
 * Helper to safely cast RaterType to string for database operations
 */
export function raterTypeToString(raterType: RaterType): string {
  return raterType.toString();
}

/**
 * Helper function to format assessment response data for the database
 */
export function prepareAssessmentResponse(data: any, assessmentId: string): any {
  return prepareDbObject({
    assessment_id: assessmentId,
    rater_type: data.rater_type || data.raterType,
    email: data.email,
    name: data.name,
    completed: data.completed || false,
    responses: prepareResponsesForDb(data.responses || []),
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    id: data.id || undefined // Include id if available
  });
}

/**
 * Helper function to prepare response data for the database
 */
export function prepareDbResponse(data: any, raterId: string): any {
  return prepareDbObject({
    rater_id: raterId,
    question_id: data.questionId,
    score: data.score,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    id: data.id || undefined
  });
}

/**
 * Helper function to prepare database parameters
 */
export function asDbParam(data: any): any {
  return prepareDbObject(data);
}
