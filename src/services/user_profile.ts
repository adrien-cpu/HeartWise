/**
 * @fileOverview Provides services for managing user profile data, including rewards and points, using Firestore.
 * @module user_profile
 * @description This module defines the UserProfile, UserReward, and PremiumFeatures interfaces and functions for retrieving/updating profiles, rewards, and points.
 *              Uses Firestore as the backend.
 */

import { firestore } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  Timestamp,
  arrayUnion,
  increment,
  DocumentData,
  DocumentSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

/**
 * Defines the structure for premium features available to users.
 */
export interface PremiumFeatures {
  advancedFilters?: boolean;
  profileBoost?: boolean;
  exclusiveModes?: boolean;
}

/**
 * Represents the structure of a user profile.
 */
export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  bio?: string;
  interests?: string[];
  profilePicture?: string;
  dataAiHint?: string; // For AI image generation hints
  privacySettings?: {
    showLocation?: boolean;
    showOnlineStatus?: boolean;
  };
  rewards?: UserReward[];
  points?: number;
  speedDatingSchedule?: string[]; // Store as array of ISO date strings or structured objects
  gamePreferences?: string[];
  premiumFeatures?: PremiumFeatures;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Represents a reward or badge earned by the user.
 */
export interface UserReward {
  id: string; // Unique ID for the reward instance
  name: string;
  description: string;
  type: string; // e.g., 'profile_complete', 'first_chat', 'game_winner'
  dateEarned: Timestamp; // Use Firestore Timestamp
  icon?: string; // Optional: path to an icon or icon name
}

// Firestore collection reference
const usersCollection = collection(firestore, 'users');

/**
 * Helper function to convert Firestore Timestamps in rewards to Date objects for client-side usage if needed,
 * or ensure they are Timestamps for Firestore operations.
 * This example assumes we store Timestamps and UserReward expects Timestamp.
 * For data coming from Firestore, Timestamps are fine. For data going to Firestore, Date objects should be converted.
 */
const mapDocumentToUserProfile = (docSnap: DocumentSnapshot<DocumentData>): UserProfile | null => {
  if (!docSnap.exists()) {
    return null;
  }
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    rewards: data.rewards?.map((reward: UserReward) => ({ // Explicitly type reward here
      ...reward,
      dateEarned: reward.dateEarned instanceof Timestamp ? reward.dateEarned : Timestamp.fromDate(new Date((reward.dateEarned as unknown as { seconds: number }).seconds * 1000)),
    })) || [],
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : undefined,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : undefined,
    // Ensure all optional fields that we provide defaults for are present
    points: data.points ?? 0,
    premiumFeatures: data.premiumFeatures ?? { advancedFilters: false, profileBoost: false, exclusiveModes: false },
    gamePreferences: data.gamePreferences ?? [],
    speedDatingSchedule: data.speedDatingSchedule ?? [],
    interests: data.interests ?? [],
    privacySettings: data.privacySettings ?? { showLocation: true, showOnlineStatus: true },
  } as UserProfile;
};


/**
 * Retrieves the profile for a given user ID from Firestore.
 * Initializes rewards, points, and premium features if missing.
 * @async
 * @function get_user
 * @param {string} userId - The ID of the user.
 * @returns {Promise<UserProfile>} A promise that resolves to the user's profile.
 * @throws {Error} If the user is not found or an error occurs.
 */
export async function get_user(userId: string): Promise<UserProfile> {
  const userDocRef = doc(firestore, 'users', userId);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    // Consider creating a default profile if it doesn't exist, or throw specific error
    // For now, throwing error as per original logic.
    throw new Error(`User with ID ${userId} not found in Firestore.`);
  }

  let userProfile = mapDocumentToUserProfile(userDocSnap);

  // If userProfile is somehow null here (shouldn't be due to exists() check), handle it.
  if (!userProfile) {
      throw new Error(`Failed to map document for user ID ${userId}.`);
  }
  
  // Ensure defaults for fields that might be missing in older documents
  // mapDocumentToUserProfile already handles this, but this is an extra safeguard.
  userProfile.rewards = userProfile.rewards || [];
  userProfile.points = userProfile.points || 0;
  userProfile.premiumFeatures = userProfile.premiumFeatures || { advancedFilters: false, profileBoost: false, exclusiveModes: false };
  userProfile.speedDatingSchedule = userProfile.speedDatingSchedule || [];
  userProfile.gamePreferences = userProfile.gamePreferences || [];
  userProfile.privacySettings = userProfile.privacySettings || { showLocation: true, showOnlineStatus: true };
  userProfile.interests = userProfile.interests || [];

  return userProfile;
}

/**
 * Creates or updates the profile for a given user ID in Firestore.
 * Uses setDoc with merge: true to create if not exists, or update if exists.
 * @async
 * @function update_user_profile
 * @param {string} userId - The ID of the user to update/create.
 * @param {Partial<UserProfile>} profileData - An object containing the profile fields to update or create.
 * @returns {Promise<UserProfile>} A promise that resolves to the updated/created user profile.
 * @throws {Error} If the update/creation fails.
 */
export async function update_user_profile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
  const userDocRef = doc(firestore, 'users', userId);

  // Prepare data with updatedAt timestamp
  const dataToUpdate: Partial<UserProfile> & { updatedAt: Timestamp; createdAt?: Timestamp } = {
    ...profileData,
    updatedAt: Timestamp.now(),
  };

  // Check if document exists to set createdAt and initial defaults
  const docSnap = await getDoc(userDocRef);
  if (!docSnap.exists()) {
    dataToUpdate.createdAt = Timestamp.now();
    // Initialize fields if creating a new profile
    dataToUpdate.points = profileData.points ?? 0;
    dataToUpdate.rewards = profileData.rewards ?? [];
    dataToUpdate.premiumFeatures = profileData.premiumFeatures ?? { advancedFilters: false, profileBoost: false, exclusiveModes: false };
    dataToUpdate.privacySettings = profileData.privacySettings ?? { showLocation: true, showOnlineStatus: true };
    dataToUpdate.interests = profileData.interests ?? [];
    dataToUpdate.gamePreferences = profileData.gamePreferences ?? [];
    dataToUpdate.speedDatingSchedule = profileData.speedDatingSchedule ?? [];
    if (!profileData.profilePicture) { // Add default placeholder if none provided during creation
        dataToUpdate.profilePicture = `https://picsum.photos/seed/${userId}/200`;
        dataToUpdate.dataAiHint = "person placeholder";
    }
  }
  
  // Ensure dataAiHint is set if not provided but name is
  if (!dataToUpdate.dataAiHint && dataToUpdate.name) {
    dataToUpdate.dataAiHint = `${dataToUpdate.name.split(' ')[0].toLowerCase()} person`;
  }

  await setDoc(userDocRef, dataToUpdate, { merge: true });
  
  const updatedProfile = await get_user(userId); // Fetch the merged profile
  await checkAndUnlockPremiumFeatures(userId, updatedProfile); // Check for unlocks after profile update
  return updatedProfile;
}

/**
 * Retrieves the rewards for a given user ID from Firestore.
 * @async
 * @function get_user_rewards
 * @param {string} userId - The ID of the user.
 * @returns {Promise<UserReward[]>} A promise that resolves to an array of the user's rewards.
 */
export async function get_user_rewards(userId: string): Promise<UserReward[]> {
  const user = await get_user(userId);
  return user.rewards || [];
}

/**
 * Checks and potentially unlocks premium features based on user's points and rewards.
 * This function is called internally after points or rewards are updated.
 * @async
 * @function checkAndUnlockPremiumFeatures
 * @param {string} userId - The ID of the user.
 * @param {UserProfile} currentUserProfile - The current user profile to check against.
 * @returns {Promise<void>}
 */
async function checkAndUnlockPremiumFeatures(userId: string, currentUserProfile: UserProfile): Promise<void> {
    const userDocRef = doc(firestore, 'users', userId);
    // Ensure premiumFeatures exists, defaulting if not
    const currentFeatures = currentUserProfile.premiumFeatures || { advancedFilters: false, profileBoost: false, exclusiveModes: false };
    const newFeatures: PremiumFeatures = { ...currentFeatures };
    let changed = false;

    const userPoints = currentUserProfile.points || 0;
    const userRewards = currentUserProfile.rewards || [];

    const ADVANCED_FILTERS_POINTS_THRESHOLD = 500;
    const PROFILE_BOOST_BADGE_TYPE = 'top_contributor';
    const EXCLUSIVE_MODES_BADGE_TYPE = 'game_master';

    // Unlock Advanced Filters by points
    if (!newFeatures.advancedFilters && userPoints >= ADVANCED_FILTERS_POINTS_THRESHOLD) {
        newFeatures.advancedFilters = true;
        changed = true;
    }

    // Unlock Profile Boost by 'top_contributor' badge
    if (!newFeatures.profileBoost && userRewards.some(r => r.type === PROFILE_BOOST_BADGE_TYPE)) {
        newFeatures.profileBoost = true;
        changed = true;
    }

    // Unlock Exclusive Modes by 'game_master' badge
    if (!newFeatures.exclusiveModes && userRewards.some(r => r.type === EXCLUSIVE_MODES_BADGE_TYPE)) {
        newFeatures.exclusiveModes = true;
        changed = true;
    }

    if (changed) {
       await updateDoc(userDocRef, { premiumFeatures: newFeatures, updatedAt: Timestamp.now() });
       console.log(`User ${userId} premium features updated:`, newFeatures);
    }
}

/**
 * Adds a reward to a user's profile in Firestore (if they haven't earned it already).
 * Also adds points associated with the reward type and checks for premium feature unlocks.
 * @async
 * @function add_user_reward
 * @param {string} userId - The ID of the user.
 * @param {Omit<UserReward, 'id' | 'dateEarned'>} rewardData - Data for the new reward (type, name, desc).
 * @returns {Promise<boolean>} A promise resolving to true if the reward was added, false otherwise.
 */
export async function add_user_reward(userId: string, rewardData: Omit<UserReward, 'id' | 'dateEarned'>): Promise<boolean> {
  const userDocRef = doc(firestore, 'users', userId);
  const userProfile = await get_user(userId); 

  const hasReward = userProfile.rewards!.some(r => r.type === rewardData.type);

  if (!hasReward) {
    const newReward: UserReward = {
      ...rewardData,
      id: `rwd-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      dateEarned: Timestamp.now(),
    };
    const pointsToAward = getPointsForReward(rewardData.type);

    await updateDoc(userDocRef, {
      rewards: arrayUnion(newReward),
      points: increment(pointsToAward),
      updatedAt: Timestamp.now(),
    });
    console.log(`Reward ${rewardData.type} added for user ${userId}. Points added: ${pointsToAward}.`);
    const updatedProfile = await get_user(userId);
    await checkAndUnlockPremiumFeatures(userId, updatedProfile);
    return true;
  } else {
    console.log(`User ${userId} already has reward ${rewardData.type}. No action taken.`);
    return false;
  }
}

/**
 * Retrieves the speed dating schedule for a user from Firestore.
 * @async
 * @function get_user_speed_dating_schedule
 * @param {string} userId - The ID of the user.
 * @returns {Promise<string[]>} A promise resolving to the user's schedule.
 */
export async function get_user_speed_dating_schedule(userId: string): Promise<string[]> {
  const user = await get_user(userId);
  return user.speedDatingSchedule || [];
}

/**
 * Sets the speed dating schedule for a user in Firestore.
 * @async
 * @function set_user_speed_dating_schedule
 * @param {string} userId - The ID of the user.
 * @param {string[]} schedule - The new schedule.
 * @returns {Promise<void>}
 */
export async function set_user_speed_dating_schedule(userId: string, schedule: string[]): Promise<void> {
  const userDocRef = doc(firestore, 'users', userId);
  await updateDoc(userDocRef, { speedDatingSchedule: schedule, updatedAt: Timestamp.now() });
}

/**
 * Retrieves the game preferences for a user from Firestore.
 * @async
 * @function get_user_game_preferences
 * @param {string} userId - The ID of the user.
 * @returns {Promise<string[]>} A promise resolving to the user's game preferences.
 */
export async function get_user_game_preferences(userId: string): Promise<string[]> {
  const user = await get_user(userId);
  return user.gamePreferences || [];
}

/**
 * Sets the game preferences for a user in Firestore.
 * @async
 * @function set_user_game_preferences
 * @param {string} userId - The ID of the user.
 * @param {string[]} preferences - The new game preferences.
 * @returns {Promise<void>}
 */
export async function set_user_game_preferences(userId: string, preferences: string[]): Promise<void> {
  const userDocRef = doc(firestore, 'users', userId);
  await updateDoc(userDocRef, { gamePreferences: preferences, updatedAt: Timestamp.now() });
}

/**
 * Retrieves the user's current points from Firestore.
 * @async
 * @function get_user_points
 * @param {string} userId - The ID of the user.
 * @returns {Promise<number>} A promise resolving to the user's points.
 */
export async function get_user_points(userId: string): Promise<number> {
  const user = await get_user(userId);
  return user.points || 0;
}

/**
 * Adds points to a user's profile in Firestore and checks for premium feature unlocks.
 * @async
 * @function add_user_points
 * @param {string} userId - The ID of the user.
 * @param {number} pointsToAdd - The number of points to add.
 * @returns {Promise<number>} A promise resolving to the user's new total points.
 */
export async function add_user_points(userId: string, pointsToAdd: number): Promise<number> {
  const userDocRef = doc(firestore, 'users', userId);
  
  // Ensure user profile exists before trying to increment points
  const userProfileSnapshot = await getDoc(userDocRef);
  if (!userProfileSnapshot.exists()) {
    // If user doesn't exist, create them with initial points
    // This might be an edge case if signup/profile creation didn't run first
    await update_user_profile(userId, { points: pointsToAdd });
  } else {
    // User exists, increment points
    await updateDoc(userDocRef, {
      points: increment(pointsToAdd),
      updatedAt: Timestamp.now(),
    });
  }

  const updatedProfile = await get_user(userId); 
  await checkAndUnlockPremiumFeatures(userId, updatedProfile);
  return updatedProfile.points || 0;
}

/**
 * Helper function to determine points for a reward type.
 * @function getPointsForReward
 * @param {string} rewardType - The type of the reward.
 * @returns {number} The number of points associated with the reward type.
 */
function getPointsForReward(rewardType: string): number {
  switch (rewardType) {
    case 'profile_complete': return 50;
    case 'first_chat': return 20;
    case 'first_match': return 30;
    case 'speed_dater': return 25;
    case 'game_winner': return 15; // Points specifically for winning a game round/session
    case 'blind_exchange_participant': return 20;
    case 'explorer': return 10;
    case 'chat_enthusiast': return 35;
    case 'top_contributor': return 100;
    case 'game_master': return 75;
    default: return 5;
  }
}

/**
 * Retrieves all user profiles from Firestore, ordered by points for leaderboard.
 * @async
 * @function get_all_users
 * @returns {Promise<UserProfile[]>} A promise that resolves to an array of all user profiles.
 */
export async function get_all_users(): Promise<UserProfile[]> {
  const q = query(usersCollection, orderBy("points", "desc"), limit(100)); // Example: limit to top 100 for performance
  const querySnapshot = await getDocs(q);
  const users: UserProfile[] = [];
  querySnapshot.forEach((docSnap) => {
    const user = mapDocumentToUserProfile(docSnap);
    if (user) {
      users.push(user);
    }
  });
  return users;
}

/**
 * Retrieves the premium features status for a given user from Firestore.
 * @async
 * @function get_user_premium_features
 * @param {string} userId - The ID of the user.
 * @returns {Promise<PremiumFeatures>} A promise resolving to the user's premium features status.
 */
export async function get_user_premium_features(userId: string): Promise<PremiumFeatures> {
  const user = await get_user(userId);
  return user.premiumFeatures || { advancedFilters: false, profileBoost: false, exclusiveModes: false };
}
