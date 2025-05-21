
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
  getDoc, // Added getDoc
  limit,
  Unsubscribe,
  updateDoc, // Added updateDoc
  increment // Added increment
} from 'firebase/firestore';
import type { UserProfile } from './user_profile';
// Conceptual: Import a function to trigger backend push notifications
// import { triggerPushNotification } from './notification_trigger_service'; // This service would use Firebase Admin SDK

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
export interface ConversationParticipant extends Pick<UserProfile, 'id' | 'name' | 'profilePicture' | 'dataAiHint' | 'interests'> {
  compatibilityScore?: number; // Example: Could be pre-calculated and stored
  isOnline?: boolean; // Example: Would require presence management
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
  unreadCounts: { [userId: string]: number }; // Unread count for each user
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

    const now = serverTimestamp() as Timestamp; // Cast for typing, server will set it
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
    const nowServer = serverTimestamp(); // Use serverTimestamp for all timestamp operations

    const docRef = await addDoc(messagesCollectionRef, {
      ...messageData,
      timestamp: nowServer,
    });

    // Update last message and unread counts in the conversation document
    const conversationDocRef = doc(conversationsCollection, conversationId);
    const convSnap = await getDoc(conversationDocRef);

    if (convSnap.exists()) {
      const convData = convSnap.data() as Conversation;
      const updatePayload: Partial<Conversation> & { unreadCounts?: { [key: string]: any } } = {
        lastMessageText: messageData.text,
        lastMessageTimestamp: nowServer as Timestamp,
        lastMessageSenderId: messageData.senderId,
        updatedAt: nowServer as Timestamp,
        unreadCounts: { ...convData.unreadCounts }, // Start with existing counts
      };

      // Increment unread count for other participant(s)
      convData.participantIds.forEach(participantId => {
        if (participantId !== messageData.senderId) {
          if (updatePayload.unreadCounts) { // Type guard
            updatePayload.unreadCounts[participantId] = increment(1);
          }
        } else {
           // Reset unread count for the sender
           if (updatePayload.unreadCounts) {
             updatePayload.unreadCounts[participantId] = 0;
           }
        }
      });
      await updateDoc(conversationDocRef, updatePayload);

      // Conceptual: Trigger push notification to other participants
      const recipientIds = convData.participantIds.filter(id => id !== messageData.senderId);
      // await triggerPushNotification(recipientIds, `New message from ${messageData.senderName}`, messageData.text, { conversationId });
      console.log(`Conceptual: Would trigger push notification for new message in ${conversationId} to ${recipientIds.join(', ')}`);
    }

    console.log('ChatService: Message sent with ID:', docRef.id, 'to conversation:', conversationId);
    return docRef.id;
  } catch (error) {
    console.error('ChatService: Error sending message:', error);
    throw new Error('Failed to send message.');
  }
}

/**
 * Marks messages as read for a user in a conversation.
 * This typically means resetting their unread count for that conversation.
 * @async
 * @function markMessagesAsRead
 * @param {string} conversationId - The ID of the conversation.
 * @param {string} userId - The ID of the user for whom messages are being marked as read.
 * @returns {Promise<void>}
 */
export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot mark messages as read.");
    return;
  }
  const conversationDocRef = doc(conversationsCollection, conversationId);
  try {
    await updateDoc(conversationDocRef, {
      [`unreadCounts.${userId}`]: 0,
      updatedAt: serverTimestamp() // Optionally update updatedAt timestamp
    });
    console.log(`ChatService: Messages marked as read for user ${userId} in conversation ${conversationId}`);
  } catch (error) {
    console.error(`ChatService: Error marking messages as read for user ${userId} in conv ${conversationId}:`, error);
    // Don't throw, as this is often a background operation
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
    return () => {};
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
      conversations.push({
        id: doc.id,
        participantIds: data.participantIds,
        participants: data.participants,
        lastMessageText: data.lastMessageText,
        lastMessageTimestamp: data.lastMessageTimestamp,
        lastMessageSenderId: data.lastMessageSenderId,
        unreadCounts: data.unreadCounts || {}, // Ensure unreadCounts exists
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as Conversation);
    });
    callback(conversations);
  }, (error) => {
    console.error("ChatService: Error listening to conversations:", error);
    callback([]);
  });

  return unsubscribe;
}

/**
 * Listens for real-time updates to messages within a specific conversation.
 * Also marks messages as read for the current user when they view the conversation.
 * @function getMessagesListener
 * @param {string} conversationId - The ID of the conversation.
 * @param {string} currentUserId - The ID of the current user (to mark messages as read).
 * @param {(messages: Message[]) => void} callback - Function to call with the updated messages list.
 * @returns {Unsubscribe} A function to unsubscribe from the listener.
 */
export function getMessagesListener(
  conversationId: string,
  currentUserId: string,
  callback: (messages: Message[]) => void
): Unsubscribe {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot listen for messages.");
    return () => {};
  }

  // Mark messages as read when this listener is attached (i.e., user opens the chat)
  markMessagesAsRead(conversationId, currentUserId).catch(err => {
    console.error("Failed to mark messages as read on listener attach:", err);
  });

  const messagesCollectionRef = collection(firestore, `conversations/${conversationId}/messages`);
  const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'), limit(100)); // Get last 100 messages

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

// Conceptual: Placeholder for actual push notification triggering service.
// This would typically live in a backend environment (e.g., Firebase Cloud Functions)
// and use the Firebase Admin SDK.
// async function triggerPushNotification(
//   recipientUserIds: string[],
//   title: string,
//   body: string,
//   data?: { [key: string]: string }
// ) {
//   if (criticalConfigError) return;
//   console.log(`[Conceptual] ChatService: Triggering push notification to users: ${recipientUserIds.join(', ')}`);
//   console.log(`[Conceptual] Title: ${title}, Body: ${body}, Data:`, data);

//   for (const userId of recipientUserIds) {
//     const userProfile = await get_user(userId); // Assuming get_user can be called from backend context
//     if (userProfile && userProfile.fcmTokens && userProfile.fcmTokens.length > 0) {
//       // Placeholder for Firebase Admin SDK messaging logic
//       // e.g., admin.messaging().sendToDevice(userProfile.fcmTokens, { notification: { title, body }, data });
//       console.log(`[Conceptual] Would send push to user ${userId} with tokens: ${userProfile.fcmTokens.join(', ')}`);
//     } else {
//       console.log(`[Conceptual] User ${userId} has no FCM tokens or profile not found.`);
//     }
//   }
// }

// Potential future functions:
// - updateTypingIndicator(conversationId: string, userId: string, isTyping: boolean)
// - getConversationById(conversationId: string): Promise<Conversation | null>
// - blockUserInConversation(conversationId: string, currentUserId: string, targetUserId: string)
