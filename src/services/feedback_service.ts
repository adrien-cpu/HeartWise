/**
 * @fileOverview Feedback service using Supabase.
 * @module FeedbackService
 */

import { supabase } from '@/lib/supabase';

export interface RiskyWordFeedback {
  id?: string;
  user_id: string;
  original_text: string;
  flagged_word: string;
  feedback_type: 'accurate' | 'not_risky';
  analysis_item_id?: string;
  notes?: string;
  created_at?: string;
}

export interface ReportMissedRiskyWord {
  id?: string;
  user_id: string;
  original_text: string;
  missed_word: string;
  reason?: string;
  created_at?: string;
}

/**
 * Submit risky word feedback
 */
export async function submitRiskyWordFeedback(
  feedbackData: Omit<RiskyWordFeedback, 'id' | 'created_at'>
): Promise<string> {
  const { data, error } = await supabase
    .from('risky_words_feedback')
    .insert(feedbackData)
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to submit feedback: ${error.message}`);
  }

  return data.id;
}

/**
 * Report missed risky word
 */
export async function reportMissedRiskyWord(
  reportData: Omit<ReportMissedRiskyWord, 'id' | 'created_at'>
): Promise<string> {
  const { data, error } = await supabase
    .from('missed_risky_word_reports')
    .insert(reportData)
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to submit report: ${error.message}`);
  }

  return data.id;
}