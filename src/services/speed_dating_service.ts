
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
import { get_user } from './user_profile';
import { showNotification } from '@/lib/notifications';

/**
 * @interface SpeedDatingFeedbackData
 * @description Defines the structure for feedback submitted by a user about a partner met during a speed dating session.
 */
export interface SpeedDatingFeedbackData {
  id?: string;
  userId: string;
  sessionId: string;
  partnerId: string;
  partnerName: string; // Name of the partner being reviewed
  rating: 'positive' | 'neutral' | 'negative' | '';
  comment?: string;
  timestamp: Timestamp;
}

/**
 * @interface SpeedDatingSessionParticipantDetails
 * @description Basic details of a participant for display within a session.
 */
export interface SpeedDatingSessionParticipantDetails {
  id: string; // User ID
  name: string;
  profilePicture?: string;
  dataAiHint?: string;
  interests?: string[]; // Store interests for matchmaking
}

/**
 * @interface SpeedDatingPairing
 * @description Represents a pairing of two users for a specific round.
 */
export interface SpeedDatingPairing {
  user1Id: string;
  user1Name: string;
  user2Id: string;
  user2Name: string;
  round: number;
  // chatRoomId?: string; // Optional: if each pair gets a temporary private chat room
}

/**
 * @interface SpeedDatingSession
 * @description Represents a speed dating session.
 */
export interface SpeedDatingSession {
  id: string;
  creatorId: string;
  dateTime: Timestamp;
  interests: string[]; // Interests the session is focused on
  participantIds: string[];
  participantsCount: number;
  maxParticipants: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'full' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  participants: { [userId: string]: SpeedDatingSessionParticipantDetails }; // Detailed participant info
  feedbackSubmitted?: boolean; // Client-side flag, not persisted directly on session doc usually
  currentRound: number; // 0 if not started, 1, 2, ... during session
  pairings: SpeedDatingPairing[]; // All pairings across all rounds
  durationPerRoundMinutes: number; // e.g., 5 minutes per round
  totalRounds?: number; // Calculated or predefined
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
 * @param {number} [sessionData.durationPerRoundMinutes=5] - Duration of each speed dating round.
 * @returns {Promise<string>} The ID of the newly created session document.
 * @throws {Error} If creation fails or Firebase is not configured.
 */
export async function createSpeedDatingSession(sessionData: {
  creatorId: string;
  interests: string[];
  sessionDateTime: Timestamp;
  maxParticipants?: number;
  durationPerRoundMinutes?: number;
}): Promise<string> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot create speed dating session.");
    throw new Error("Application services are not available.");
  }

  const { creatorId, interests, sessionDateTime, maxParticipants = 10, durationPerRoundMinutes = 5 } = sessionData;

  if (interests.length === 0) {
    throw new Error("Session must have at least one interest.");
  }
  if (sessionDateTime.toMillis() <= Timestamp.now().toMillis()) {
      throw new Error("Session date and time must be in the future.");
  }
  if (maxParticipants < 2 || maxParticipants > 20) { // Enforce practical limits
      throw new Error("Session must allow between 2 and 20 participants.");
  }

  try {
    const creatorProfile = await get_user(creatorId);
    if (!creatorProfile) {
        throw new Error("Creator profile not found.");
    }

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
      participants: {
        [creatorId]: {
          id: creatorId,
          name: creatorProfile.name || 'Creator',
          profilePicture: creatorProfile.profilePicture || '',
          dataAiHint: creatorProfile.dataAiHint || 'person',
          interests: creatorProfile.interests || [],
        }
      },
      durationPerRoundMinutes,
      currentRound: 0,
      pairings: [],
      totalRounds: Math.floor(maxParticipants / 2), // Example: N/2 rounds
    } as Omit<SpeedDatingSession, 'id'>);

    console.log('New speed dating session created with ID:', newSessionDocRef.id);
    // Conceptual: Schedule a backend trigger (Cloud Function) to start this session at sessionDateTime
    // scheduleSessionStart(newSessionDocRef.id, sessionDateTime);
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
  const userProfile = await get_user(userId);
  if (!userProfile) {
    throw new Error("User profile not found for registration.");
  }

  try {
    const sessionSnap = await getDoc(sessionDocRef);
    if (!sessionSnap.exists()) {
      throw new Error("Session not found.");
    }

    const session = sessionSnap.data() as SpeedDatingSession;

    if (session.status !== 'scheduled') {
        throw new Error("Session is not open for registration (it might be full, in-progress, completed, or cancelled).");
    }
    if (session.participantIds.includes(userId)) {
      // Already registered, no error, just inform.
      console.log(`User ${userId} is already registered for session ${sessionId}.`);
      return;
    }
    if (session.participantsCount >= session.maxParticipants) {
      await updateDoc(sessionDocRef, { status: 'full', updatedAt: serverTimestamp() });
      throw new Error("Session just became full. Cannot register.");
    }

    const newParticipantsCount = session.participantsCount + 1;
    const newStatus = newParticipantsCount >= session.maxParticipants ? 'full' : 'scheduled'; // Remains scheduled until full, then becomes full.

    const participantDetail: SpeedDatingSessionParticipantDetails = {
        id: userId,
        name: userProfile.name || 'Participant',
        profilePicture: userProfile.profilePicture || '',
        dataAiHint: userProfile.dataAiHint || 'person',
        interests: userProfile.interests || [],
    };

    await updateDoc(sessionDocRef, {
      participantIds: arrayUnion(userId),
      participantsCount: increment(1),
      [`participants.${userId}`]: participantDetail,
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
    console.log(`User ${userId} registered for session ${sessionId}. Current count: ${newParticipantsCount}. New status: ${newStatus}`);
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
 * @param {string[]} interests - Array of interests to filter by. Filters for 'scheduled' sessions that are not full.
 * @returns {Promise<SpeedDatingSession[]>} A list of available sessions.
 * @throws {Error} If fetching fails or Firebase not configured.
 */
export async function findAvailableSessions(interests: string[]): Promise<SpeedDatingSession[]> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot find sessions.");
    return [];
  }

  const now = Timestamp.now();
  let q;

  if (interests.length > 0) {
    q = query(
      sessionsCollection,
      where('interests', 'array-contains-any', interests),
      where('status', '==', 'scheduled'),
      where('dateTime', '>', now),
      orderBy('dateTime', 'asc'),
      limit(20)
    );
  } else {
    q = query(
      sessionsCollection,
      where('status', '==', 'scheduled'),
      where('dateTime', '>', now),
      orderBy('dateTime', 'asc'),
      limit(20)
    );
  }

  try {
    const querySnapshot = await getDocs(q);
    const sessions: SpeedDatingSession[] = [];
    querySnapshot.forEach((doc) => {
      const sessionData = { id: doc.id, ...doc.data() } as SpeedDatingSession;
      // Double-check if the session is not full (status might not have updated yet if many registered simultaneously)
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
 * Gets upcoming (scheduled, full, in-progress) or recently completed sessions a user is registered for.
 * @async
 * @function getUpcomingSessionsForUser
 * @param {string} userId - The ID of the user.
 * @returns {Promise<SpeedDatingSession[]>} A list of upcoming/recent sessions for the user.
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
    orderBy('dateTime', 'desc') // Fetch most recent first for easier filtering later
  );

  try {
    const querySnapshot = await getDocs(q);
    const sessions: SpeedDatingSession[] = [];
    const nowMillis = Timestamp.now().toMillis();
    const twoHoursAgoMillis = nowMillis - (2 * 60 * 60 * 1000);

    querySnapshot.forEach((doc) => {
      const session = { id: doc.id, ...doc.data() } as SpeedDatingSession;
      const sessionTimeMillis = (session.dateTime as Timestamp).toMillis();

      // Keep session if:
      // 1. It's not cancelled AND
      // 2. It's 'in-progress', 'scheduled', or 'full' OR
      // 3. It was 'completed' within the last 2 hours (for feedback) OR
      // 4. Its scheduled dateTime is in the future.
      if (
        session.status !== 'cancelled' &&
        (session.status === 'in-progress' ||
         session.status === 'scheduled' ||
         session.status === 'full' ||
         (session.status === 'completed' && sessionTimeMillis >= twoHoursAgoMillis) ||
         sessionTimeMillis >= nowMillis)
      ) {
        sessions.push(session);
      }
    });
    // Sort ascending by date for display
    return sessions.sort((a, b) => (a.dateTime as Timestamp).toMillis() - (b.dateTime as Timestamp).toMillis());
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
 * Updates the status of a session. Typically called by a backend process/Cloud Function.
 * If status becomes 'in-progress', it attempts to run matchmaking.
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
        const updateData: Partial<SpeedDatingSession> = {
            status: newStatus,
            updatedAt: serverTimestamp() as Timestamp
        };
        if (newStatus === 'in-progress') {
            updateData.currentRound = 1; // Initialize round
             // Potentially notify participants that the session is starting
            const session = (await getDoc(sessionDocRef)).data() as SpeedDatingSession;
            if (session) {
              session.participantIds.forEach(pid => {
                showNotification(
                  `Speed Dating Session Starting!`,
                  { body: `Your session for interests: ${session.interests.join(', ')} is now starting.`}
                );
                // Conceptual: triggerPushNotification(pid, "Session Starting!", "Your speed dating session is now live!");
              });
            }
        } else if (newStatus === 'completed') {
            // Potentially notify participants that the session is completed and feedback can be given
             const session = (await getDoc(sessionDocRef)).data() as SpeedDatingSession;
             if (session) {
               session.participantIds.forEach(pid => {
                 showNotification(
                   `Speed Dating Session Ended`,
                   { body: `Session for ${session.interests.join(', ')} has ended. Provide feedback!`}
                 );
                 // Conceptual: triggerPushNotification(pid, "Session Ended", "Time to provide feedback for your speed dating session!");
               });
             }
        }


        await updateDoc(sessionDocRef, updateData);
        console.log(`Session ${sessionId} status updated to ${newStatus}.`);

        if (newStatus === 'in-progress') {
            await runMatchmakingForSession(sessionId);
        }
    } catch (error) {
        console.error(`Error updating status for session ${sessionId}:`, error);
        throw new Error('Failed to update session status.');
    }
}

/**
 * Conceptual: Runs matchmaking for a session when it becomes 'in-progress'.
 * This function simulates creating pairings for rounds based on shared interests.
 * A real implementation would involve more complex compatibility scoring and history.
 * @async
 * @function runMatchmakingForSession
 * @param {string} sessionId - ID of the session.
 * @returns {Promise<void>}
 */
export async function runMatchmakingForSession(sessionId: string): Promise<void> {
    if (criticalConfigError) {
        console.error("Firebase is not configured. Cannot run matchmaking for session " + sessionId);
        return;
    }
    console.log(`SpeedDatingService: Running matchmaking for session ${sessionId}...`);
    const sessionDocRef = doc(firestore, 'speedDatingSessions', sessionId);
    const sessionSnap = await getDoc(sessionDocRef);

    if (!sessionSnap.exists()) {
        console.error(`Session ${sessionId} not found for matchmaking.`);
        return;
    }
    const session = { id: sessionSnap.id, ...sessionSnap.data() } as SpeedDatingSession;

    if (session.status !== 'in-progress') {
        console.warn(`Matchmaking for session ${sessionId} not run, status is ${session.status}. Should be 'in-progress'.`);
        return;
    }

    const participantIds = session.participantIds;
    if (participantIds.length < 2) {
        console.warn(`Not enough participants in session ${sessionId} for matchmaking. Min 2 required.`);
        await updateSessionStatus(sessionId, 'cancelled'); // Cancel if not enough people
        return;
    }

    const participantsDetails = session.participants || {};
    const allPairings: SpeedDatingPairing[] = [];
    
    // Determine total rounds. E.g., each person meets (almost) everyone else once.
    // For simplicity, let's aim for a few rounds or up to N-1 rounds if N is small.
    const totalRounds = Math.min(3, participantIds.length - 1); // Example: max 3 rounds or N-1
    
    // Keep track of who has met whom to avoid immediate re-pairing in subsequent rounds
    const metPairs = new Set<string>(); 

    for (let round = 1; round <= totalRounds; round++) {
        let availableParticipants = [...participantIds];
        const pairedThisRound = new Set<string>();
        const currentRoundPairings: SpeedDatingPairing[] = [];

        // Shuffle for varied pairings, or use a more structured algorithm (e.g., round-robin variant)
        availableParticipants = availableParticipants.sort(() => Math.random() - 0.5);

        for (let i = 0; i < availableParticipants.length; i++) {
            const user1Id = availableParticipants[i];
            if (pairedThisRound.has(user1Id)) continue;

            for (let j = i + 1; j < availableParticipants.length; j++) {
                const user2Id = availableParticipants[j];
                if (pairedThisRound.has(user2Id)) continue;

                const pairKey1 = `${user1Id}-${user2Id}`;
                const pairKey2 = `${user2Id}-${user1Id}`;

                // Check if this pair has met in a *previous* round (simple check for this simulation)
                // A more robust system would track all historical pairings for the session.
                if (allPairings.some(p => ((p.user1Id === user1Id && p.user2Id === user2Id) || (p.user1Id === user2Id && p.user2Id === user1Id)) && p.round < round )) {
                    continue; // They met in a previous round, try to find someone new
                }
                
                // Basic compatibility: check for at least one shared interest (if details available)
                const user1Details = participantsDetails[user1Id];
                const user2Details = participantsDetails[user2Id];
                let shareInterests = false;
                if (user1Details?.interests && user2Details?.interests) {
                    shareInterests = user1Details.interests.some(interest => user2Details.interests?.includes(interest));
                } else { // If interests are not available, assume compatibility for simulation
                    shareInterests = true;
                }
                
                if (shareInterests) { // Or a more complex score > threshold
                    const newPairing: SpeedDatingPairing = {
                        user1Id: user1Id,
                        user1Name: user1Details?.name || 'User',
                        user2Id: user2Id,
                        user2Name: user2Details?.name || 'User',
                        round: round,
                        // chatRoomId: `${sessionId}_round${round}_${[user1Id, user2Id].sort().join('-')}` // Conceptual chat room ID
                    };
                    currentRoundPairings.push(newPairing);
                    allPairings.push(newPairing);
                    pairedThisRound.add(user1Id);
                    pairedThisRound.add(user2Id);
                    metPairs.add(pairKey1);
                    metPairs.add(pairKey2);
                    break; // user1Id is now paired for this round
                }
            }
        }
        console.log(`SpeedDatingService: Session ${sessionId}, Round ${round} Pairings:`, currentRoundPairings.length, currentRoundPairings);
        if(currentRoundPairings.length === 0 && round === 1 && participantIds.length >=2){
             // Fallback: if no interest-based pairs found in first round, make random pairs
             console.warn(`No interest-based pairs for round 1 of session ${sessionId}, making random pairs.`);
             pairedThisRound.clear();
             availableParticipants = availableParticipants.sort(() => Math.random() - 0.5);
             for (let i = 0; i < availableParticipants.length; i+=2) {
                 if (i + 1 < availableParticipants.length) {
                     const user1Id = availableParticipants[i];
                     const user2Id = availableParticipants[i+1];
                     const user1Details = participantsDetails[user1Id];
                     const user2Details = participantsDetails[user2Id];
                     const newPairing: SpeedDatingPairing = {
                        user1Id: user1Id,
                        user1Name: user1Details?.name || 'User',
                        user2Id: user2Id,
                        user2Name: user2Details?.name || 'User',
                        round: round,
                    };
                    currentRoundPairings.push(newPairing);
                    allPairings.push(newPairing);
                 }
             }
        }
    }

    try {
        await updateDoc(sessionDocRef, {
            pairings: allPairings,
            currentRound: allPairings.length > 0 ? 1 : 0,
            totalRounds: totalRounds,
            updatedAt: serverTimestamp()
        });
        console.log(`SpeedDatingService: Matchmaking pairings (${allPairings.length}) generated and stored for session ${sessionId}. Total rounds: ${totalRounds}.`);
    } catch (error) {
        console.error(`SpeedDatingService: Error updating session ${sessionId} with pairings:`, error);
    }
}

/**
 * Conceptual: Advances a session to the next round.
 * This would typically be triggered by a backend timer or admin action.
 * @async
 * @function advanceSessionRound
 * @param {string} sessionId - ID of the session.
 * @returns {Promise<void>}
 */
export async function advanceSessionRound(sessionId: string): Promise<void> {
    if (criticalConfigError) {
        console.error("Firebase is not configured. Cannot advance session round.");
        return;
    }
    const sessionDocRef = doc(firestore, 'speedDatingSessions', sessionId);
    const sessionSnap = await getDoc(sessionDocRef);

    if (!sessionSnap.exists()) {
        console.error(`Session ${sessionId} not found for advancing round.`);
        return;
    }
    const session = sessionSnap.data() as SpeedDatingSession;

    if (session.status !== 'in-progress') {
        console.warn(`Session ${sessionId} is not in-progress. Cannot advance round.`);
        return;
    }

    const nextRound = (session.currentRound || 0) + 1;
    if (nextRound > (session.totalRounds || (session.participantIds.length -1) ) ) {
        console.log(`Session ${sessionId} has completed all rounds. Setting status to 'completed'.`);
        await updateSessionStatus(sessionId, 'completed');
        // Notify participants that the session is over and they can provide feedback.
    } else {
        await updateDoc(sessionDocRef, {
            currentRound: nextRound,
            updatedAt: serverTimestamp()
        });
        console.log(`Session ${sessionId} advanced to round ${nextRound}.`);
        // Notify participants about the new round and their new partner.
        // This would involve looking up pairings for `nextRound`.
    }
}

// Conceptual: Placeholder for scheduling session start via backend (e.g., Cloud Function)
// async function scheduleSessionStart(sessionId: string, startTime: Timestamp) {
//   console.log(`Conceptual: Scheduling backend task to start session ${sessionId} at ${startTime.toDate().toISOString()}`);
//   // Logic to interact with a task queue or scheduler (e.g., Google Cloud Tasks, Firebase Scheduled Functions)
//   // This task would eventually call `updateSessionStatus(sessionId, 'in-progress')`.
// }

// Conceptual: Placeholder for backend task to end a round/session after duration
// async function scheduleRoundEnd(sessionId: string, round: number, roundEndTime: Timestamp) {
//   console.log(`Conceptual: Scheduling backend task for session ${sessionId}, round ${round} to end at ${roundEndTime.toDate().toISOString()}`);
//   // This task would call `advanceSessionRound(sessionId)` or `updateSessionStatus(sessionId, 'completed')`.
// }
