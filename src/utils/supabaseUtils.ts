
import { Json } from "@/integrations/supabase/types";

/**
 * Safe parameter for Supabase query
 */
export function asParam(value: any): any {
  return value;
}

/**
 * Safely filters data returned from Supabase
 */
export function safeDataFilter<T>(data: any): T[] {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  return data as T[];
}

/**
 * Safely gets a row field with a default value
 */
export function getRowField<T>(row: any, fieldName: string, defaultValue: T): T {
  if (!row || row[fieldName] === undefined || row[fieldName] === null) {
    return defaultValue;
  }
  return row[fieldName] as T;
}

/**
 * Safely accesses a row with default values
 */
export function safeRowAccess<T>(row: any, defaults: T): T {
  if (!row) {
    return defaults;
  }
  
  const result = { ...defaults };
  for (const key in defaults) {
    if (row[key] !== undefined && row[key] !== null) {
      (result as any)[key] = row[key];
    }
  }
  
  return result;
}

/**
 * Safely checks if data is a valid query result
 */
export function safeQueryData<T>(data: any): T | null {
  if (!data) {
    return null;
  }
  return data as T;
}

/**
 * Safely prepares responses for processing
 */
export function safePrepareResponses(responses: any): any[] {
  if (!responses) {
    return [];
  }
  if (Array.isArray(responses)) {
    return responses;
  }
  return [];
}

/**
 * Checks if a query result is an error
 */
export function isQueryError(result: any): boolean {
  return result && result.code && result.message && result.details;
}
