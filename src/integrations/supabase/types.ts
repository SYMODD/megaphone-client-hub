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
      categories_points: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          nom: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          nom: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          nom?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          agent_id: string
          code_barre: string | null
          created_at: string | null
          date_enregistrement: string
          id: string
          nationalite: string
          nom: string
          numero_passeport: string
          observations: string | null
          photo_url: string | null
          prenom: string
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          code_barre?: string | null
          created_at?: string | null
          date_enregistrement?: string
          id?: string
          nationalite: string
          nom: string
          numero_passeport: string
          observations?: string | null
          photo_url?: string | null
          prenom: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          code_barre?: string | null
          created_at?: string | null
          date_enregistrement?: string
          id?: string
          nationalite?: string
          nom?: string
          numero_passeport?: string
          observations?: string | null
          photo_url?: string | null
          prenom?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pdf_template_mappings: {
        Row: {
          client_field: string
          created_at: string
          default_value: string | null
          description: string | null
          field_id: string
          font_size: number | null
          id: string
          placeholder: string
          template_id: string
          updated_at: string
          user_id: string
          x: number | null
          y: number | null
        }
        Insert: {
          client_field: string
          created_at?: string
          default_value?: string | null
          description?: string | null
          field_id: string
          font_size?: number | null
          id?: string
          placeholder: string
          template_id: string
          updated_at?: string
          user_id: string
          x?: number | null
          y?: number | null
        }
        Update: {
          client_field?: string
          created_at?: string
          default_value?: string | null
          description?: string | null
          field_id?: string
          font_size?: number | null
          id?: string
          placeholder?: string
          template_id?: string
          updated_at?: string
          user_id?: string
          x?: number | null
          y?: number | null
        }
        Relationships: []
      }
      pdf_templates: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          id: string
          name: string
          updated_at: string
          upload_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          id: string
          name: string
          updated_at?: string
          upload_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          name?: string
          updated_at?: string
          upload_date?: string
          user_id?: string
        }
        Relationships: []
      }
      points_operation: {
        Row: {
          actif: boolean | null
          categorie_id: string | null
          code: string
          created_at: string | null
          id: string
          nom: string
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          categorie_id?: string | null
          code: string
          created_at?: string | null
          id?: string
          nom: string
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          categorie_id?: string | null
          code?: string
          created_at?: string | null
          id?: string
          nom?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "points_operation_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "categories_points"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nom: string
          point_operation: Database["public"]["Enums"]["point_operation"]
          prenom: string
          role: Database["public"]["Enums"]["app_role"]
          statut: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nom: string
          point_operation?: Database["public"]["Enums"]["point_operation"]
          prenom: string
          role?: Database["public"]["Enums"]["app_role"]
          statut?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nom?: string
          point_operation?: Database["public"]["Enums"]["point_operation"]
          prenom?: string
          role?: Database["public"]["Enums"]["app_role"]
          statut?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: []
      }
      shared_pdf_templates: {
        Row: {
          created_at: string
          id: string
          shared_by: string
          shared_with_role: Database["public"]["Enums"]["app_role"] | null
          template_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          shared_by: string
          shared_with_role?: Database["public"]["Enums"]["app_role"] | null
          template_id: string
        }
        Update: {
          created_at?: string
          id?: string
          shared_by?: string
          shared_with_role?: Database["public"]["Enums"]["app_role"] | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_pdf_templates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "pdf_templates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_active: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "agent" | "superviseur" | "admin"
      point_operation:
        | "aeroport_marrakech"
        | "aeroport_casablanca"
        | "aeroport_agadir"
        | "navire_atlas"
        | "navire_meridien"
        | "agence_centrale"
      user_status: "actif" | "inactif"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["agent", "superviseur", "admin"],
      point_operation: [
        "aeroport_marrakech",
        "aeroport_casablanca",
        "aeroport_agadir",
        "navire_atlas",
        "navire_meridien",
        "agence_centrale",
      ],
      user_status: ["actif", "inactif"],
    },
  },
} as const
