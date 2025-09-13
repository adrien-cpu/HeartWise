/*
  # Create users table and authentication setup

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `email` (text, unique)
      - `bio` (text)
      - `profile_picture` (text)
      - `data_ai_hint` (text)
      - `interests` (text array)
      - `points` (integer, default 0)
      - `speed_dating_schedule` (text array)
      - `game_preferences` (text array)
      - `privacy_settings` (jsonb)
      - `premium_features` (jsonb)
      - `fcm_tokens` (text array)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `users` table
    - Add policies for users to read/update their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text,
  email text UNIQUE,
  bio text,
  profile_picture text,
  data_ai_hint text DEFAULT 'person',
  interests text[] DEFAULT '{}',
  points integer DEFAULT 0,
  speed_dating_schedule text[] DEFAULT '{}',
  game_preferences text[] DEFAULT '{}',
  privacy_settings jsonb DEFAULT '{"showLocation": true, "showOnlineStatus": true}',
  premium_features jsonb DEFAULT '{"advancedFilters": false, "profileBoost": false, "exclusiveModes": false}',
  fcm_tokens text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', new.email));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();