/**
 * Helper functions to handle Supabase query responses more safely
 */

// Utility to check if a Supabase query response contains error
export const isQueryError = (data: any): boolean => {
  return data && typeof data === 'object' && 'code' in data && 'message' in data;
};

// Safely get data from a Supabase query response
export const safeQueryData = <T>(data: T | { code: string; message: string } | null | undefined): T | null => {
  if (data === null || data === undefined || isQueryError(data)) {
    if (isQueryError(data)) {
      console.error("Supabase query error:", (data as any).message);
    }
    return null;
  }
  return data as T;
};

// Safely access properties on Supabase response
export const safeDataAccess = <T>(
  obj: T | { code: string; message: string } | null | undefined,
  defaultValue: T
): T => {
  if (!obj || isQueryError(obj)) {
    return defaultValue;
  }
  return obj as T;
};

// Cast database object to match required types for insert/update operations 
export const asDbParam = <T>(obj: any): T => {
  return obj as unknown as T;
};

// Type-safe cast for Supabase query parameters to handle string IDs
export const asParam = (value: string | number): any => value;

// Enhanced filter for safe data access from arrays that might contain error objects
export const safeDataFilter = <T>(dataArray: (T | { code: string; message: string } | null | undefined)[] | null | undefined): T[] => {
  if (!dataArray || !Array.isArray(dataArray)) {
    return [];
  }
  return dataArray.filter(item => item !== null && item !== undefined && !isQueryError(item)) as T[];
};

// Safely convert data row to expected type or return default value
export const safeRowAccess = <T>(
  row: T | { code: string; message: string } | null | undefined,
  defaultRow: T
): T => {
  if (!row || isQueryError(row)) {
    return defaultRow;
  }
  return row as T;
};

// Helper to get value from database row using key
export const getRowField = <T, K extends keyof T>(
  row: T | null | undefined | { code: string; message: string },
  key: K,
  defaultValue: T[K]
): T[K] => {
  if (!row || isQueryError(row)) {
    return defaultValue;
  }
  return (row as T)[key] !== undefined ? (row as T)[key] : defaultValue;
};

// Safely serialize JSON data for database operations
export const safeJsonSerialize = <T>(data: T): any => {
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

// Safely get form values for database operations
export const getDbFormValues = <T>(values: any): T => {
  // Convert any form values to database-compatible format
  return values as unknown as T;
};

// Special handler for responses array
export const safePrepareResponses = (responses: any): any[] => {
  if (!responses) return [];
  
  // If it's already an array, return it
  if (Array.isArray(responses)) return responses;
  
  // If it's a Json object coming from the database, make sure we handle it correctly
  try {
    if (typeof responses === 'string') {
      return JSON.parse(responses);
    }
    
    return [];
  } catch (e) {
    console.error("Error parsing responses:", e);
    return [];
  }
};
