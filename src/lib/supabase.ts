/**
 * @fileOverview Supabase client configuration and initialization.
 * @module supabase
 * @description Initializes and exports Supabase client for database operations.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please configure Supabase connection.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    }
  }
);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          bio: string | null;
          profile_picture: string | null;
          data_ai_hint: string | null;
          interests: string[];
          points: number;
          speed_dating_schedule: string[];
          game_preferences: string[];
          privacy_settings: any;
          premium_features: any;
          fcm_tokens: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          bio?: string | null;
          profile_picture?: string | null;
          data_ai_hint?: string | null;
          interests?: string[];
          points?: number;
          speed_dating_schedule?: string[];
          game_preferences?: string[];
          privacy_settings?: any;
          premium_features?: any;
          fcm_tokens?: string[];
        };
        Update: {
          name?: string | null;
          bio?: string | null;
          profile_picture?: string | null;
          data_ai_hint?: string | null;
          interests?: string[];
          points?: number;
          speed_dating_schedule?: string[];
          game_preferences?: string[];
          privacy_settings?: any;
          premium_features?: any;
          fcm_tokens?: string[];
          updated_at?: string;
        };
      };
    };
  };
};