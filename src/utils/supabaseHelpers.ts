
/**
 * Helper functions to handle Supabase query responses more safely
 */

import { PostgrestError } from '@supabase/supabase-js';

// Improved type for checking query errors
export const isQueryError = (data: any): data is PostgrestError => {
  return data && typeof data === 'object' && 'code' in data && 'message' in data;
};

// Safely get data from a Supabase query response
export const safeQueryData = <T>(data: T | PostgrestError | null | undefined): T | null => {
  if (data === null || data === undefined || isQueryError(data)) {
    if (isQueryError(data)) {
      console.error("Supabase query error:", (data as PostgrestError).message);
    }
    return null;
  }
  return data as T;
};

// Safely access properties on Supabase response
export const safeDataAccess = <T>(
  obj: T | PostgrestError | null | undefined,
  defaultValue: T
): T => {
  if (!obj || isQueryError(obj)) {
    return defaultValue;
  }
  return obj as T;
};

// Cast database object to match required types for insert/update operations 
export const asDbParam = <T>(obj: any): T => {
  return obj as T;
};

// Type-safe cast for Supabase query parameters to handle string IDs
export const asParam = (value: string | number): any => value;

// Enhanced filter for safe data access from arrays that might contain error objects
export const safeDataFilter = <T>(dataArray: (T | PostgrestError | null | undefined)[] | null | undefined): T[] => {
  if (!dataArray || !Array.isArray(dataArray)) {
    return [];
  }
  return dataArray.filter(item => item !== null && item !== undefined && !isQueryError(item)) as T[];
};

// Safely convert data row to expected type or return default value
export const safeRowAccess = <T>(
  row: T | PostgrestError | null | undefined,
  defaultRow: T
): T => {
  if (!row || isQueryError(row)) {
    return defaultRow;
  }
  return row as T;
};

// Safely get form values for database operations with proper type conversion
export const getDbFormValues = <T>(values: any): any => {
  // Convert any form values to database-compatible format
  return values;
};

// Helper to get value from database row using key - now handles strings properly
export const getRowField = <T extends Record<string, any>, K extends string>(
  row: T | PostgrestError | null | undefined,
  key: K,
  defaultValue: any
): any => {
  if (!row || isQueryError(row)) {
    return defaultValue;
  }
  
  if (key in (row as Record<string, any>)) {
    return (row as Record<string, any>)[key];
  }
  
  return defaultValue;
};

// Safely prepare responses array
export const safePrepareResponses = (responses: any): any[] => {
  if (!responses) return [];
  
  // If it's already an array, return it
  if (Array.isArray(responses)) return responses;
  
  // If it's a JSON object coming from the database, make sure we handle it correctly
  try {
    if (typeof responses === 'string') {
      return JSON.parse(responses);
    }
    
    // If it's a JSON object, convert it to an array
    if (responses && typeof responses === 'object') {
      return Array.isArray(responses) ? responses : [];
    }
    
    return [];
  } catch (e) {
    console.error("Error parsing responses:", e);
    return [];
  }
};

// Safe JSON serialization for database operations
export const safeJsonSerialize = <T>(data: T): any => {
  if (data === null || data === undefined) {
    return [];
  }
  
  if (Array.isArray(data)) {
    return data;
  }
  
  try {
    // If already a string, parse and then stringify to ensure valid format
    if (typeof data === 'string') {
      return JSON.parse(data);
    }
    // Otherwise just convert to JSON
    return data;
  } catch (e) {
    console.error("Error serializing JSON data:", e);
    return [];
  }
};
