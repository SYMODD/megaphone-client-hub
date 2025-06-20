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
          categorie: string
          code_barre: string | null
          code_barre_image_url: string | null
          created_at: string | null
          date_enregistrement: string
          document_type: string | null
          id: string
          nationalite: string
          nom: string
          numero_passeport: string
          numero_telephone: string | null
          observations: string | null
          photo_url: string | null
          point_operation: string
          prenom: string
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          categorie?: string
          code_barre?: string | null
          code_barre_image_url?: string | null
          created_at?: string | null
          date_enregistrement?: string
          document_type?: string | null
          id?: string
          nationalite: string
          nom: string
          numero_passeport: string
          numero_telephone?: string | null
          observations?: string | null
          photo_url?: string | null
          point_operation?: string
          prenom: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          categorie?: string
          code_barre?: string | null
          code_barre_image_url?: string | null
          created_at?: string | null
          date_enregistrement?: string
          document_type?: string | null
          id?: string
          nationalite?: string
          nom?: string
          numero_passeport?: string
          numero_telephone?: string | null
          observations?: string | null
          photo_url?: string | null
          point_operation?: string
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
      security_audit_log: {
        Row: {
          action: string
          changed_at: string
          changed_by: string
          id: string
          ip_address: string | null
          new_value_hash: string | null
          old_value_hash: string | null
          setting_key: string
          user_agent: string | null
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by: string
          id?: string
          ip_address?: string | null
          new_value_hash?: string | null
          old_value_hash?: string | null
          setting_key: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string
          id?: string
          ip_address?: string | null
          new_value_hash?: string | null
          old_value_hash?: string | null
          setting_key?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      security_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_encrypted: boolean
          setting_key: string
          setting_value: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_encrypted?: boolean
          setting_key: string
          setting_value: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_encrypted?: boolean
          setting_key?: string
          setting_value?: string
          updated_at?: string
          updated_by?: string
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
      ocr_global_settings: {
        Row: {
          id: string
          api_key: string
          created_at: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          api_key: string
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          api_key?: string
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ocr_global_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      security_settings_view: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          is_encrypted: boolean | null
          setting_key: string | null
          setting_value: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_encrypted?: boolean | null
          setting_key?: string | null
          setting_value?: never
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_encrypted?: boolean | null
          setting_key?: string | null
          setting_value?: never
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
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
      upsert_security_setting: {
        Args: {
          p_setting_key: string
          p_setting_value: string
          p_is_encrypted: boolean
          p_description: string
        }
        Returns: Json
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
