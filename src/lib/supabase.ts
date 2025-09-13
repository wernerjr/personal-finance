import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type Database = {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string
          user_mail: string
          description: string
          value: number
          type: 'food' | 'study' | 'transport' | 'fun' | 'other'
          created_at: string
          updated_at: string
          user_ip: string
        }
        Insert: {
          id?: string
          user_mail: string
          description: string
          value: number
          type: 'food' | 'study' | 'transport' | 'fun' | 'other'
          created_at?: string
          updated_at?: string
          user_ip: string
        }
        Update: {
          id?: string
          user_mail?: string
          description?: string
          value?: number
          type?: 'food' | 'study' | 'transport' | 'fun' | 'other'
          created_at?: string
          updated_at?: string
          user_ip?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_mail: string
          api_key: string
          created_at: string
          revoked: boolean
        }
        Insert: {
          id?: string
          user_mail: string
          api_key: string
          created_at?: string
          revoked?: boolean
        }
        Update: {
          id?: string
          user_mail?: string
          api_key?: string
          created_at?: string
          revoked?: boolean
        }
      }
    }
  }
}
