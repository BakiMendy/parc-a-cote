export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      comments: {
        Row: {
          id: string
          playground_id: string
          content: string
          rating: number
          author_id: string
          created_at: string
        }
        Insert: {
          id?: string
          playground_id: string
          content: string
          rating: number
          author_id: string
          created_at?: string
        }
        Update: {
          id?: string
          playground_id?: string
          content?: string
          rating?: number
          author_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_playground_id_fkey"
            columns: ["playground_id"]
            referencedRelation: "playgrounds"
            referencedColumns: ["id"]
          }
        ]
      }
      playground_images: {
        Row: {
          id: string
          playground_id: string
          url: string
          name: string
          status: "pending" | "approved" | "rejected"
          created_at: string
        }
        Insert: {
          id?: string
          playground_id: string
          url: string
          name: string
          status?: "pending" | "approved" | "rejected"
          created_at?: string
        }
        Update: {
          id?: string
          playground_id?: string
          url?: string
          name?: string
          status?: "pending" | "approved" | "rejected"
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "playground_images_playground_id_fkey"
            columns: ["playground_id"]
            referencedRelation: "playgrounds"
            referencedColumns: ["id"]
          }
        ]
      }
      playground_equipments: {
        Row: {
          id: string
          playground_id: string
          equipment_id: string
        }
        Insert: {
          id?: string
          playground_id: string
          equipment_id: string
        }
        Update: {
          id?: string
          playground_id?: string
          equipment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playground_equipments_playground_id_fkey"
            columns: ["playground_id"]
            referencedRelation: "playgrounds"
            referencedColumns: ["id"]
          }
        ]
      }
      playgrounds: {
        Row: {
          id: string
          name: string
          description: string
          address: string
          city: string
          postal_code: string
          latitude: number
          longitude: number
          age_range: string
          status: "pending" | "approved" | "rejected"
          rejection_reason: string | null
          created_at: string
          updated_at: string
          submitted_by: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          address: string
          city: string
          postal_code: string
          latitude: number
          longitude: number
          age_range: string
          status?: "pending" | "approved" | "rejected"
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
          submitted_by: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          address?: string
          city?: string
          postal_code?: string
          latitude?: number
          longitude?: number
          age_range?: string
          status?: "pending" | "approved" | "rejected"
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "playgrounds_submitted_by_fkey"
            columns: ["submitted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: "user" | "admin"
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "user" | "admin"
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "user" | "admin"
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
  }
}