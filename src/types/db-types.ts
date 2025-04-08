import { Json } from "@/integrations/supabase/types";

export interface DbQuestion {
  id: string;
  text: string;
  section: string;
  sub_section: string;
  is_reversed: boolean;
  negative_score: boolean;
  created_at?: string;
  updated_at?: string;
}
