
import { Json } from "@/integrations/supabase/types";

/**
 * Prepares a database object with default values for timestamps if not provided
 */
export function prepareDbObject(object: any, defaults: any = {}) {
  const now = new Date().toISOString();
  const preparedObject = {
    ...object,
    created_at: object.created_at || defaults.created_at || now,
    updated_at: object.updated_at || defaults.updated_at || now,
  };

  // Add any other defaults
  for (const key in defaults) {
    if (defaults[key] !== undefined && preparedObject[key] === undefined) {
      preparedObject[key] = defaults[key];
    }
  }

  return preparedObject;
}

/**
 * Converts responses array to JSON for database storage
 */
export function prepareResponsesForDb(responses: any[]): Json {
  try {
    return responses.map(response => ({
      questionId: response.questionId,
      score: response.score
    }));
  } catch (error) {
    console.error("Error preparing responses for DB:", error);
    return [];
  }
}

/**
 * Converts rater type to string representation
 */
export function raterTypeToString(raterType: any): string {
  if (typeof raterType === 'string') {
    return raterType.toLowerCase();
  }
  return 'self'; // Default
}
