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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      article_translations: {
        Row: {
          article_id: string
          created_at: string
          id: string
          language_code: string
          translated_content: string | null
          translated_excerpt: string | null
          translated_title: string
          updated_at: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          language_code: string
          translated_content?: string | null
          translated_excerpt?: string | null
          translated_title: string
          updated_at?: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          language_code?: string
          translated_content?: string | null
          translated_excerpt?: string | null
          translated_title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_translations_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author: string | null
          category: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          external_url: string | null
          id: string
          image_url: string | null
          metadata: Json | null
          post_id: number | null
          published_at: string
          read_time: string | null
          title: string
          updated_at: string | null
          vertical_slug: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          post_id?: number | null
          published_at: string
          read_time?: string | null
          title: string
          updated_at?: string | null
          vertical_slug: string
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          post_id?: number | null
          published_at?: string
          read_time?: string | null
          title?: string
          updated_at?: string | null
          vertical_slug?: string
        }
        Relationships: []
      }
      default_featured_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
        }
        Relationships: []
      }
      feed_sync_logs: {
        Row: {
          article_id: string | null
          feed_id: string
          id: string
          original_guid: string
          original_url: string | null
          synced_at: string
        }
        Insert: {
          article_id?: string | null
          feed_id: string
          id?: string
          original_guid: string
          original_url?: string | null
          synced_at?: string
        }
        Update: {
          article_id?: string | null
          feed_id?: string
          id?: string
          original_guid?: string
          original_url?: string | null
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_sync_logs_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_sync_logs_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "rss_feeds"
            referencedColumns: ["id"]
          },
        ]
      }
      rss_feeds: {
        Row: {
          auto_sync: boolean
          auto_tag: boolean
          check_duplicate_link: boolean
          check_duplicate_title: boolean
          created_at: string
          default_author: string | null
          default_image_url: string | null
          feed_url: string
          id: string
          import_mode: Database["public"]["Enums"]["feed_import_mode"]
          last_error: string | null
          last_synced_at: string | null
          max_articles_per_sync: number
          name: string
          publish_status: Database["public"]["Enums"]["feed_publish_status"]
          source_link_text: string | null
          source_link_url: string | null
          status: Database["public"]["Enums"]["feed_status"]
          strip_images: boolean
          strip_inline_styles: boolean
          sync_interval_hours: number
          updated_at: string
          vertical_slug: string
        }
        Insert: {
          auto_sync?: boolean
          auto_tag?: boolean
          check_duplicate_link?: boolean
          check_duplicate_title?: boolean
          created_at?: string
          default_author?: string | null
          default_image_url?: string | null
          feed_url: string
          id?: string
          import_mode?: Database["public"]["Enums"]["feed_import_mode"]
          last_error?: string | null
          last_synced_at?: string | null
          max_articles_per_sync?: number
          name: string
          publish_status?: Database["public"]["Enums"]["feed_publish_status"]
          source_link_text?: string | null
          source_link_url?: string | null
          status?: Database["public"]["Enums"]["feed_status"]
          strip_images?: boolean
          strip_inline_styles?: boolean
          sync_interval_hours?: number
          updated_at?: string
          vertical_slug: string
        }
        Update: {
          auto_sync?: boolean
          auto_tag?: boolean
          check_duplicate_link?: boolean
          check_duplicate_title?: boolean
          created_at?: string
          default_author?: string | null
          default_image_url?: string | null
          feed_url?: string
          id?: string
          import_mode?: Database["public"]["Enums"]["feed_import_mode"]
          last_error?: string | null
          last_synced_at?: string | null
          max_articles_per_sync?: number
          name?: string
          publish_status?: Database["public"]["Enums"]["feed_publish_status"]
          source_link_text?: string | null
          source_link_url?: string | null
          status?: Database["public"]["Enums"]["feed_status"]
          strip_images?: boolean
          strip_inline_styles?: boolean
          sync_interval_hours?: number
          updated_at?: string
          vertical_slug?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      translations: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          language_code: string
          namespace: string
          updated_at: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          id?: string
          language_code: string
          namespace: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          language_code?: string
          namespace?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_article_verticals: {
        Args: never
        Returns: {
          vertical_slug: string
        }[]
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      feed_import_mode: "full_content" | "excerpt_with_link"
      feed_publish_status: "publish" | "draft"
      feed_status: "active" | "paused" | "error"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
      feed_import_mode: ["full_content", "excerpt_with_link"],
      feed_publish_status: ["publish", "draft"],
      feed_status: ["active", "paused", "error"],
    },
  },
} as const
