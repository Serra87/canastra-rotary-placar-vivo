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
      duplas: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          id: string
          jogador1: string
          jogador2: string
          nome_dupla: string
          telefone: string | null
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          id?: string
          jogador1: string
          jogador2: string
          nome_dupla: string
          telefone?: string | null
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          id?: string
          jogador1?: string
          jogador2?: string
          nome_dupla?: string
          telefone?: string | null
        }
        Relationships: []
      }
      imagens: {
        Row: {
          caminho_storage: string
          criado_em: string | null
          descricao: string | null
          id: string
          nome_arquivo: string
        }
        Insert: {
          caminho_storage: string
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nome_arquivo: string
        }
        Update: {
          caminho_storage?: string
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nome_arquivo?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          completed: boolean
          created_at: string | null
          end_time: string | null
          id: string
          in_progress: boolean
          round: string
          score_a: number
          score_b: number
          start_time: string | null
          table_number: number | null
          team_a_id: string | null
          team_b_id: string | null
          tournament_id: string | null
          updated_at: string | null
          winner_id: string | null
        }
        Insert: {
          completed?: boolean
          created_at?: string | null
          end_time?: string | null
          id?: string
          in_progress?: boolean
          round: string
          score_a?: number
          score_b?: number
          start_time?: string | null
          table_number?: number | null
          team_a_id?: string | null
          team_b_id?: string | null
          tournament_id?: string | null
          updated_at?: string | null
          winner_id?: string | null
        }
        Update: {
          completed?: boolean
          created_at?: string | null
          end_time?: string | null
          id?: string
          in_progress?: boolean
          round?: string
          score_a?: number
          score_b?: number
          start_time?: string | null
          table_number?: number | null
          team_a_id?: string | null
          team_b_id?: string | null
          tournament_id?: string | null
          updated_at?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_team_a_id_fkey"
            columns: ["team_a_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_b_id_fkey"
            columns: ["team_b_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          eliminated: boolean
          id: string
          lives: number
          name: string
          player1: string
          player2: string
          reentered: boolean
          total_points: number
          tournament_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          eliminated?: boolean
          id?: string
          lives?: number
          name: string
          player1: string
          player2: string
          reentered?: boolean
          total_points?: number
          tournament_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          eliminated?: boolean
          id?: string
          lives?: number
          name?: string
          player1?: string
          player2?: string
          reentered?: boolean
          total_points?: number
          tournament_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string | null
          current_round: string
          date: string
          id: string
          location: string
          max_round: number
          name: string
          points_to_win: number
          reentry_allowed_until_round: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_round?: string
          date: string
          id?: string
          location: string
          max_round?: number
          name: string
          points_to_win?: number
          reentry_allowed_until_round?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_round?: string
          date?: string
          id?: string
          location?: string
          max_round?: number
          name?: string
          points_to_win?: number
          reentry_allowed_until_round?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          criado_em: string | null
          email: string
          id: string
          senha_hash: string
        }
        Insert: {
          criado_em?: string | null
          email: string
          id?: string
          senha_hash: string
        }
        Update: {
          criado_em?: string | null
          email?: string
          id?: string
          senha_hash?: string
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
    Enums: {},
  },
} as const
