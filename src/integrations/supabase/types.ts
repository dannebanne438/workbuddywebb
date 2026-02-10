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
      admin_requests: {
        Row: {
          id: string
          rejection_reason: string | null
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["admin_request_status"]
          user_id: string
          workplace_id: string
        }
        Insert: {
          id?: string
          rejection_reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["admin_request_status"]
          user_id: string
          workplace_id: string
        }
        Update: {
          id?: string
          rejection_reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["admin_request_status"]
          user_id?: string
          workplace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_requests_workplace_id_fkey"
            columns: ["workplace_id"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          is_pinned: boolean | null
          title: string
          updated_at: string
          workplace_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_pinned?: boolean | null
          title: string
          updated_at?: string
          workplace_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_pinned?: boolean | null
          title?: string
          updated_at?: string
          workplace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_workplace_id_fkey"
            columns: ["workplace_id"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_number: string | null
          certificate_type: string
          created_at: string
          created_by: string | null
          expiry_date: string | null
          id: string
          issued_date: string | null
          issuer: string | null
          notes: string | null
          status: string
          user_id: string | null
          user_name: string
          workplace_id: string
        }
        Insert: {
          certificate_number?: string | null
          certificate_type: string
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          issued_date?: string | null
          issuer?: string | null
          notes?: string | null
          status?: string
          user_id?: string | null
          user_name: string
          workplace_id: string
        }
        Update: {
          certificate_number?: string | null
          certificate_type?: string
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          issued_date?: string | null
          issuer?: string | null
          notes?: string | null
          status?: string
          user_id?: string | null
          user_name?: string
          workplace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_workplace_id_fkey"
            columns: ["workplace_id"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
          workplace_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
          workplace_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
          workplace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_workplace_id_fkey"
            columns: ["workplace_id"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          for_date: string | null
          id: string
          is_template: boolean | null
          items: Json | null
          title: string
          updated_at: string
          workplace_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          for_date?: string | null
          id?: string
          is_template?: boolean | null
          items?: Json | null
          title: string
          updated_at?: string
          workplace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          for_date?: string | null
          id?: string
          is_template?: boolean | null
          items?: Json | null
          title?: string
          updated_at?: string
          workplace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklists_workplace_id_fkey"
            columns: ["workplace_id"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_leads: {
        Row: {
          company: string
          contact_person: string
          created_at: string
          email: string
          id: string
          message: string | null
          phone: string | null
          status: string | null
          workplace_type: string | null
        }
        Insert: {
          company: string
          contact_person: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          phone?: string | null
          status?: string | null
          workplace_type?: string | null
        }
        Update: {
          company?: string
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          phone?: string | null
          status?: string | null
          workplace_type?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_emergency: boolean | null
          name: string
          notes: string | null
          phone: string | null
          role: string | null
          sort_order: number | null
          workplace_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_emergency?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          sort_order?: number | null
          workplace_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_emergency?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          sort_order?: number | null
          workplace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_workplace_id_fkey"
            columns: ["workplace_id"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_prompts: {
        Row: {
          category: string | null
          created_at: string
          id: string
          prompt_text: string
          sort_order: number | null
          workplace_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          prompt_text: string
          sort_order?: number | null
          workplace_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          prompt_text?: string
          sort_order?: number | null
          workplace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_prompts_workplace_id_fkey"
            columns: ["workplace_id"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          recipient_id: string
          recipient_name: string
          sender_id: string
          sender_name: string
          workplace_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id: string
          recipient_name: string
          sender_id: string
          sender_name: string
          workplace_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id?: string
          recipient_name?: string
          sender_id?: string
          sender_name?: string
          workplace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_workplace_id_fkey"
            columns: ["workplace_id"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      important_times: {
        Row: {
          created_at: string
          description: string
          id: string
          sort_order: number | null
          time_value: string
          workplace_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          sort_order?: number | null
          time_value: string
          workplace_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          sort_order?: number | null
          time_value?: string
          workplace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "important_times_workplace_id_fkey"
            columns: ["workplace_id"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          reported_by: string | null
          reported_by_name: string | null
          resolved_at: string | null
          severity: string
          status: string
          title: string
          workplace_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          reported_by?: string | null
          reported_by_name?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title: string
          workplace_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          reported_by?: string | null
          reported_by_name?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
          workplace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_workplace_id_fkey"
            columns: ["workplace_id"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["invite_code_status"]
          updated_at: string
          uses_count: number | null
          workplace_id: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["invite_code_status"]
          updated_at?: string
          uses_count?: number | null
          workplace_id: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["invite_code_status"]
          updated_at?: string
          uses_count?: number | null
          workplace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_codes_workplace_id_fkey"
            columns: ["workplace_id"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          title: string
          type: string
          user_id: string
          workplace_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title: string
          type: string
          user_id: string
          workplace_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
          workplace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_workplace_id_fkey"
            columns: ["workplace_id"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          workplace_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
          workplace_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          workplace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_workplace_id_fkey"
            columns: ["workplace_id"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_leads: {
        Row: {
          address: string | null
          city: string | null
          company_name: string
          contacts: Json | null
          created_at: string
          created_by: string | null
          estimated_employees: number | null
          id: string
          industry: string | null
          lead_score: number | null
          notes: string | null
          relevance_notes: string | null
          search_area: string | null
          search_coordinates: Json | null
          search_radius_km: number | null
          status: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name: string
          contacts?: Json | null
          created_at?: string
          created_by?: string | null
          estimated_employees?: number | null
          id?: string
          industry?: string | null
          lead_score?: number | null
          notes?: string | null
          relevance_notes?: string | null
          search_area?: string | null
          search_coordinates?: Json | null
          search_radius_km?: number | null
          status?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string
          contacts?: Json | null
          created_at?: string
          created_by?: string | null
          estimated_employees?: number | null
          id?: string
          industry?: string | null
          lead_score?: number | null
          notes?: string | null
          relevance_notes?: string | null
          search_area?: string | null
          search_coordinates?: Json | null
          search_radius_km?: number | null
          status?: string | null
        }
        Relationships: []
      }
      routines: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          sort_order: number | null
          title: string
          updated_at: string
          workplace_id: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          sort_order?: number | null
          title: string
          updated_at?: string
          workplace_id: string
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
          workplace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routines_workplace_id_fkey"
            columns: ["workplace_id"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          created_by: string | null
          end_time: string
          id: string
          is_approved: boolean | null
          notes: string | null
          role: string | null
          shift_date: string
          start_time: string
          updated_at: string
          user_id: string | null
          user_name: string | null
          workplace_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_time: string
          id?: string
          is_approved?: boolean | null
          notes?: string | null
          role?: string | null
          shift_date: string
          start_time: string
          updated_at?: string
          user_id?: string | null
          user_name?: string | null
          workplace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_time?: string
          id?: string
          is_approved?: boolean | null
          notes?: string | null
          role?: string | null
          shift_date?: string
          start_time?: string
          updated_at?: string
          user_id?: string | null
          user_name?: string | null
          workplace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_workplace_id_fkey"
            columns: ["workplace_id"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      team_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender_id: string
          sender_name: string
          workplace_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender_id: string
          sender_name: string
          workplace_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
          sender_name?: string
          workplace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_messages_workplace_id_fkey"
            columns: ["workplace_id"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          workplace_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          workplace_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
          workplace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_workplace_id_fkey"
            columns: ["workplace_id"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workplaces: {
        Row: {
          company_name: string
          created_at: string
          id: string
          industry: string | null
          name: string
          settings: Json | null
          updated_at: string
          workplace_code: string
          workplace_type: string | null
        }
        Insert: {
          company_name: string
          created_at?: string
          id?: string
          industry?: string | null
          name: string
          settings?: Json | null
          updated_at?: string
          workplace_code: string
          workplace_type?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          id?: string
          industry?: string | null
          name?: string
          settings?: Json | null
          updated_at?: string
          workplace_code?: string
          workplace_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_workplace_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_workplace_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
          _workplace_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      is_workplace_admin: {
        Args: { _user_id: string; _workplace_id: string }
        Returns: boolean
      }
      verify_invite_code: {
        Args: { _code: string }
        Returns: {
          name: string
          workplace_id: string
        }[]
      }
      verify_workplace_code: {
        Args: { _code: string }
        Returns: {
          company_name: string
          id: string
          name: string
        }[]
      }
    }
    Enums: {
      admin_request_status: "pending" | "approved" | "rejected"
      app_role: "super_admin" | "workplace_admin" | "employee"
      invite_code_status: "active" | "paused"
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
      admin_request_status: ["pending", "approved", "rejected"],
      app_role: ["super_admin", "workplace_admin", "employee"],
      invite_code_status: ["active", "paused"],
    },
  },
} as const
