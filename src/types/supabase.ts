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
      devotees: {
        Row: {
          id: string
          first_name: string
          city: string
          country: string
          spiritual_name: string | null
          years_on_path: number | null
          lesson_number: number | null
          profession: string | null
          background: string | null
          favorite_quote: string | null
          favorite_chant: string | null
          location: Json
          is_approved: boolean
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          city: string
          country: string
          spiritual_name?: string | null
          years_on_path?: number | null
          lesson_number?: number | null
          profession?: string | null
          background?: string | null
          favorite_quote?: string | null
          favorite_chant?: string | null
          location: Json
          is_approved?: boolean
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          city?: string
          country?: string
          spiritual_name?: string | null
          years_on_path?: number | null
          lesson_number?: number | null
          profession?: string | null
          background?: string | null
          favorite_quote?: string | null
          favorite_chant?: string | null
          location?: Json
          is_approved?: boolean
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      prayer_requests: {
        Row: {
          id: string
          title: string
          description: string
          is_anonymous: boolean
          requester_id: string | null
          requester_name: string | null
          status: 'active' | 'fulfilled' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          is_anonymous?: boolean
          requester_id?: string | null
          requester_name?: string | null
          status?: 'active' | 'fulfilled' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          is_anonymous?: boolean
          requester_id?: string | null
          requester_name?: string | null
          status?: 'active' | 'fulfilled' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
      prayer_responses: {
        Row: {
          id: string
          request_id: string
          responder_id: string | null
          responder_name: string
          message: string
          is_private: boolean
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          responder_id?: string | null
          responder_name: string
          message: string
          is_private?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          responder_id?: string | null
          responder_name?: string
          message?: string
          is_private?: boolean
          created_at?: string
        }
      }
      prayer_beacons: {
        Row: {
          id: string
          location: Json
          participants: number
          started_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          location: Json
          participants?: number
          started_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          location?: Json
          participants?: number
          started_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      centers: {
        Row: {
          id: string
          name: string
          city: string
          country: string
          region: string
          location: Json
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          city: string
          country: string
          region: string
          location: Json
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          city?: string
          country?: string
          region?: string
          location?: Json
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      convocation_moments: {
        Row: {
          id: string
          title: string
          description: string | null
          image_url: string | null
          video_url: string | null
          location: Json | null
          center_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          image_url?: string | null
          video_url?: string | null
          location?: Json | null
          center_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          video_url?: string | null
          location?: Json | null
          center_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      devotee_analytics: {
        Row: {
          id: string
          center_id: string
          region: string
          total_devotees: number
          active_devotees: number
          new_devotees: number
          years_on_path_distribution: Json
          lesson_distribution: Json
          profession_distribution: Json
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          center_id: string
          region: string
          total_devotees?: number
          active_devotees?: number
          new_devotees?: number
          years_on_path_distribution?: Json
          lesson_distribution?: Json
          profession_distribution?: Json
          date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          center_id?: string
          region?: string
          total_devotees?: number
          active_devotees?: number
          new_devotees?: number
          years_on_path_distribution?: Json
          lesson_distribution?: Json
          profession_distribution?: Json
          date?: string
          created_at?: string
          updated_at?: string
        }
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