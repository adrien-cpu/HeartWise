/**
 * @fileOverview Speed dating service using Supabase.
 * @module SpeedDatingService
 */

import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

export type SpeedDatingSession = Database['public']['Tables']['speed_dating_sessions']['Row'];

export interface SpeedDatingFeedbackData {
  id?: string;
  user_id: string;
  session_id: string;
  partner_id: string;
  partner_name: string;
  rating: 'positive' | 'neutral' | 'negative';
  comment?: string;
  created_at?: string;
}

/**
 * Create a speed dating session
 */
export async function createSpeedDatingSession(sessionData: {
  creator_id: string;
  interests: string[];
  session_date_time: string;
  max_participants?: number;
  duration_per_round_minutes?: number;
}): Promise<string> {
  const { data, error } = await supabase
    .from('speed_dating_sessions')
    .insert({
      creator_id: sessionData.creator_id,
      date_time: sessionData.session_date_time,
      interests: sessionData.interests,
      participant_ids: [sessionData.creator_id],
      participants_count: 1,
      max_participants: sessionData.max_participants || 10,
      duration_per_round_minutes: sessionData.duration_per_round_minutes || 5,
      status: 'scheduled',
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }

  return data.id;
}

/**
 * Register for a speed dating session
 */
export async function registerForSpeedDatingSession(userId: string, sessionId: string): Promise<void> {
  // Get current session
  const { data: session, error: fetchError } = await supabase
    .from('speed_dating_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (fetchError) {
    throw new Error(`Session not found: ${fetchError.message}`);
  }

  if (session.participants_count >= session.max_participants) {
    throw new Error('Session is full');
  }

  if (session.participant_ids.includes(userId)) {
    return; // Already registered
  }

  // Update session
  const { error } = await supabase
    .from('speed_dating_sessions')
    .update({
      participant_ids: [...session.participant_ids, userId],
      participants_count: session.participants_count + 1,
      status: session.participants_count + 1 >= session.max_participants ? 'full' : 'scheduled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  if (error) {
    throw new Error(`Failed to register: ${error.message}`);
  }
}

/**
 * Find available sessions
 */
export async function findAvailableSessions(interests: string[]): Promise<SpeedDatingSession[]> {
  let query = supabase
    .from('speed_dating_sessions')
    .select('*')
    .eq('status', 'scheduled')
    .gt('date_time', new Date().toISOString())
    .order('date_time', { ascending: true })
    .limit(20);

  if (interests.length > 0) {
    query = query.overlaps('interests', interests);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to find sessions: ${error.message}`);
  }

  return data || [];
}

/**
 * Get upcoming sessions for user
 */
export async function getUpcomingSessionsForUser(userId: string): Promise<SpeedDatingSession[]> {
  const { data, error } = await supabase
    .from('speed_dating_sessions')
    .select('*')
    .contains('participant_ids', [userId])
    .order('date_time', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch user sessions: ${error.message}`);
  }

  return data || [];
}

/**
 * Submit speed dating feedback
 */
export async function submitSpeedDatingFeedback(
  feedbackData: Omit<SpeedDatingFeedbackData, 'id' | 'created_at'>
): Promise<string> {
  const { data, error } = await supabase
    .from('speed_dating_feedback')
    .insert(feedbackData)
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to submit feedback: ${error.message}`);
  }

  return data.id;
}

/**
 * Get feedback for session by user
 */
export async function getFeedbackForSessionByUser(userId: string, sessionId: string): Promise<SpeedDatingFeedbackData[]> {
  const { data, error } = await supabase
    .from('speed_dating_feedback')
    .select('*')
    .eq('user_id', userId)
    .eq('session_id', sessionId);

  if (error) {
    throw new Error(`Failed to fetch feedback: ${error.message}`);
  }

  return data || [];
}