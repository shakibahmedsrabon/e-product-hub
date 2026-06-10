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
      "All-About": {
        Row: {
          AboutMD: string | null
          AboutName: string | null
          created_at: string
          id: number
        }
        Insert: {
          AboutMD?: string | null
          AboutName?: string | null
          created_at?: string
          id?: number
        }
        Update: {
          AboutMD?: string | null
          AboutName?: string | null
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      "All-Policy": {
        Row: {
          created_at: string
          id: number
          PolicyMD: string | null
          PolicyName: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          PolicyMD?: string | null
          PolicyName?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          PolicyMD?: string | null
          PolicyName?: string | null
        }
        Relationships: []
      }
      Category: {
        Row: {
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      Channels: {
        Row: {
          id: number
          link: string | null
          name: string | null
        }
        Insert: {
          id?: number
          link?: string | null
          name?: string | null
        }
        Update: {
          id?: number
          link?: string | null
          name?: string | null
        }
        Relationships: []
      }
      Connects: {
        Row: {
          id: number
          link: string
          name: string
        }
        Insert: {
          id?: number
          link: string
          name: string
        }
        Update: {
          id?: number
          link?: string
          name?: string
        }
        Relationships: []
      }
      FAQ: {
        Row: {
          answer: string | null
          created_at: string
          id: number
          question: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: number
          question?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: number
          question?: string | null
        }
        Relationships: []
      }
      Groups: {
        Row: {
          id: number
          link: string | null
          name: string | null
        }
        Insert: {
          id?: number
          link?: string | null
          name?: string | null
        }
        Update: {
          id?: number
          link?: string | null
          name?: string | null
        }
        Relationships: []
      }
      Products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration: number | null
          id: number
          image: string | null
          price: Json | null
          stock: boolean | null
          title: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: number
          image?: string | null
          price?: Json | null
          stock?: boolean | null
          title?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: number
          image?: string | null
          price?: Json | null
          stock?: boolean | null
          title?: string | null
        }
        Relationships: []
      }
      "Refund and exchange policy": {
        Row: {
          created_at: string
          id: number
          markdown: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          markdown?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          markdown?: string | null
        }
        Relationships: []
      }
      Reviews: {
        Row: {
          created_at: string
          description: string | null
          FullName: string | null
          id: number
          product_id: number | null
          profile: string | null
          star: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          FullName?: string | null
          id?: number
          product_id?: number | null
          profile?: string | null
          star?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          FullName?: string | null
          id?: number
          product_id?: number | null
          profile?: string | null
          star?: number | null
        }
        Relationships: []
      }
      "Site config": {
        Row: {
          description: string | null
          id: number
          logo: string | null
          name: string | null
          "og-image": string | null
          show_review: boolean | null
          slong: string | null
          title: string | null
        }
        Insert: {
          description?: string | null
          id?: number
          logo?: string | null
          name?: string | null
          "og-image"?: string | null
          show_review?: boolean | null
          slong?: string | null
          title?: string | null
        }
        Update: {
          description?: string | null
          id?: number
          logo?: string | null
          name?: string | null
          "og-image"?: string | null
          show_review?: boolean | null
          slong?: string | null
          title?: string | null
        }
        Relationships: []
      }
      Sliders: {
        Row: {
          created_at: string
          id: number
          images: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          images?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          images?: string | null
        }
        Relationships: []
      }
      Subscribers: {
        Row: {
          created_at: string
          email: string
          ip: string | null
        }
        Insert: {
          created_at?: string
          email: string
          ip?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          ip?: string | null
        }
        Relationships: []
      }
      "Terms of Service": {
        Row: {
          content: string | null
          created_at: string
          id: number
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: number
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: number
        }
        Relationships: []
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
