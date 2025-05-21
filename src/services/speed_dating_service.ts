
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
  limit,
  orderBy
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
 * @interface SpeedDatingSessionParticipantDetails
 * @description Basic details of a participant for display within a session.
 */
export interface SpeedDatingSessionParticipantDetails {
  name: string;
  profilePicture?: string;
}

/**
 * @interface SpeedDatingSession
 * @description Represents a speed dating session.
 */
export interface SpeedDatingSession {
  id: string; 
  creatorId: string;
  dateTime: Timestamp; 
  interests: string[];
  participantIds: string[]; 
  participantsCount: number; 
  maxParticipants: number;
  status: 'scheduled' | 'completed' | 'in-progress' | 'full' | 'cancelled'; 
  createdAt: Timestamp; 
  updatedAt: Timestamp; 
  participants?: { [userId: string]: SpeedDatingSessionParticipantDetails }; // Stores basic info of actual participants
  feedbackSubmitted?: boolean; 
  currentRound?: number; // For managing rounds during an "in-progress" session
  pairings?: Array<{ user1: string, user2: string, round: number }>; // Conceptual: Store pairings for each round
}

const sessionsCollection = collection(firestore, 'speedDatingSessions');
const feedbackCollectionRef = collection(firestore, 'speedDatingFeedback');

/**
 * Creates a new speed dating session initiated by a user.
 * @async
 * @function createSpeedDatingSession
 * @param {object} sessionData - Data for the new session.
 * @param {string} sessionData.creatorId - ID of the user creating the session.
 * @param {UserProfile} sessionData.creatorProfile - Profile of the user creating the session.
 * @param {string[]} sessionData.interests - Interests for the session.
 * @param {Timestamp} sessionData.sessionDateTime - The date and time of the session.
 * @param {number} [sessionData.maxParticipants=10] - Maximum number of participants.
 * @returns {Promise<string>} The ID of the newly created session document.
 * @throws {Error} If creation fails or Firebase is not configured.
 */
export async function createSpeedDatingSession(sessionData: {
  creatorId: string;
  creatorProfile: UserProfile; // Added creator's profile to store basic info
  interests: string[];
  sessionDateTime: Timestamp;
  maxParticipants?: number;
}): Promise<string> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot create speed dating session.");
    throw new Error("Application services are not available.");
  }

  const { creatorId, creatorProfile, interests, sessionDateTime, maxParticipants = 10 } = sessionData;

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
    const now = serverTimestamp() as Timestamp; 
    const newSessionDocRef = await addDoc(sessionsCollection, {
      creatorId,
      interests,
      dateTime: sessionDateTime,
      participantIds: [creatorId], 
      participantsCount: 1,
      maxParticipants,
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
      participants: { // Store basic info of the creator
        [creatorId]: {
          name: creatorProfile.name || 'Creator',
          profilePicture: creatorProfile.profilePicture || '',
        }
      }
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
 * @param {UserProfile} userProfile - Profile of the user to register.
 * @param {string} sessionId - ID of the session to register for.
 * @returns {Promise<void>}
 * @throws {Error} If registration fails, session is full, user already registered, or Firebase not configured.
 */
export async function registerForSpeedDatingSession(userId: string, userProfile: UserProfile, sessionId: string): Promise<void> {
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
      await updateDoc(sessionDocRef, { status: 'full', updatedAt: serverTimestamp() });
      throw new Error("Session just became full. Cannot register.");
    }

    const newParticipantsCount = session.participantsCount + 1;
    const newStatus = newParticipantsCount >= session.maxParticipants ? 'full' : 'scheduled';
    
    const participantDetail: SpeedDatingSessionParticipantDetails = {
        name: userProfile.name || 'Participant',
        profilePicture: userProfile.profilePicture || ''
    };

    await updateDoc(sessionDocRef, {
      participantIds: arrayUnion(userId),
      participantsCount: increment(1),
      [`participants.${userId}`]: participantDetail, // Store basic info of the new participant
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
    console.log(`User ${userId} registered for session ${sessionId}. New status: ${newStatus}`);
  } catch (error) {
    console.error(`Error registering user ${userId} for session ${sessionId}:`, error);
    if (error instanceof Error) {
        throw error; 
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
  
  let q;
  if (interests.length === 0) {
     q = query(
      sessionsCollection,
      where('status', '==', 'scheduled'),
      where('dateTime', '>', Timestamp.now()), 
      orderBy('dateTime', 'asc'),
      limit(20) 
    );
  } else {
    q = query(
      sessionsCollection,
      where('interests', 'array-contains-any', interests),
      where('status', '==', 'scheduled'), 
      where('dateTime', '>', Timestamp.now()), 
      orderBy('dateTime', 'asc'),
      limit(20) 
    );
  }


  try {
    const querySnapshot = await getDocs(q);
    const sessions: SpeedDatingSession[] = [];
    querySnapshot.forEach((doc) => {
      const sessionData = { id: doc.id, ...doc.data() } as SpeedDatingSession;
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
    // where('status', 'in', ['scheduled', 'in-progress', 'full']), // Keep 'full' if user is already in
    // Fetch all sessions user is part of, then filter by date/status client-side or more specifically if needed
    orderBy('dateTime', 'asc') 
  );

  try {
    const querySnapshot = await getDocs(q);
    const sessions: SpeedDatingSession[] = [];
    querySnapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() } as SpeedDatingSession);
    });

    // Filter for sessions that are upcoming, in-progress, or completed (for feedback)
    return sessions.filter(session => 
      session.status !== 'cancelled' && 
      (session.status === 'completed' || (session.dateTime as Timestamp).toMillis() >= Timestamp.now().toMillis() - (2 * 60 * 60 * 1000)) // Allow feedback for sessions completed recently (e.g., within last 2 hours)
    );
  } catch (error) {
    console.error(`Error fetching sessions for user ${userId}:`, error);
    throw new Error('Failed to fetch speed dating sessions.');
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
 * Updates the status of a session. Typically called by a backend process.
 * @async
 * @function updateSessionStatus
 * @param {string} sessionId - ID of the session to update.
 * @param {SpeedDatingSession['status']} newStatus - The new status.
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
        // Conceptual: If status becomes 'in-progress', trigger matchmaking
        if (newStatus === 'in-progress') {
            await runMatchmakingForSession(sessionId);
        }
    } catch (error) {
        console.error(`Error updating status for session ${sessionId}:`, error);
        throw new Error('Failed to update session status.');
    }
}

/**
 * Conceptual: Runs matchmaking for a session.
 * This would be complex and involve fetching all participant profiles, scoring compatibility,
 * and creating pairings for rounds.
 * @async
 * @function runMatchmakingForSession
 * @param {string} sessionId - ID of the session.
 * @returns {Promise<void>}
 */
export async function runMatchmakingForSession(sessionId: string): Promise<void> {
    if (criticalConfigError) {
        console.error("Firebase is not configured. Cannot run matchmaking.");
        return;
    }
    console.log(`Conceptual: Running matchmaking for session ${sessionId}...`);
    const sessionDocRef = doc(firestore, 'speedDatingSessions', sessionId);
    const sessionSnap = await getDoc(sessionDocRef);

    if (!sessionSnap.exists()) {
        console.error(`Session ${sessionId} not found for matchmaking.`);
        return;
    }
    const session = sessionSnap.data() as SpeedDatingSession;
    if (session.status !== 'in-progress' && session.status !== 'full') { // Or just before 'in-progress'
        console.warn(`Matchmaking for session ${sessionId} not run, status is ${session.status}.`);
        return;
    }

    const participantIds = session.participantIds;
    if (participantIds.length < 2) {
        console.warn(`Not enough participants in session ${sessionId} for matchmaking.`);
        return;
    }

    // Fetch profiles for all participants (simplified - in reality, fetch only needed data)
    // const participantProfiles: UserProfile[] = [];
    // for (const pId of participantIds) {
    //     const userProfile = await get_user(pId); // Assuming get_user exists and fetches UserProfile
    //     participantProfiles.push(userProfile);
    // }
    // console.log(`Fetched ${participantProfiles.length} profiles for matchmaking in session ${sessionId}.`);

    // TODO: Implement actual matchmaking logic:
    // 1. Score compatibility between all pairs of participants (e.g., based on shared interests, other profile data).
    // 2. Create pairings for multiple rounds, ensuring users meet different people.
    //    - Example: Round 1: (A,B), (C,D); Round 2: (A,C), (B,D) etc.
    // 3. Store these pairings in the session document (e.g., session.pairings).
    //    session.pairings = [{ user1: 'idA', user2: 'idB', round: 1 }, ...];
    //    session.currentRound = 1;
    //    await updateDoc(sessionDocRef, { pairings: session.pairings, currentRound: 1, updatedAt: serverTimestamp() });

    console.log(`Conceptual: Matchmaking pairings would be generated and stored for session ${sessionId}.`);
    // For now, just an example update
    await updateDoc(sessionDocRef, { currentRound: 1, updatedAt: serverTimestamp() });
}

// TODO: Implement backend Cloud Function triggers for:
// - Automatically transitioning session statuses (scheduled -> in-progress -> completed).
// - Potentially running matchmaking when a session becomes 'full' or at its scheduled start time.
