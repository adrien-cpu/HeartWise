/*
  # Create user rewards table

  1. New Tables
    - `user_rewards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `name` (text)
      - `description` (text)
      - `type` (text)
      - `icon` (text)
      - `date_earned` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `user_rewards` table
    - Add policies for users to read their own rewards
*/

CREATE TABLE IF NOT EXISTS user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  type text NOT NULL,
  icon text,
  date_earned timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own rewards"
  ON user_rewards
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert rewards"
  ON user_rewards
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());