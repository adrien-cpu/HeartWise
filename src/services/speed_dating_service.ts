
'use server';
/**
 * @fileOverview Provides services for managing speed dating sessions and feedback.
 * @module SpeedDatingService
 * @description This module contains functions for creating, finding, registering for,
 *              and managing speed dating sessions, as well as submitting and retrieving feedback.
 *              Data is stored in Firestore.
 */

import { firestore, criticalConfigError } from '@/lib/firebase';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  increment,
  Timestamp,
  serverTimestamp,
  query,
  where,
  getDocs,
  getDoc,
  writeBatch,
  limit
} from 'firebase/firestore';
import type { UserProfile } from './user_profile';

/**
 * @interface SpeedDatingFeedbackData
 * @description Defines the structure for feedback submitted by a user about a partner met during a speed dating session.
 */
export interface SpeedDatingFeedbackData {
  id?: string;
  userId: string;
  sessionId: string;
  partnerId: string;
  partnerName: string;
  rating: 'positive' | 'neutral' | 'negative' | '';
  comment?: string;
  timestamp: Timestamp;
}

/**
 * @interface SpeedDatingSession
 * @description Represents a speed dating session.
 */
export interface SpeedDatingSession {
  id: string; // Firestore document ID
  creatorId: string;
  dateTime: Timestamp; // Firestore Timestamp for the session
  interests: string[];
  participantIds: string[]; // IDs of registered users
  participantsCount: number; // Current number of registered users
  maxParticipants: number;
  status: 'scheduled' | 'completed' | 'in-progress' | 'full' | 'cancelled'; // Added 'cancelled' and 'full'
  createdAt: Timestamp; // Firestore Timestamp for creation
  updatedAt: Timestamp; // Firestore Timestamp for last update
  // Optional: Brief details of participants for quick display, if needed later
  // participantDetails?: { [userId: string]: { name: string, profilePicture?: string } };
}

const sessionsCollection = collection(firestore, 'speedDatingSessions');
const feedbackCollectionRef = collection(firestore, 'speedDatingFeedback');

/**
 * Creates a new speed dating session initiated by a user.
 * @async
 * @function createSpeedDatingSession
 * @param {object} sessionData - Data for the new session.
 * @param {string} sessionData.creatorId - ID of the user creating the session.
 * @param {string[]} sessionData.interests - Interests for the session.
 * @param {Timestamp} sessionData.sessionDateTime - The date and time of the session.
 * @param {number} [sessionData.maxParticipants=10] - Maximum number of participants.
 * @returns {Promise<string>} The ID of the newly created session document.
 * @throws {Error} If creation fails or Firebase is not configured.
 */
export async function createSpeedDatingSession(sessionData: {
  creatorId: string;
  interests: string[];
  sessionDateTime: Timestamp;
  maxParticipants?: number;
}): Promise<string> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot create speed dating session.");
    throw new Error("Application services are not available.");
  }

  const { creatorId, interests, sessionDateTime, maxParticipants = 10 } = sessionData;

  if (interests.length === 0) {
    throw new Error("Session must have at least one interest.");
  }
  if (sessionDateTime.toMillis() <= Timestamp.now().toMillis()) {
      throw new Error("Session date and time must be in the future.");
  }
  if (maxParticipants < 2) {
      throw new Error("Session must allow at least 2 participants.");
  }

  try {
    const now = serverTimestamp() as Timestamp; // Correct casting for serverTimestamp
    const newSessionDocRef = await addDoc(sessionsCollection, {
      creatorId,
      interests,
      dateTime: sessionDateTime,
      participantIds: [creatorId], // Creator is the first participant
      participantsCount: 1,
      maxParticipants,
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
    } as Omit<SpeedDatingSession, 'id'>);

    console.log('New speed dating session created with ID:', newSessionDocRef.id);
    return newSessionDocRef.id;
  } catch (error) {
    console.error('Error creating speed dating session:', error);
    throw new Error('Failed to create speed dating session.');
  }
}

/**
 * Registers a user for an available speed dating session.
 * @async
 * @function registerForSpeedDatingSession
 * @param {string} userId - ID of the user to register.
 * @param {string} sessionId - ID of the session to register for.
 * @returns {Promise<void>}
 * @throws {Error} If registration fails, session is full, user already registered, or Firebase not configured.
 */
export async function registerForSpeedDatingSession(userId: string, sessionId: string): Promise<void> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot register for session.");
    throw new Error("Application services are not available.");
  }

  const sessionDocRef = doc(firestore, 'speedDatingSessions', sessionId);

  try {
    const sessionSnap = await getDoc(sessionDocRef);
    if (!sessionSnap.exists()) {
      throw new Error("Session not found.");
    }

    const session = sessionSnap.data() as SpeedDatingSession;

    if (session.status === 'full') {
      throw new Error("Session is already full.");
    }
    if (session.status !== 'scheduled') {
        throw new Error("Session is not open for registration (it might be in-progress, completed, or cancelled).");
    }
    if (session.participantIds.includes(userId)) {
      throw new Error("User is already registered for this session.");
    }
    if (session.participantsCount >= session.maxParticipants) {
      // This case should ideally be caught by status 'full', but as a safeguard:
      await updateDoc(sessionDocRef, { status: 'full', updatedAt: serverTimestamp() });
      throw new Error("Session just became full. Cannot register.");
    }

    const newParticipantsCount = session.participantsCount + 1;
    const newStatus = newParticipantsCount >= session.maxParticipants ? 'full' : 'scheduled';

    await updateDoc(sessionDocRef, {
      participantIds: arrayUnion(userId),
      participantsCount: increment(1),
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
    console.log(`User ${userId} registered for session ${sessionId}. New status: ${newStatus}`);
  } catch (error) {
    console.error(`Error registering user ${userId} for session ${sessionId}:`, error);
    if (error instanceof Error) {
        throw error; // Re-throw known errors
    }
    throw new Error('Failed to register for speed dating session.');
  }
}


/**
 * Finds available speed dating sessions based on selected interests.
 * @async
 * @function findAvailableSessions
 * @param {string[]} interests - Array of interests to filter by.
 * @returns {Promise<SpeedDatingSession[]>} A list of available sessions.
 * @throws {Error} If fetching fails or Firebase not configured.
 */
export async function findAvailableSessions(interests: string[]): Promise<SpeedDatingSession[]> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot find sessions.");
    return [];
  }
  if (interests.length === 0) {
    // Fetch all available sessions if no specific interests are provided
     const qAll = query(
      sessionsCollection,
      where('status', '==', 'scheduled'),
      where('dateTime', '>', Timestamp.now()), // Only future sessions
      orderBy('dateTime', 'asc'),
      limit(20) // Limit results for performance
    );
    const querySnapshotAll = await getDocs(qAll);
    const sessionsAll: SpeedDatingSession[] = [];
    querySnapshotAll.forEach((doc) => {
      const sessionData = { id: doc.id, ...doc.data() } as SpeedDatingSession;
      // Secondary filter in code because Firestore doesn't support != or checking count < maxParticipants directly in a compound query with array-contains-any
      if (sessionData.participantsCount < sessionData.maxParticipants) {
        sessionsAll.push(sessionData);
      }
    });
    return sessionsAll;
  }


  // Note: Firestore 'array-contains-any' is good for OR conditions on a single array field.
  // If matching *multiple* interests (AND), this query needs adjustment or client-side filtering.
  // The current query finds sessions that have AT LEAST ONE of the selected interests.
  const q = query(
    sessionsCollection,
    where('interests', 'array-contains-any', interests),
    where('status', '==', 'scheduled'), // Only scheduled sessions
    where('dateTime', '>', Timestamp.now()), // Only future sessions
    orderBy('dateTime', 'asc'),
    limit(20) // Limit results
  );

  try {
    const querySnapshot = await getDocs(q);
    const sessions: SpeedDatingSession[] = [];
    querySnapshot.forEach((doc) => {
      const sessionData = { id: doc.id, ...doc.data() } as SpeedDatingSession;
      // Secondary filter in code, as Firestore doesn't support != or count < max for array fields in complex queries
      if (sessionData.participantsCount < sessionData.maxParticipants) {
        sessions.push(sessionData);
      }
    });
    return sessions;
  } catch (error) {
    console.error('Error finding available sessions:', error);
    throw new Error('Failed to find available speed dating sessions.');
  }
}

/**
 * Gets upcoming (scheduled or in-progress) sessions a user is registered for.
 * @async
 * @function getUpcomingSessionsForUser
 * @param {string} userId - The ID of the user.
 * @returns {Promise<SpeedDatingSession[]>} A list of upcoming sessions for the user.
 * @throws {Error} If fetching fails or Firebase is not configured.
 */
export async function getUpcomingSessionsForUser(userId: string): Promise<SpeedDatingSession[]> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot get user sessions.");
    return [];
  }

  const q = query(
    sessionsCollection,
    where('participantIds', 'array-contains', userId),
    where('status', 'in', ['scheduled', 'in-progress', 'full']), // User is still involved if full
    where('dateTime', '>=', Timestamp.now()), // Sessions that are now or in the future
    orderBy('dateTime', 'asc')
  );

  try {
    const querySnapshot = await getDocs(q);
    const sessions: SpeedDatingSession[] = [];
    querySnapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() } as SpeedDatingSession);
    });

    // Additionally, fetch past completed sessions for feedback purposes if needed,
    // but this function is specifically for "upcoming"
    // If a session dateTime is in the past but status is still 'scheduled' or 'in-progress', it might need cleanup.
    // For now, this focuses on truly upcoming or ongoing.

    return sessions;
  } catch (error) {
    console.error(`Error fetching upcoming sessions for user ${userId}:`, error);
    throw new Error('Failed to fetch upcoming speed dating sessions.');
  }
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
    const docRef = await addDoc(feedbackCollectionRef, {
      ...feedbackData,
      timestamp: serverTimestamp(),
    });
    console.log('Speed dating feedback submitted with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting speed dating feedback:', error);
    throw new Error('Failed to submit speed dating feedback to Firestore.');
  }
}

/**
 * Retrieves all feedback submitted by a specific user for a specific session.
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
    return [];
  }

  try {
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

/**
 * Updates the status of a session, e.g., to 'in-progress' or 'completed'.
 * This would typically be called by a backend process or admin.
 * @async
 * @function updateSessionStatus
 * @param {string} sessionId - ID of the session to update.
 * @param {SpeedDatingSession['status']} newStatus - The new status for the session.
 * @returns {Promise<void>}
 * @throws {Error} If update fails.
 */
export async function updateSessionStatus(sessionId: string, newStatus: SpeedDatingSession['status']): Promise<void> {
    if (criticalConfigError) {
        console.error("Firebase is not configured. Cannot update session status.");
        throw new Error("Application services are not available.");
    }
    const sessionDocRef = doc(firestore, 'speedDatingSessions', sessionId);
    try {
        await updateDoc(sessionDocRef, {
            status: newStatus,
            updatedAt: serverTimestamp()
        });
        console.log(`Session ${sessionId} status updated to ${newStatus}.`);
    } catch (error) {
        console.error(`Error updating status for session ${sessionId}:`, error);
        throw new Error('Failed to update session status.');
    }
}
