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

    return questions as Question[];
  } catch (error) {
    console.error("Unexpected error fetching questions:", error);
    return [];
  }
};

export const importQuestionsToDb = async (questions: Question[]) => {
  try {
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
