
// Type definitions for Supabase RPC function results
export interface GetAdminUserResult {
  email: string;
  name: string | null;
  role: string;
  password: string;
}

export interface GetQuestionsCountResult {
  count: number;
}

export interface FunctionExistsResult {
  function_exists: boolean;
}

export interface RunSqlResult {
  success: boolean;
}

export interface ImportQuestionsBatchResult {
  success: boolean;
}
