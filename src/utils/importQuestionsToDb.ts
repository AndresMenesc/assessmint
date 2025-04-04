
import { supabase } from "@/integrations/supabase/client";
import { questions } from "@/data/questions";
import { toast } from "sonner";

export const importQuestionsToDb = async () => {
  try {
    console.log("Starting import of questions to database...");
    
    // Use a simple query to check if questions exist
    const { data, error: countError } = await supabase
      .from('questions')
      .select('id')
      .limit(1);
      
    if (countError) {
      console.error("Error checking if questions exist:", countError);
      throw new Error(`Failed to check questions count: ${countError.message}`);
    }
    
    // Check if questions already exist
    if (data && data.length > 0) {
      console.log(`Questions already exist in the database. Skipping import.`);
      return;
    }
    
    // Prepare questions for import
    const questionsToImport = questions.map(q => ({
      id: q.id,
      text: q.text,
      section: q.section,
      sub_section: q.subSection,
      is_reversed: q.isReversed,
      negative_score: q.negativeScore
    }));
    
    // Insert questions in batches
    for (let i = 0; i < questionsToImport.length; i += 50) {
      const batch = questionsToImport.slice(i, i + 50);
      
      const { error } = await supabase
        .from('questions')
        .insert(batch);
      
      if (error) {
        console.error(`Error importing batch ${i / 50 + 1}:`, error);
        throw new Error(`Failed to import questions: ${error.message}`);
      }
      
      console.log(`Imported batch ${i / 50 + 1} of ${Math.ceil(questionsToImport.length / 50)}`);
    }
    
    console.log(`Successfully imported ${questionsToImport.length} questions to the database.`);
    toast.success("Questions imported to database successfully");
  } catch (error) {
    console.error("Error importing questions to database:", error);
    toast.error("Failed to import questions to database");
  }
};
