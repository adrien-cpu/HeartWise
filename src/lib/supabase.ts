/**
 * @fileOverview Supabase client configuration and initialization.
 * @module supabase
 * @description Initializes and exports Supabase client for database operations.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  }
});

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
      conversations: {
        Row: {
          id: string;
          participant_ids: string[];
          last_message_text: string | null;
          last_message_timestamp: string | null;
          last_message_sender_id: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          sender_name: string;
          text: string;
          intention_tag: string | null;
          status: string;
          attachments: any;
          reply_to: any;
          is_ephemeral: boolean;
          expires_at: string | null;
          created_at: string;
        };
      };
      speed_dating_sessions: {
        Row: {
          id: string;
          creator_id: string;
          date_time: string;
          interests: string[];
          participant_ids: string[];
          participants_count: number;
          max_participants: number;
          status: string;
          participants: any;
          current_round: number;
          pairings: any;
          duration_per_round_minutes: number;
          total_rounds: number | null;
          created_at: string;
          updated_at: string;
        };
      };
      user_rewards: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          type: string;
          icon: string | null;
          date_earned: string;
          created_at: string;
        };
      };
    };
  };
};