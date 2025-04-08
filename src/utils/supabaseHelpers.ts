
/**
 * Helper functions to handle Supabase query responses more safely
 */

// Utility to check if a Supabase query response contains error
export const isQueryError = (data: any): boolean => {
  return data && typeof data === 'object' && 'code' in data && 'message' in data;
};

// Safely get data from a Supabase query response
export const safeQueryData = <T>(data: T | { code: string; message: string }): T | null => {
  if (isQueryError(data)) {
    console.error("Supabase query error:", (data as any).message);
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
