
import { supabase } from "@/integrations/supabase/client";
import { Question, Section, SubSection } from "@/types/assessment";

import { safeQueryData, isQueryError, asParam } from "./supabaseHelpers";

export const fetchAllQuestions = async (): Promise<Question[]> => {
  try {
    const { data: questions, error } = await supabase
      .from("questions")
      .select("*");

    if (error) {
      console.error("Error fetching questions:", error);
      return [];
    }

    // Convert database format to our Question type format
    return questions.map(q => ({
      id: q.id,
      text: q.text,
      section: q.section as Section,
      subSection: q.sub_section as SubSection,
      isReversed: q.is_reversed,
      negativeScore: q.negative_score
    }));
  } catch (error) {
    console.error("Unexpected error fetching questions:", error);
    return [];
  }
};

export const importQuestionsToDb = async (questions: Question[]) => {
  try {
    if (!questions || questions.length === 0) {
      // If no questions provided, use the ones from the data file
      const { questions: defaultQuestions } = await import("../data/questions");
      questions = defaultQuestions;
    }
    
    // Format questions for database
    const dbQuestions = questions.map((q) => ({
      id: q.id,
      text: q.text,
      section: q.section,
      sub_section: q.subSection,
      is_reversed: q.isReversed,
      negative_score: q.negativeScore,
    })) as any; // Use type assertion to bypass TypeScript errors

    // Insert questions into the database
    const { data, error } = await supabase.from("questions").upsert(dbQuestions);

    if (error) {
      console.error("Error importing questions:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error importing questions:", error);
    return { success: false, error };
  }
};
