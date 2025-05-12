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
    // Ensure rewards have dateEarned as Timestamp (Firestore handles this, but good for consistency)
    rewards: data.rewards?.map((reward: any) => ({
      ...reward,
      dateEarned: reward.dateEarned instanceof Timestamp ? reward.dateEarned : Timestamp.fromDate(new Date(reward.dateEarned.seconds * 1000)),
    })) || [],
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : undefined,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : undefined,
  } as UserProfile;
};


/**
 * Retrieves the profile for a given user ID from Firestore.
 * Initializes rewards, points, and premium features if missing on first fetch (though creation should handle this).
 * @async
 * @function get_user
 * @param {string} userId - The ID of the user.
 * @returns {Promise<UserProfile>} A promise that resolves to the user's profile.
 * @throws {Error} If the user is not found or an error occurs.
 */
export async function get_user(userId: string): Promise<UserProfile> {
  console.log(`Fetching profile for user from Firestore: ${userId}`);
  const userDocRef = doc(firestore, 'users', userId);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    throw new Error(`User with ID ${userId} not found in Firestore.`);
  }

  let userProfile = mapDocumentToUserProfile(userDocSnap) as UserProfile; // Assert not null due to previous check

  // Ensure defaults are set if somehow missing (though setDoc on creation should handle this)
  userProfile.rewards = userProfile.rewards || [];
  userProfile.points = userProfile.points || 0;
  userProfile.premiumFeatures = userProfile.premiumFeatures || { advancedFilters: false, profileBoost: false, exclusiveModes: false };
  userProfile.speedDatingSchedule = userProfile.speedDatingSchedule || [];
  userProfile.gamePreferences = userProfile.gamePreferences || [];
  userProfile.privacySettings = userProfile.privacySettings || { showLocation: true, showOnlineStatus: true };
  
  console.log("Fetched profile from Firestore:", userProfile);
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
  console.log(`Updating/Creating profile for user in Firestore: ${userId}`, profileData);
  const userDocRef = doc(firestore, 'users', userId);

  const dataToSet: Partial<UserProfile> & { updatedAt: Timestamp; createdAt?: Timestamp } = {
    ...profileData,
    updatedAt: Timestamp.now(),
  };

  const docSnap = await getDoc(userDocRef);
  if (!docSnap.exists()) {
    dataToSet.createdAt = Timestamp.now();
    dataToSet.points = profileData.points || 0; // Initialize points if creating
    dataToSet.rewards = profileData.rewards || []; // Initialize rewards if creating
    dataToSet.premiumFeatures = profileData.premiumFeatures || { advancedFilters: false, profileBoost: false, exclusiveModes: false };
    dataToSet.privacySettings = profileData.privacySettings || { showLocation: true, showOnlineStatus: true };
    dataToSet.interests = profileData.interests || [];
    dataToSet.gamePreferences = profileData.gamePreferences || [];
    dataToSet.speedDatingSchedule = profileData.speedDatingSchedule || [];

  }
  
  // Ensure dataAiHint is set if not provided but name is
  if (!dataToSet.dataAiHint && dataToSet.name) {
    dataToSet.dataAiHint = `${dataToSet.name.split(' ')[0].toLowerCase()} person`;
  }


  await setDoc(userDocRef, dataToSet, { merge: true });
  
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
 * @param {string} userId - The ID of the user.
 * @param {UserProfile} currentUserProfile - The current user profile to check against.
 */
async function checkAndUnlockPremiumFeatures(userId: string, currentUserProfile: UserProfile): Promise<void> {
    const userDocRef = doc(firestore, 'users', userId);
    const currentFeatures = currentUserProfile.premiumFeatures || { advancedFilters: false, profileBoost: false, exclusiveModes: false };
    const newFeatures: PremiumFeatures = { ...currentFeatures };
    let changed = false;

    const userPoints = currentUserProfile.points || 0;
    const userRewards = currentUserProfile.rewards || [];

    // Unlock Advanced Filters by points
    if (!newFeatures.advancedFilters && userPoints >= 500) { // Using a constant would be better
        newFeatures.advancedFilters = true;
        changed = true;
    }

    // Unlock Profile Boost by 'top_contributor' badge
    if (!newFeatures.profileBoost && userRewards.some(r => r.type === 'top_contributor')) {
        newFeatures.profileBoost = true;
        changed = true;
    }

    // Unlock Exclusive Modes by 'game_master' badge
    if (!newFeatures.exclusiveModes && userRewards.some(r => r.type === 'game_master')) {
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
  console.log(`Attempting to add reward type ${rewardData.type} for user in Firestore: ${userId}`);
  const userDocRef = doc(firestore, 'users', userId);
  const userProfile = await get_user(userId); // Get current profile

  const hasReward = userProfile.rewards!.some(r => r.type === rewardData.type);

  if (!hasReward) {
    const newReward: UserReward = {
      ...rewardData,
      id: `rwd-${Date.now()}-${Math.random().toString(16).slice(2)}`, // More unique ID
      dateEarned: Timestamp.now(),
    };
    const pointsToAward = getPointsForReward(rewardData.type);

    await updateDoc(userDocRef, {
      rewards: arrayUnion(newReward),
      points: increment(pointsToAward),
      updatedAt: Timestamp.now(),
    });
    console.log(`Reward ${rewardData.type} added for user ${userId}. Points added: ${pointsToAward}.`);
    // Fetch updated profile to pass to checkAndUnlockPremiumFeatures
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
 * @param {string} userId - The ID of the user.
 * @returns {Promise<string[]>} A promise resolving to the user's schedule.
 */
export async function get_user_speed_dating_schedule(userId: string): Promise<string[]> {
  const user = await get_user(userId);
  return user.speedDatingSchedule || [];
}

/**
 * Sets the speed dating schedule for a user in Firestore.
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
 * @param {string} userId - The ID of the user.
 * @returns {Promise<string[]>} A promise resolving to the user's game preferences.
 */
export async function get_user_game_preferences(userId: string): Promise<string[]> {
  const user = await get_user(userId);
  return user.gamePreferences || [];
}

/**
 * Sets the game preferences for a user in Firestore.
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
  console.log(`Adding ${pointsToAdd} points to user in Firestore: ${userId}`);
  const userDocRef = doc(firestore, 'users', userId);
  await updateDoc(userDocRef, {
    points: increment(pointsToAdd),
    updatedAt: Timestamp.now(),
  });
  const updatedProfile = await get_user(userId); // Fetch updated profile
  await checkAndUnlockPremiumFeatures(userId, updatedProfile);
  return updatedProfile.points || 0;
}

// Helper function to determine points for a reward type
function getPointsForReward(rewardType: string): number {
  switch (rewardType) {
    case 'profile_complete': return 50;
    case 'first_chat': return 20;
    case 'first_match': return 30;
    case 'speed_dater': return 25;
    case 'game_winner': return 15;
    case 'blind_exchange_participant': return 20;
    case 'explorer': return 10;
    case 'chat_enthusiast': return 35;
    case 'top_contributor': return 100;
    case 'game_master': return 75;
    default: return 5;
  }
}

/**
 * Retrieves all user profiles from Firestore (for leaderboard simulation).
 * @async
 * @function get_all_users
 * @returns {Promise<UserProfile[]>} A promise that resolves to an array of all user profiles.
 */
export async function get_all_users(): Promise<UserProfile[]> {
  console.log("Fetching all user profiles from Firestore for leaderboard");
  const querySnapshot = await getDocs(usersCollection);
  const users: UserProfile[] = [];
  querySnapshot.forEach((docSnap) => {
    const user = mapDocumentToUserProfile(docSnap);
    if (user) {
      // Ensure defaults for sorting purposes if any are missing
      user.points = user.points || 0;
      user.rewards = user.rewards || [];
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
