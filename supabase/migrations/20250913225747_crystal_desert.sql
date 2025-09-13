/*
  # Create speed dating tables

  1. New Tables
    - `speed_dating_sessions`
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references users)
      - `date_time` (timestamptz)
      - `interests` (text array)
      - `participant_ids` (uuid array)
      - `participants_count` (integer)
      - `max_participants` (integer)
      - `status` (text)
      - `participants` (jsonb)
      - `current_round` (integer)
      - `pairings` (jsonb)
      - `duration_per_round_minutes` (integer)
      - `total_rounds` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `speed_dating_feedback`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `session_id` (uuid, references speed_dating_sessions)
      - `partner_id` (text)
      - `partner_name` (text)
      - `rating` (text)
      - `comment` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Speed dating sessions
CREATE TABLE IF NOT EXISTS speed_dating_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date_time timestamptz NOT NULL,
  interests text[] DEFAULT '{}',
  participant_ids uuid[] DEFAULT '{}',
  participants_count integer DEFAULT 0,
  max_participants integer DEFAULT 10,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'full', 'cancelled')),
  participants jsonb DEFAULT '{}',
  current_round integer DEFAULT 0,
  pairings jsonb DEFAULT '[]',
  duration_per_round_minutes integer DEFAULT 5,
  total_rounds integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Speed dating feedback
CREATE TABLE IF NOT EXISTS speed_dating_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES speed_dating_sessions(id) ON DELETE CASCADE NOT NULL,
  partner_id text NOT NULL,
  partner_name text NOT NULL,
  rating text NOT NULL CHECK (rating IN ('positive', 'neutral', 'negative')),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE speed_dating_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE speed_dating_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for speed dating sessions
CREATE POLICY "Users can read all sessions"
  ON speed_dating_sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create sessions"
  ON speed_dating_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can update their sessions"
  ON speed_dating_sessions
  FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid());

-- Policies for feedback
CREATE POLICY "Users can read own feedback"
  ON speed_dating_feedback
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own feedback"
  ON speed_dating_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_speed_dating_sessions_date ON speed_dating_sessions(date_time);
CREATE INDEX IF NOT EXISTS idx_speed_dating_sessions_status ON speed_dating_sessions(status);
CREATE INDEX IF NOT EXISTS idx_speed_dating_feedback_session ON speed_dating_feedback(session_id, user_id);