
import { supabase } from "@/integrations/supabase/client";
import { Question } from "@/types/assessment";
import { getQuestions } from "@/data/questions";
import { toast } from "sonner";
import { DbQuestion } from "@/types/db-types";
import { 
  safeQueryData, 
  safeDataFilter, 
  getRowField, 
  getDbFormValues 
} from "./supabaseHelpers";

export async function importQuestionsToDb(customQuestions: Question[] = []) {
  try {
    const existingQuestionsCheck = await getExistingQuestions();
    const defaultQuestionsToUse = getQuestions();
    
    console.log("Importing questions to database...");
    
    // Check if questions already exist in the database
    const { data: existingQuestionsData, error: fetchError } = await supabase
      .from('questions')
      .select('*')
      .limit(1);
      
    if (fetchError) {
      console.error("Error checking for existing questions:", fetchError);
      toast.error("Error importing questions");
      return;
    }
    
    const databaseQuestions = safeDataFilter<DbQuestion>(existingQuestionsData);
    
    // Skip import if questions already exist and no custom questions provided
    if (databaseQuestions.length > 0 && customQuestions.length === 0) {
      console.log("Questions already exist in the database. Skipping import.");
      return;
    }
    
    const questionsToImport = customQuestions.length > 0 ? customQuestions : defaultQuestionsToUse;
    
    console.log(`Importing ${questionsToImport.length} questions to the database...`);
    
    // Format questions for the database
    const formattedQuestions = questionsToImport.map(q => ({
      id: q.id,
      text: q.text,
      section: q.section,
      sub_section: q.subSection,
      is_reversed: q.isReversed,
      negative_score: q.negativeScore,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    // Insert questions into the database using upsert to avoid duplicates
    const { error: insertError } = await supabase
      .from('questions')
      .upsert(getDbFormValues(formattedQuestions), {
        onConflict: 'id',
        ignoreDuplicates: false
      });
      
    if (insertError) {
      console.error("Error importing questions:", insertError);
      toast.error("Error importing questions");
      return;
    }
    
    console.log("Questions imported successfully.");
    
  } catch (error) {
    console.error("Error importing questions to DB:", error);
    toast.error("Error importing questions");
  }
}

async function getExistingQuestions() {
  const { data: existingQuestionsData, error: fetchError } = await supabase
    .from('questions')
    .select('*')
    .limit(1);
    
  if (fetchError) {
    console.error("Error checking for existing questions:", fetchError);
    toast.error("Error importing questions");
    return [];
  }
  
  return safeDataFilter<DbQuestion>(existingQuestionsData);
}
