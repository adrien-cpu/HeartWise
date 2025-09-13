/*
  # Create conversations and messages tables

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `participant_ids` (uuid array)
      - `last_message_text` (text)
      - `last_message_timestamp` (timestamptz)
      - `last_message_sender_id` (uuid)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversations)
      - `sender_id` (uuid, references users)
      - `sender_name` (text)
      - `text` (text)
      - `intention_tag` (text)
      - `status` (text)
      - `attachments` (jsonb)
      - `reply_to` (jsonb)
      - `is_ephemeral` (boolean)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)

    - `conversation_participants`
      - `conversation_id` (uuid, references conversations)
      - `user_id` (uuid, references users)
      - `unread_count` (integer)
      - `joined_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for participants to access their conversations
*/

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_ids uuid[] NOT NULL,
  last_message_text text,
  last_message_timestamp timestamptz,
  last_message_sender_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  sender_name text NOT NULL,
  text text NOT NULL,
  intention_tag text,
  status text DEFAULT 'sent',
  attachments jsonb DEFAULT '[]',
  reply_to jsonb,
  is_ephemeral boolean DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Conversation participants for unread counts
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  unread_count integer DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Policies for conversations
CREATE POLICY "Users can access their conversations"
  ON conversations
  FOR ALL
  TO authenticated
  USING (auth.uid() = ANY(participant_ids));

-- Policies for messages
CREATE POLICY "Users can read messages in their conversations"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND auth.uid() = ANY(participant_ids)
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND auth.uid() = ANY(participant_ids)
    )
    AND sender_id = auth.uid()
  );

-- Policies for conversation participants
CREATE POLICY "Users can manage their participation"
  ON conversation_participants
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN(participant_ids);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_expires ON messages(expires_at) WHERE expires_at IS NOT NULL;