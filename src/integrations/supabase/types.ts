export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          password: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          password: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          password?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      assessment_responses: {
        Row: {
          assessment_id: string
          completed: boolean
          created_at: string
          id: string
          rater_type: string
          responses: Json
          updated_at: string
        }
        Insert: {
          assessment_id: string
          completed?: boolean
          created_at?: string
          id?: string
          rater_type: string
          responses?: Json
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          completed?: boolean
          created_at?: string
          id?: string
          rater_type?: string
          responses?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          code: string
          completed: boolean
          created_at: string
          id: string
          self_rater_email: string
          self_rater_name: string
          updated_at: string
        }
        Insert: {
          code: string
          completed?: boolean
          created_at?: string
          id?: string
          self_rater_email: string
          self_rater_name: string
          updated_at?: string
        }
        Update: {
          code?: string
          completed?: boolean
          created_at?: string
          id?: string
          self_rater_email?: string
          self_rater_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          created_at: string
          id: string
          is_reversed: boolean
          negative_score: boolean
          section: string
          sub_section: string
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          is_reversed?: boolean
          negative_score?: boolean
          section: string
          sub_section: string
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_reversed?: boolean
          negative_score?: boolean
          section?: string
          sub_section?: string
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      raters: {
        Row: {
          assessment_id: string
          completed: boolean
          created_at: string
          email: string
          id: string
          name: string
          rater_type: string
          updated_at: string
        }
        Insert: {
          assessment_id: string
          completed?: boolean
          created_at?: string
          email: string
          id?: string
          name: string
          rater_type: string
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          completed?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string
          rater_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "raters_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          created_at: string
          id: string
          question_id: string
          rater_id: string
          score: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          rater_id: string
          score: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          rater_id?: string
          score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_rater_id_fkey"
            columns: ["rater_id"]
            isOneToOne: false
            referencedRelation: "raters"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          assessment_id: string
          coachability_awareness: number | null
          created_at: string
          dimension_scores: Json
          id: string
          profile_type: string | null
          self_awareness: number | null
          updated_at: string
        }
        Insert: {
          assessment_id: string
          coachability_awareness?: number | null
          created_at?: string
          dimension_scores: Json
          id?: string
          profile_type?: string | null
          self_awareness?: number | null
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          coachability_awareness?: number | null
          created_at?: string
          dimension_scores?: Json
          id?: string
          profile_type?: string | null
          self_awareness?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: true
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
