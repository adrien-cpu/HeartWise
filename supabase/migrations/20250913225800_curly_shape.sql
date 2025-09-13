/*
  # Create feedback and analytics tables

  1. New Tables
    - `risky_words_feedback`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `original_text` (text)
      - `flagged_word` (text)
      - `feedback_type` (text)
      - `analysis_item_id` (text)
      - `notes` (text)
      - `created_at` (timestamptz)

    - `missed_risky_word_reports`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `original_text` (text)
      - `missed_word` (text)
      - `reason` (text)
      - `created_at` (timestamptz)

    - `user_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `event_type` (text)
      - `event_name` (text)
      - `properties` (jsonb)
      - `session_id` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
*/

-- Risky words feedback
CREATE TABLE IF NOT EXISTS risky_words_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  original_text text NOT NULL,
  flagged_word text NOT NULL,
  feedback_type text NOT NULL CHECK (feedback_type IN ('accurate', 'not_risky')),
  analysis_item_id text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Missed risky word reports
CREATE TABLE IF NOT EXISTS missed_risky_word_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  original_text text NOT NULL,
  missed_word text NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- User events for analytics
CREATE TABLE IF NOT EXISTS user_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('page_view', 'feature_use', 'interaction', 'conversion', 'error')),
  event_name text NOT NULL,
  properties jsonb DEFAULT '{}',
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE risky_words_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE missed_risky_word_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

-- Policies for risky words feedback
CREATE POLICY "Users can manage own risky words feedback"
  ON risky_words_feedback
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for missed word reports
CREATE POLICY "Users can manage own missed word reports"
  ON missed_risky_word_reports
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for user events
CREATE POLICY "Users can manage own events"
  ON user_events
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_risky_words_feedback_user ON risky_words_feedback(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_missed_reports_user ON missed_risky_word_reports(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_events_user_type ON user_events(user_id, event_type, created_at DESC);