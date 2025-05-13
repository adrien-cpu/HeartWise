'use server';
/**
 * @fileOverview Provides services for managing speed dating sessions and feedback.
 * @module SpeedDatingService
 * @description This module contains functions for submitting and retrieving speed dating feedback,
 *              and potentially managing speed dating sessions in the future.
 *              Feedback is stored in Firestore.
 */

import { firestore, criticalConfigError } from '@/lib/firebase';
import { collection, addDoc, Timestamp, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import type { UserProfile } from './user_profile'; // Assuming UserProfile might be relevant for participant info

/**
 * @interface SpeedDatingFeedbackData
 * @description Defines the structure for feedback submitted by a user about a partner met during a speed dating session.
 */
export interface SpeedDatingFeedbackData {
  /** @property {string} [id] - Firestore document ID (auto-generated). */
  id?: string;
  /** @property {string} userId - ID of the user providing the feedback. */
  userId: string;
  /** @property {string} sessionId - ID of the speed dating session. */
  sessionId: string;
  /** @property {string} partnerId - ID of the partner being reviewed. */
  partnerId: string;
  /** @property {string} partnerName - Name of the partner being reviewed (for context). */
  partnerName: string;
  /** @property {'positive' | 'neutral' | 'negative' | ''} rating - The user's rating of the partner. */
  rating: 'positive' | 'neutral' | 'negative' | '';
  /** @property {string} [comment] - Optional comments about the partner. */
  comment?: string;
  /** @property {Timestamp} timestamp - Timestamp of when the feedback was submitted. */
  timestamp: Timestamp;
}

/**
 * @interface SpeedDatingSession
 * @description Represents a speed dating session. (Matches the one in speed-dating/page.tsx)
 */
export interface SpeedDatingSession {
  id: string;
  dateTime: Date | Timestamp; // Allow both for flexibility, convert to Timestamp for Firestore
  interests: string[];
  participantsCount: number;
  status: 'scheduled' | 'completed' | 'in-progress';
  feedbackSubmitted?: boolean;
  // Potentially add a list of participant IDs or UserProfile snippets if needed by the service
  // participants?: Pick<UserProfile, 'id' | 'name' | 'profilePicture'>[];
}


/**
 * Submits feedback for a speed dating partner to Firestore.
 * @async
 * @function submitSpeedDatingFeedback
 * @param {Omit<SpeedDatingFeedbackData, 'id' | 'timestamp'>} feedbackData - The feedback data to submit.
 * @returns {Promise<string>} The ID of the newly created feedback document in Firestore.
 * @throws {Error} If submission to Firestore fails or Firebase is not configured.
 */
export async function submitSpeedDatingFeedback(
  feedbackData: Omit<SpeedDatingFeedbackData, 'id' | 'timestamp'>
): Promise<string> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot submit speed dating feedback.");
    throw new Error("Application services are not available. Please try again later.");
  }

  try {
    const feedbackCollectionRef = collection(firestore, 'speedDatingFeedback');
    const docRef = await addDoc(feedbackCollectionRef, {
      ...feedbackData,
      timestamp: serverTimestamp(), // Use server timestamp for consistency
    });
    console.log('Speed dating feedback submitted with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting speed dating feedback:', error);
    // Consider more specific error handling or re-throwing a custom error
    throw new Error('Failed to submit speed dating feedback to Firestore.');
  }
}

/**
 * Retrieves all feedback submitted by a specific user for a specific session.
 * This could be used to check if feedback has already been given for certain partners in a session.
 * @async
 * @function getFeedbackForSessionByUser
 * @param {string} userId - The ID of the user.
 * @param {string} sessionId - The ID of the speed dating session.
 * @returns {Promise<SpeedDatingFeedbackData[]>} An array of feedback documents.
 * @throws {Error} If fetching from Firestore fails or Firebase is not configured.
 */
export async function getFeedbackForSessionByUser(userId: string, sessionId: string): Promise<SpeedDatingFeedbackData[]> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot fetch speed dating feedback.");
    throw new Error("Application services are not available. Please try again later.");
  }

  try {
    const feedbackCollectionRef = collection(firestore, 'speedDatingFeedback');
    const q = query(
      feedbackCollectionRef,
      where('userId', '==', userId),
      where('sessionId', '==', sessionId)
    );
    const querySnapshot = await getDocs(q);
    const feedbackList: SpeedDatingFeedbackData[] = [];
    querySnapshot.forEach((doc) => {
      feedbackList.push({ id: doc.id, ...doc.data() } as SpeedDatingFeedbackData);
    });
    return feedbackList;
  } catch (error) {
    console.error('Error fetching feedback for session by user:', error);
    throw new Error('Failed to retrieve speed dating feedback.');
  }
}

// Placeholder for fetching user's speed dating sessions - this would be more complex
// involving session creation, matching logic, etc. which is out of scope for just feedback persistence.
// For now, the frontend page will continue to use its mock session data.
// If actual session data were stored, this function would fetch it.
/*
export async function getUserSpeedDatingSessions(userId: string): Promise<SpeedDatingSession[]> {
  // In a real app, this would query a 'speedDatingSessions' collection, possibly
  // filtering by sessions the user is part of.
  // For now, returning an empty array as a placeholder.
  console.log(`Fetching speed dating sessions for user ${userId} - placeholder function.`);
  return [];
}
*/

// Note: The service `get_user_speed_dating_schedule` and `set_user_speed_dating_schedule`
// are in `user_profile.ts` which seems appropriate for user-specific settings.
// This service `speed_dating_service.ts` is more for session-specific data like feedback.
