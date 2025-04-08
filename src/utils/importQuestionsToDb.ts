
import { supabase } from "@/integrations/supabase/client";
import { Question, Section, SubSection, DbQuestion } from "@/types/assessment";
import { safeQueryData, isQueryError, asParam, safeDataFilter, asDbParam } from "./supabaseHelpers";

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
    return safeDataFilter(questions).map(q => {
      const question = q as DbQuestion;
      return {
        id: question.id,
        text: question.text,
        section: question.section as Section,
        subSection: question.sub_section as SubSection,
        isReversed: question.is_reversed,
        negativeScore: question.negative_score
      };
    });
  } catch (error) {
    console.error("Unexpected error fetching questions:", error);
    return [];
  }
};

export const importQuestionsToDb = async (questions: Question[] = []) => {
  try {
    if (questions.length === 0) {
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
    }));

    // Insert questions into the database
    const { data, error } = await supabase
      .from("questions")
      .upsert(asDbParam(dbQuestions));

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
