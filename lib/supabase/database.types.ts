export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          color_key: string
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          color_key?: string
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          color_key?: string
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      memo_tags: {
        Row: {
          created_at: string
          memo_id: string
          owner_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          memo_id: string
          owner_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          memo_id?: string
          owner_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memo_tags_memo_owner_fkey"
            columns: ["owner_id", "memo_id"]
            isOneToOne: false
            referencedRelation: "memos"
            referencedColumns: ["owner_id", "id"]
          },
          {
            foreignKeyName: "memo_tags_tag_owner_fkey"
            columns: ["owner_id", "tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["owner_id", "id"]
          },
        ]
      }
      memos: {
        Row: {
          archived_at: string | null
          category_id: string | null
          content: string
          created_at: string
          favorited_at: string | null
          id: string
          owner_id: string
          revision: number
          title: string
          trashed_at: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          favorited_at?: string | null
          id?: string
          owner_id: string
          revision?: number
          title: string
          trashed_at?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          favorited_at?: string | null
          id?: string
          owner_id?: string
          revision?: number
          title?: string
          trashed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memos_category_owner_fkey"
            columns: ["owner_id", "category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["owner_id", "id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          owner_id: string
          theme: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          owner_id: string
          theme?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          owner_id?: string
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_memo_with_metadata: {
        Args: {
          memo_category_id?: string
          memo_content: string
          memo_tag_ids?: string[]
          memo_title: string
        }
        Returns: string
      }
      save_memo_revision: {
        Args: {
          expected_revision: number
          memo_category_id?: string
          memo_content: string
          memo_tag_ids?: string[]
          memo_title: string
          target_memo_id: string
        }
        Returns: {
          new_revision: number
          new_updated_at: string
          status: string
        }[]
      }
      save_profile_preferences: {
        Args: { display_name_input: string; theme_input: string }
        Returns: boolean
      }
      search_memos: {
        Args: {
          category_filter?: string
          include_uncategorized?: boolean
          result_limit?: number
          result_offset?: number
          search_terms?: string[]
          tag_filters?: string[]
        }
        Returns: {
          category_color_key: string
          category_id: string
          category_name: string
          content: string
          created_at: string
          id: string
          tags: Json
          title: string
          total_count: number
          updated_at: string
        }[]
      }
      search_memos_v2: {
        Args: {
          category_filter?: string
          include_uncategorized?: boolean
          memo_view?: string
          result_limit?: number
          result_offset?: number
          search_terms?: string[]
          sort_key?: string
          tag_filters?: string[]
        }
        Returns: {
          archived_at: string
          category_color_key: string
          category_id: string
          category_name: string
          content: string
          created_at: string
          favorited_at: string
          id: string
          revision: number
          tags: Json
          title: string
          total_count: number
          trashed_at: string
          updated_at: string
        }[]
      }
      update_memo_with_metadata: {
        Args: {
          memo_category_id?: string
          memo_content: string
          memo_id: string
          memo_tag_ids?: string[]
          memo_title: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
