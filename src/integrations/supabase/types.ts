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
      api_providers: {
        Row: {
          code: string
          configuration: Json
          created_at: string
          error_count: number
          id: string
          last_failure_at: string | null
          last_response_ms: number | null
          last_success_at: string | null
          mode: string
          name: string
          secret_env_keys: string[]
          service_types: Database["public"]["Enums"]["service_code"][]
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
        }
        Insert: {
          code: string
          configuration?: Json
          created_at?: string
          error_count?: number
          id?: string
          last_failure_at?: string | null
          last_response_ms?: number | null
          last_success_at?: string | null
          mode?: string
          name: string
          secret_env_keys?: string[]
          service_types?: Database["public"]["Enums"]["service_code"][]
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Update: {
          code?: string
          configuration?: Json
          created_at?: string
          error_count?: number
          id?: string
          last_failure_at?: string | null
          last_response_ms?: number | null
          last_success_at?: string | null
          mode?: string
          name?: string
          secret_env_keys?: string[]
          service_types?: Database["public"]["Enums"]["service_code"][]
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json
          resource: string
          resource_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          resource: string
          resource_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          resource?: string
          resource_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          credited: boolean
          fee: number
          gateway: string
          gateway_reference: string | null
          id: string
          metadata: Json
          payment_reference: string
          status: Database["public"]["Enums"]["txn_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          credited?: boolean
          fee?: number
          gateway: string
          gateway_reference?: string | null
          id?: string
          metadata?: Json
          payment_reference: string
          status?: Database["public"]["Enums"]["txn_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          credited?: boolean
          fee?: number
          gateway?: string
          gateway_reference?: string | null
          id?: string
          metadata?: Json
          payment_reference?: string
          status?: Database["public"]["Enums"]["txn_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          description: string | null
          is_public: boolean
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          is_public?: boolean
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          description?: string | null
          is_public?: boolean
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          last_login_at: string | null
          phone: string | null
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          last_login_at?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          last_login_at?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_products: {
        Row: {
          agent_price: number | null
          category: string | null
          commission: number
          created_at: string
          enabled: boolean
          id: string
          metadata: Json
          name: string
          network: string | null
          product_code: string
          provider_cost: number
          provider_service_id: string | null
          selling_price: number
          service_id: string
          updated_at: string
        }
        Insert: {
          agent_price?: number | null
          category?: string | null
          commission?: number
          created_at?: string
          enabled?: boolean
          id?: string
          metadata?: Json
          name: string
          network?: string | null
          product_code: string
          provider_cost?: number
          provider_service_id?: string | null
          selling_price?: number
          service_id: string
          updated_at?: string
        }
        Update: {
          agent_price?: number | null
          category?: string | null
          commission?: number
          created_at?: string
          enabled?: boolean
          id?: string
          metadata?: Json
          name?: string
          network?: string | null
          product_code?: string
          provider_cost?: number
          provider_service_id?: string | null
          selling_price?: number
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_products_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_transactions: {
        Row: {
          amount: number
          commission: number
          cost: number
          created_at: string
          customer_reference: string | null
          failure_reason: string | null
          id: string
          product_id: string | null
          product_name: string | null
          profit: number
          provider: string
          provider_reference: string | null
          request_metadata: Json
          response_metadata: Json
          service_type: Database["public"]["Enums"]["service_code"]
          status: Database["public"]["Enums"]["txn_status"]
          transaction_reference: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          commission?: number
          cost?: number
          created_at?: string
          customer_reference?: string | null
          failure_reason?: string | null
          id?: string
          product_id?: string | null
          product_name?: string | null
          profit?: number
          provider?: string
          provider_reference?: string | null
          request_metadata?: Json
          response_metadata?: Json
          service_type: Database["public"]["Enums"]["service_code"]
          status?: Database["public"]["Enums"]["txn_status"]
          transaction_reference: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          commission?: number
          cost?: number
          created_at?: string
          customer_reference?: string | null
          failure_reason?: string | null
          id?: string
          product_id?: string | null
          product_name?: string | null
          profit?: number
          provider?: string
          provider_reference?: string | null
          request_metadata?: Json
          response_metadata?: Json
          service_type?: Database["public"]["Enums"]["service_code"]
          status?: Database["public"]["Enums"]["txn_status"]
          transaction_reference?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "service_products"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          code: Database["public"]["Enums"]["service_code"]
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          maintenance_message: string | null
          max_amount: number
          min_amount: number
          name: string
          provider: string
          service_charge: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: Database["public"]["Enums"]["service_code"]
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          maintenance_message?: string | null
          max_amount?: number
          min_amount?: number
          name: string
          provider?: string
          service_charge?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: Database["public"]["Enums"]["service_code"]
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          maintenance_message?: string | null
          max_amount?: number
          min_amount?: number
          name?: string
          provider?: string
          service_charge?: number
          sort_order?: number
          updated_at?: string
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
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          new_balance: number
          previous_balance: number
          reference: string
          status: Database["public"]["Enums"]["txn_status"]
          type: Database["public"]["Enums"]["wallet_txn_type"]
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          new_balance: number
          previous_balance: number
          reference: string
          status?: Database["public"]["Enums"]["txn_status"]
          type: Database["public"]["Enums"]["wallet_txn_type"]
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          new_balance?: number
          previous_balance?: number
          reference?: string
          status?: Database["public"]["Enums"]["txn_status"]
          type?: Database["public"]["Enums"]["wallet_txn_type"]
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      wallet_apply: {
        Args: {
          _amount: number
          _description: string
          _reference: string
          _type: Database["public"]["Enums"]["wallet_txn_type"]
          _user_id: string
        }
        Returns: {
          amount: number
          created_at: string
          description: string | null
          id: string
          new_balance: number
          previous_balance: number
          reference: string
          status: Database["public"]["Enums"]["txn_status"]
          type: Database["public"]["Enums"]["wallet_txn_type"]
          user_id: string
          wallet_id: string
        }
        SetofOptions: {
          from: "*"
          to: "wallet_transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      account_status: "active" | "suspended" | "pending"
      app_role: "user" | "agent" | "admin"
      kyc_status: "not_started" | "pending" | "verified" | "rejected"
      service_code:
        | "airtime"
        | "data"
        | "electricity"
        | "cable"
        | "exams"
        | "nin"
      txn_status:
        | "INITIATED"
        | "PENDING"
        | "PROCESSING"
        | "SUCCESS"
        | "FAILED"
        | "REVERSED"
        | "REFUNDED"
      wallet_txn_type: "CREDIT" | "DEBIT" | "REFUND" | "REVERSAL" | "COMMISSION"
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
      account_status: ["active", "suspended", "pending"],
      app_role: ["user", "agent", "admin"],
      kyc_status: ["not_started", "pending", "verified", "rejected"],
      service_code: ["airtime", "data", "electricity", "cable", "exams", "nin"],
      txn_status: [
        "INITIATED",
        "PENDING",
        "PROCESSING",
        "SUCCESS",
        "FAILED",
        "REVERSED",
        "REFUNDED",
      ],
      wallet_txn_type: ["CREDIT", "DEBIT", "REFUND", "REVERSAL", "COMMISSION"],
    },
  },
} as const
