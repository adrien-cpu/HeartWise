
'use server';
/**
 * @fileOverview Provides services for managing chat conversations and messages using Firestore.
 * @module ChatService
 * @description Handles creating conversations, sending messages, and listening for real-time updates.
 */

import { 
  firestore, 
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
  limit,
  Unsubscribe
} from 'firebase/firestore';
import type { UserProfile } from './user_profile';

/**
 * @interface Message
 * @description Represents a single chat message.
 */
export interface Message {
  id: string; // Firestore document ID
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Timestamp; // Firestore Timestamp
  intentionTag?: string;
  status?: 'sent' | 'delivered' | 'read' | 'error' | 'moderated';
}

/**
 * @interface ConversationParticipant
 * @description Extends UserProfile with chat-specific details.
 */
export interface ConversationParticipant extends UserProfile {
  compatibilityScore?: number;
  isOnline?: boolean;
}

/**
 * @interface Conversation
 * @description Represents a chat conversation between users.
 */
export interface Conversation {
  id: string; // Firestore document ID
  participantIds: string[]; // Array of user IDs in the conversation
  participants: { [userId: string]: ConversationParticipant }; // Details of participants, keyed by userId
  lastMessageText?: string;
  lastMessageTimestamp?: Timestamp;
  lastMessageSenderId?: string;
  unreadCounts?: { [userId: string]: number }; // Unread count for each user
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const conversationsCollection = collection(firestore, 'conversations');

/**
 * Creates a unique conversation ID from two user IDs.
 * @param userId1 - ID of the first user.
 * @param userId2 - ID of the second user.
 * @returns A sorted, combined string for the conversation ID.
 */
const getConversationDocId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('_');
};

/**
 * Creates a new conversation in Firestore if one doesn't already exist between two users.
 * @async
 * @function createConversation
 * @param {string} currentUserId - ID of the current user initiating.
 * @param {UserProfile} currentUserProfile - Profile of the current user.
 * @param {UserProfile} targetUserProfile - Profile of the target user.
 * @returns {Promise<string>} The ID of the existing or newly created conversation.
 */
export async function createConversation(
  currentUserId: string,
  currentUserProfile: UserProfile,
  targetUserProfile: UserProfile
): Promise<string> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot create conversation.");
    throw new Error("Application services are not available.");
  }

  const conversationId = getConversationDocId(currentUserId, targetUserProfile.id);
  const conversationDocRef = doc(conversationsCollection, conversationId);

  try {
    const existingConversationSnap = await getDocs(
      query(
        conversationsCollection,
        where('participantIds', 'array-contains', currentUserId)
      )
    );

    let foundConversationId: string | null = null;
    existingConversationSnap.forEach(doc => {
      const data = doc.data() as Conversation;
      if (data.participantIds.includes(targetUserProfile.id) && data.participantIds.length === 2) {
        foundConversationId = doc.id;
      }
    });
    
    if (foundConversationId) {
      console.log(`ChatService: Conversation between ${currentUserId} and ${targetUserProfile.id} already exists: ${foundConversationId}`);
      return foundConversationId;
    }

    const now = serverTimestamp();
    const newConversationData: Omit<Conversation, 'id'> = {
      participantIds: [currentUserId, targetUserProfile.id],
      participants: {
        [currentUserId]: { ...currentUserProfile, id: currentUserId },
        [targetUserProfile.id]: { ...targetUserProfile },
      },
      lastMessageText: "Conversation started",
      lastMessageTimestamp: now as Timestamp, // Cast for typing, server will set it
      lastMessageSenderId: currentUserId, 
      unreadCounts: {
        [currentUserId]: 0,
        [targetUserProfile.id]: 0,
      },
      createdAt: now as Timestamp,
      updatedAt: now as Timestamp,
    };

    await setDoc(conversationDocRef, newConversationData);
    console.log('ChatService: New conversation created with ID:', conversationId);
    return conversationId;
  } catch (error) {
    console.error('ChatService: Error creating or getting conversation:', error);
    throw new Error('Failed to create or get conversation.');
  }
}


/**
 * Sends a message to a specific conversation.
 * @async
 * @function sendMessage
 * @param {string} conversationId - The ID of the conversation.
 * @param {Omit<Message, 'id' | 'timestamp'>} messageData - The message data to send.
 * @returns {Promise<string>} The ID of the newly created message document.
 */
export async function sendMessage(
  conversationId: string,
  messageData: Omit<Message, 'id' | 'timestamp'>
): Promise<string> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot send message.");
    throw new Error("Application services are not available.");
  }

  try {
    const messagesCollectionRef = collection(firestore, `conversations/${conversationId}/messages`);
    const now = serverTimestamp();
    const docRef = await addDoc(messagesCollectionRef, {
      ...messageData,
      timestamp: now,
    });

    // Update last message in the conversation document
    const conversationDocRef = doc(conversationsCollection, conversationId);
    await setDoc(conversationDocRef, {
      lastMessageText: messageData.text,
      lastMessageTimestamp: now,
      lastMessageSenderId: messageData.senderId,
      updatedAt: now,
      // Increment unread count for the other participant(s)
      // This requires knowing the other participant ID and handling it carefully.
      // For a 2-person chat:
      // const convSnap = await getDoc(conversationDocRef);
      // if (convSnap.exists()) {
      //   const convData = convSnap.data() as Conversation;
      //   const otherParticipantId = convData.participantIds.find(id => id !== messageData.senderId);
      //   if (otherParticipantId) {
      //     await updateDoc(conversationDocRef, {
      //       [`unreadCounts.${otherParticipantId}`]: increment(1)
      //     });
      //   }
      // }
    }, { merge: true });

    console.log('ChatService: Message sent with ID:', docRef.id, 'to conversation:', conversationId);
    
    // Conceptual: Trigger backend to send push notification to other participants
    // const conversation = (await getDoc(conversationDocRef)).data() as Conversation;
    // const recipientIds = conversation.participantIds.filter(id => id !== messageData.senderId);
    // await triggerPushNotification(recipientIds, `New message from ${messageData.senderName}`, messageData.text);

    return docRef.id;
  } catch (error) {
    console.error('ChatService: Error sending message:', error);
    throw new Error('Failed to send message.');
  }
}

/**
 * Listens for real-time updates to a user's conversations.
 * @function getConversationsListener
 * @param {string} userId - The ID of the user whose conversations to listen for.
 * @param {(conversations: Conversation[]) => void} callback - Function to call with the updated conversations list.
 * @returns {Unsubscribe} A function to unsubscribe from the listener.
 */
export function getConversationsListener(
  userId: string,
  callback: (conversations: Conversation[]) => void
): Unsubscribe {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot listen for conversations.");
    // Return a no-op unsubscribe function
    return () => {};
  }

  const q = query(
    conversationsCollection,
    where('participantIds', 'array-contains', userId),
    orderBy('updatedAt', 'desc') // Order by most recently updated
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const conversations: Conversation[] = [];
    querySnapshot.forEach((doc) => {
      conversations.push({ id: doc.id, ...doc.data() } as Conversation);
    });
    callback(conversations);
  }, (error) => {
    console.error("ChatService: Error listening to conversations:", error);
    // Optionally, notify the user through the callback or a toast
    callback([]); // Send empty array on error
  });

  return unsubscribe;
}

/**
 * Listens for real-time updates to messages within a specific conversation.
 * @function getMessagesListener
 * @param {string} conversationId - The ID of the conversation.
 * @param {(messages: Message[]) => void} callback - Function to call with the updated messages list.
 * @returns {Unsubscribe} A function to unsubscribe from the listener.
 */
export function getMessagesListener(
  conversationId: string,
  callback: (messages: Message[]) => void
): Unsubscribe {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot listen for messages.");
    return () => {};
  }
  
  const messagesCollectionRef = collection(firestore, `conversations/${conversationId}/messages`);
  const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'), limit(50)); // Get last 50 messages, ordered by time

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

// Conceptual function placeholder for triggering push notifications
// This would typically be a backend function (e.g., Cloud Function)
// async function triggerPushNotification(recipientUserIds: string[], title: string, body: string) {
//   console.log(`Conceptual: Triggering push notification to ${recipientUserIds.join(', ')}: "${title}" - "${body}"`);
//   // 1. For each recipientUserId, get their FCM tokens from their UserProfile.
//   // 2. Use Firebase Admin SDK to send messages to these tokens.
//   // Example: admin.messaging().sendToDevice(tokens, payload);
// }

// Potential future functions:
// - markMessagesAsRead(conversationId: string, userId: string)
// - updateTypingIndicator(conversationId: string, userId: string, isTyping: boolean)
// - getConversationById(conversationId: string): Promise<Conversation | null>

