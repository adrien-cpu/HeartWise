'use server';
/**
 * @fileOverview Provides services for managing chat conversations and messages using Firestore.
 * @module ChatService
 * @description Handles creating conversations, sending messages, and listening for real-time updates.
 */

import {
  db,
  criticalConfigError
} from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  doc,
  setDoc,
  getDocs,
  getDoc,
  limit,
  Unsubscribe,
  updateDoc,
  increment,
  FieldValue // Import FieldValue
} from 'firebase/firestore';
import type { UserProfile } from './user_profile';
// import { triggerPushNotification } from './notification_trigger_service'; // Conceptual

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Timestamp | FieldValue;
  intentionTag?: string;
  status?: 'sent' | 'delivered' | 'read' | 'error' | 'moderated';
  attachments?: Array<{
    type: 'image' | 'file' | 'audio' | 'video';
    url: string;
    name: string;
    size?: number;
  }>;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  isEphemeral?: boolean;
  expiresAt?: Date;
}

export interface ConversationParticipant extends Pick<UserProfile, 'id' | 'name' | 'profilePicture' | 'dataAiHint' | 'interests'> {
  compatibilityScore?: number;
  isOnline?: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: { [userId: string]: ConversationParticipant };
  lastMessageText?: string;
  lastMessageTimestamp?: Timestamp | FieldValue; // Allow FieldValue
  lastMessageSenderId?: string;
  unreadCounts: { [userId: string]: number | FieldValue }; // Allow FieldValue for increment
  createdAt: Timestamp | FieldValue; // Allow FieldValue
  updatedAt: Timestamp | FieldValue; // Allow FieldValue
}

const conversationsCollection = collection(db, 'conversations');

const getConversationDocId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('_');
};

export async function createConversation(
  currentUserId: string,
  currentUserProfile: UserProfile,
  targetUserProfile: UserProfile
): Promise<string> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot create conversation.");
    throw new Error("Application services are not available.");
  }
  if (!currentUserId || !currentUserProfile || !targetUserProfile || !targetUserProfile.id) {
    throw new Error("Invalid user profiles provided for conversation creation.");
  }

  const conversationId = getConversationDocId(currentUserId, targetUserProfile.id);
  const conversationDocRef = doc(conversationsCollection, conversationId);

  try {
    const docSnap = await getDoc(conversationDocRef);
    if (docSnap.exists()) {
      console.log(`ChatService: Conversation between ${currentUserId} and ${targetUserProfile.id} already exists: ${conversationId}`);
      return conversationId;
    }

    const now = serverTimestamp();
    const newConversationData: Omit<Conversation, 'id'> = {
      participantIds: [currentUserId, targetUserProfile.id],
      participants: {
        [currentUserId]: {
          id: currentUserId,
          name: currentUserProfile.name || 'User',
          profilePicture: currentUserProfile.profilePicture || '',
          dataAiHint: currentUserProfile.dataAiHint || 'person',
          interests: currentUserProfile.interests || [],
        },
        [targetUserProfile.id]: {
          id: targetUserProfile.id,
          name: targetUserProfile.name || 'User',
          profilePicture: targetUserProfile.profilePicture || '',
          dataAiHint: targetUserProfile.dataAiHint || 'person',
          interests: targetUserProfile.interests || [],
        },
      },
      lastMessageText: "Conversation started",
      lastMessageTimestamp: now,
      lastMessageSenderId: currentUserId,
      unreadCounts: {
        [currentUserId]: 0,
        [targetUserProfile.id]: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(conversationDocRef, newConversationData);
    console.log('ChatService: New conversation created with ID:', conversationId);
    return conversationId;
  } catch (error) {
    console.error('ChatService: Error creating or getting conversation:', error);
    throw new Error('Failed to create or get conversation.');
  }
}

export async function sendMessage(
  conversationId: string,
  messageData: Omit<Message, 'id' | 'timestamp'>
): Promise<string> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot send message.");
    throw new Error("Application services are not available.");
  }

  try {
    const messagesCollectionRef = collection(db, `conversations/${conversationId}/messages`);
    const nowServer = serverTimestamp();

    const docRef = await addDoc(messagesCollectionRef, {
      ...messageData,
      timestamp: nowServer,
    });

    const conversationDocRef = doc(conversationsCollection, conversationId);
    const convSnap = await getDoc(conversationDocRef);

    if (convSnap.exists()) {
      const convData = convSnap.data() as Conversation;
      const updatePayload: Partial<Conversation> = {
        lastMessageText: messageData.text,
        lastMessageTimestamp: nowServer,
        lastMessageSenderId: messageData.senderId,
        updatedAt: nowServer,
        unreadCounts: { ...convData.unreadCounts },
      };

      convData.participantIds.forEach(participantId => {
        if (participantId !== messageData.senderId) {
          if (updatePayload.unreadCounts) {
            updatePayload.unreadCounts[participantId] = increment(1);
          }
        } else {
          if (updatePayload.unreadCounts) {
            updatePayload.unreadCounts[participantId] = 0;
          }
        }
      });
      await updateDoc(conversationDocRef, updatePayload);

      const recipientIds = convData.participantIds.filter(id => id !== messageData.senderId);
      // console.log(`// TODO: Trigger cloud function 'sendChatMessageNotification' with { conversationId: "${conversationId}", senderName: "${messageData.senderName}", messageText: "${messageData.text.substring(0,30)}...", recipientIds: ["${recipientIds.join('", "')}"] }`);
      // await triggerPushNotification(recipientIds, `New message from ${messageData.senderName}`, messageData.text, { conversationId });
    }

    console.log('ChatService: Message sent with ID:', docRef.id, 'to conversation:', conversationId);
    return docRef.id;
  } catch (error) {
    console.error('ChatService: Error sending message:', error);
    throw new Error('Failed to send message.');
  }
}

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot mark messages as read.");
    return;
  }
  const conversationDocRef = doc(conversationsCollection, conversationId);
  try {
    await updateDoc(conversationDocRef, {
      [`unreadCounts.${userId}`]: 0,
      updatedAt: serverTimestamp()
    });
    console.log(`ChatService: Messages marked as read for user ${userId} in conversation ${conversationId}`);
  } catch (error) {
    console.error(`ChatService: Error marking messages as read for user ${userId} in conv ${conversationId}:`, error);
  }
}

export async function getConversationsListener(
  userId: string,
  callback: (conversations: Conversation[]) => void
): Promise<Unsubscribe> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot listen for conversations.");
    return () => { };
  }

  const q = query(
    conversationsCollection,
    where('participantIds', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const conversations: Conversation[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const unreadCounts = data.unreadCounts && typeof data.unreadCounts === 'object' ? data.unreadCounts : {};
      conversations.push({
        id: doc.id,
        ...data,
        unreadCounts: unreadCounts,
      } as Conversation);
    });
    callback(conversations);
  }, (error) => {
    console.error("ChatService: Error listening to conversations:", error);
    callback([]);
  });

  return unsubscribe;
}

export async function getMessagesListener(
  conversationId: string,
  currentUserId: string,
  callback: (messages: Message[]) => void
): Promise<Unsubscribe> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot listen for messages.");
    return () => { };
  }

  await markMessagesAsRead(conversationId, currentUserId).catch(err => {
    console.error("Failed to mark messages as read on listener attach:", err);
  });

  const messagesCollectionRef = collection(db, `conversations/${conversationId}/messages`);
  const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'), limit(100));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messages: Message[] = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as Message);
    });
    callback(messages);
  }, (error) => {
    console.error(`ChatService: Error listening to messages for conversation ${conversationId}:`, error);
    callback([]);
  });

  return unsubscribe;
}
