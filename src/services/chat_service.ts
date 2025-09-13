/**
 * @fileOverview Chat service using Supabase.
 * @module ChatService
 */

import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { get_user, UserProfile } from './user_profile';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  intention_tag?: string;
  status: string;
  attachments?: any;
  reply_to?: any;
  is_ephemeral: boolean;
  expires_at?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  participants: { [userId: string]: ConversationParticipant };
  last_message_text?: string;
  last_message_timestamp?: string;
  last_message_sender_id?: string;
  unread_counts: { [userId: string]: number };
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  profile_picture?: string;
  data_ai_hint?: string;
  interests?: string[];
  compatibility_score?: number;
  is_online?: boolean;
}

/**
 * Create a conversation between two users
 */
export async function createConversation(
  currentUserId: string,
  currentUserProfile: UserProfile,
  targetUserProfile: UserProfile
): Promise<string> {
  const conversationId = [currentUserId, targetUserProfile.id].sort().join('_');
  
  // Check if conversation already exists
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .single();

  if (existing) {
    return conversationId;
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      id: conversationId,
      participant_ids: [currentUserId, targetUserProfile.id],
      last_message_text: 'Conversation started',
      last_message_timestamp: new Date().toISOString(),
      last_message_sender_id: currentUserId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create conversation: ${error.message}`);
  }

  // Initialize participant records
  await supabase
    .from('conversation_participants')
    .insert([
      { conversation_id: conversationId, user_id: currentUserId, unread_count: 0 },
      { conversation_id: conversationId, user_id: targetUserProfile.id, unread_count: 0 }
    ]);

  return conversationId;
}

/**
 * Send a message
 */
export async function sendMessage(
  conversationId: string,
  messageData: Omit<Message, 'id' | 'created_at' | 'conversation_id'>
): Promise<string> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      ...messageData,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }

  // Update conversation
  await supabase
    .from('conversations')
    .update({
      last_message_text: messageData.text,
      last_message_timestamp: new Date().toISOString(),
      last_message_sender_id: messageData.sender_id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId);

  // Update unread counts
  const { data: participants } = await supabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', conversationId);

  if (participants) {
    for (const participant of participants) {
      if (participant.user_id !== messageData.sender_id) {
        await supabase.rpc('increment_unread_count', {
          conv_id: conversationId,
          user_id: participant.user_id
        });
      } else {
        await supabase
          .from('conversation_participants')
          .update({ unread_count: 0 })
          .eq('conversation_id', conversationId)
          .eq('user_id', participant.user_id);
      }
    }
  }

  return data.id;
}

/**
 * Get conversations for a user
 */
export async function getConversationsListener(
  userId: string,
  callback: (conversations: Conversation[]) => void
): Promise<() => void> {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      conversation_participants!inner(unread_count)
    `)
    .contains('participant_ids', [userId])
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    callback([]);
    return () => {};
  }

  // Transform data
  const conversations: Conversation[] = data.map(conv => ({
    ...conv,
    participants: {}, // Would need to fetch participant details
    unread_counts: {}, // Would need to map from conversation_participants
  }));

  callback(conversations);

  // Set up real-time subscription
  const subscription = supabase
    .channel('conversations')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'conversations',
      filter: `participant_ids.cs.{${userId}}`
    }, () => {
      // Refetch conversations on change
      getConversationsListener(userId, callback);
    })
    .subscribe();

  return () => subscription.unsubscribe();
}

/**
 * Get messages for a conversation
 */
export async function getMessagesListener(
  conversationId: string,
  currentUserId: string,
  callback: (messages: Message[]) => void
): Promise<() => void> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    callback([]);
    return () => {};
  }

  callback(data);

  // Mark messages as read
  await supabase
    .from('conversation_participants')
    .update({ unread_count: 0 })
    .eq('conversation_id', conversationId)
    .eq('user_id', currentUserId);

  // Set up real-time subscription
  const subscription = supabase
    .channel(`messages:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, () => {
      // Refetch messages on new message
      getMessagesListener(conversationId, currentUserId, callback);
    })
    .subscribe();

  return () => subscription.unsubscribe();
}

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  await supabase
    .from('conversation_participants')
    .update({ unread_count: 0 })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);
}