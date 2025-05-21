
/**
 * @fileOverview Provides services for managing user profile data, including rewards and points, using Firestore.
 * @module user_profile
 * @description This module defines the UserProfile, UserReward, and PremiumFeatures interfaces and functions for retrieving/updating profiles, rewards, and points.
 *              Uses Firestore as the backend.
 */

import { firestore, criticalConfigError } from '@/lib/firebase';
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
import { showNotification } from '@/lib/notifications'; // Import notification utility

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
  speedDatingSchedule?: string[]; 
  gamePreferences?: string[];
  premiumFeatures?: PremiumFeatures;
  fcmTokens?: string[]; // For Firebase Cloud Messaging push notifications
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Represents a reward or badge earned by the user.
 */
export interface UserReward {
  id: string; 
  name: string;
  description: string;
  type: string; 
  dateEarned: Timestamp; 
  icon?: string; 
}


const usersCollection = collection(firestore, 'users');


const mapDocumentToUserProfile = (docSnap: DocumentSnapshot<DocumentData>): UserProfile | null => {
  if (!docSnap.exists()) {
    return null;
  }
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    rewards: data.rewards?.map((reward: UserReward) => ({ 
      ...reward,
      dateEarned: reward.dateEarned instanceof Timestamp ? reward.dateEarned : Timestamp.fromDate(new Date((reward.dateEarned as unknown as { seconds: number }).seconds * 1000)),
    })) || [],
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : undefined,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : undefined,
    points: data.points ?? 0,
    premiumFeatures: data.premiumFeatures ?? { advancedFilters: false, profileBoost: false, exclusiveModes: false },
    gamePreferences: data.gamePreferences ?? [],
    speedDatingSchedule: data.speedDatingSchedule ?? [],
    interests: data.interests ?? [],
    privacySettings: data.privacySettings ?? { showLocation: true, showOnlineStatus: true },
    fcmTokens: data.fcmTokens ?? [], // Initialize fcmTokens
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
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot get user profile.");
    // Return a default structure or throw, depending on desired app behavior for unconfigured Firebase
     const defaultProfile: UserProfile = {
        id: userId, name: "User", email: "", bio: "", interests: [],
        profilePicture: `https://placehold.co/200x200.png`, dataAiHint: "person placeholder",
        privacySettings: { showLocation: true, showOnlineStatus: true },
        rewards: [], points: 0, speedDatingSchedule: [], gamePreferences: [],
        premiumFeatures: { advancedFilters: false, profileBoost: false, exclusiveModes: false },
        fcmTokens: [],
        createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
    };
    return defaultProfile;
  }
  const userDocRef = doc(firestore, 'users', userId);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    console.warn(`User with ID ${userId} not found in Firestore. Returning a default structure.`);
    const defaultProfile: UserProfile = {
        id: userId,
        name: "New User",
        email: "", 
        bio: "",
        interests: [],
        profilePicture: `https://placehold.co/200x200.png`,
        dataAiHint: "person placeholder",
        privacySettings: { showLocation: true, showOnlineStatus: true },
        rewards: [],
        points: 0,
        speedDatingSchedule: [],
        gamePreferences: [],
        premiumFeatures: { advancedFilters: false, profileBoost: false, exclusiveModes: false },
        fcmTokens: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    };
    return defaultProfile;
  }

  let userProfile = mapDocumentToUserProfile(userDocSnap);

  if (!userProfile) {
      throw new Error(`Failed to map document for user ID ${userId}. Data might be malformed.`);
  }
  
  userProfile.rewards = userProfile.rewards || [];
  userProfile.points = userProfile.points || 0;
  userProfile.premiumFeatures = userProfile.premiumFeatures || { advancedFilters: false, profileBoost: false, exclusiveModes: false };
  userProfile.speedDatingSchedule = userProfile.speedDatingSchedule || [];
  userProfile.gamePreferences = userProfile.gamePreferences || [];
  userProfile.privacySettings = userProfile.privacySettings || { showLocation: true, showOnlineStatus: true };
  userProfile.interests = userProfile.interests || [];
  userProfile.fcmTokens = userProfile.fcmTokens || [];
  userProfile.profilePicture = userProfile.profilePicture || `https://placehold.co/200x200.png`;
  userProfile.dataAiHint = userProfile.dataAiHint || (userProfile.name ? `${userProfile.name.split(' ')[0].toLowerCase()} person` : 'person placeholder');


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
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot update user profile.");
    throw new Error("Application services are unavailable.");
  }
  const userDocRef = doc(firestore, 'users', userId);

  const dataToUpdate: Partial<UserProfile> & { updatedAt: Timestamp; createdAt?: Timestamp } = {
    ...profileData,
    updatedAt: Timestamp.now(),
  };

  const docSnap = await getDoc(userDocRef);
  if (!docSnap.exists()) {
    dataToUpdate.createdAt = Timestamp.now();
    dataToUpdate.points = profileData.points ?? 0;
    dataToUpdate.rewards = profileData.rewards ?? [];
    dataToUpdate.premiumFeatures = profileData.premiumFeatures ?? { advancedFilters: false, profileBoost: false, exclusiveModes: false };
    dataToUpdate.privacySettings = profileData.privacySettings ?? { showLocation: true, showOnlineStatus: true };
    dataToUpdate.interests = profileData.interests ?? [];
    dataToUpdate.gamePreferences = profileData.gamePreferences ?? [];
    dataToUpdate.speedDatingSchedule = profileData.speedDatingSchedule ?? [];
    dataToUpdate.fcmTokens = profileData.fcmTokens ?? [];
    if (!profileData.profilePicture) {
        dataToUpdate.profilePicture = `https://placehold.co/200x200.png`;
        dataToUpdate.dataAiHint = "person placeholder";
    }
  }
  
  if (!dataToUpdate.dataAiHint && dataToUpdate.name) {
    dataToUpdate.dataAiHint = `${dataToUpdate.name.split(' ')[0].toLowerCase()} person`;
  }

  await setDoc(userDocRef, dataToUpdate, { merge: true });
  
  const updatedProfile = await get_user(userId); 
  await checkAndUnlockPremiumFeatures(userId, updatedProfile);
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
    if (criticalConfigError) return;
    const userDocRef = doc(firestore, 'users', userId);
    const currentFeatures = currentUserProfile.premiumFeatures || { advancedFilters: false, profileBoost: false, exclusiveModes: false };
    const newFeatures: PremiumFeatures = { ...currentFeatures };
    let changed = false;
    let unlockedFeatureName: string | null = null;

    const userPoints = currentUserProfile.points || 0;
    const userRewards = currentUserProfile.rewards || [];

    const ADVANCED_FILTERS_POINTS_THRESHOLD = 500;
    const PROFILE_BOOST_BADGE_TYPE = 'top_contributor';
    const EXCLUSIVE_MODES_BADGE_TYPE = 'game_master';

    if (!newFeatures.advancedFilters && userPoints >= ADVANCED_FILTERS_POINTS_THRESHOLD) {
        newFeatures.advancedFilters = true;
        changed = true;
        unlockedFeatureName = "Advanced Filters";
    }

    if (!newFeatures.profileBoost && userRewards.some(r => r.type === PROFILE_BOOST_BADGE_TYPE)) {
        newFeatures.profileBoost = true;
        changed = true;
        unlockedFeatureName = unlockedFeatureName ? `${unlockedFeatureName} & Profile Boost` : "Profile Boost";
    }

    if (!newFeatures.exclusiveModes && userRewards.some(r => r.type === EXCLUSIVE_MODES_BADGE_TYPE)) {
        newFeatures.exclusiveModes = true;
        changed = true;
        unlockedFeatureName = unlockedFeatureName ? `${unlockedFeatureName} & Exclusive Modes` : "Exclusive Modes";
    }

    if (changed) {
       await updateDoc(userDocRef, { premiumFeatures: newFeatures, updatedAt: Timestamp.now() });
       console.log(`User ${userId} premium features updated:`, newFeatures);
       if (unlockedFeatureName) {
           showNotification("Premium Feature Unlocked!", { body: `You've unlocked: ${unlockedFeatureName}!`});
           // Conceptual: Trigger backend to send push notification for feature unlock
           // await triggerPushNotification(userId, "Premium Feature Unlocked!", `You've unlocked: ${unlockedFeatureName}!`);
       }
    }
}

/**
 * Adds a reward to a user's profile in Firestore (if they haven't earned it already).
 * Also adds points associated with the reward type and checks for premium feature unlocks.
 * Triggers a local notification if a badge is awarded.
 * @async
 * @function add_user_reward
 * @param {string} userId - The ID of the user.
 * @param {Omit<UserReward, 'id' | 'dateEarned'>} rewardData - Data for the new reward (type, name, desc).
 * @returns {Promise<boolean>} A promise resolving to true if the reward was added, false otherwise.
 */
export async function add_user_reward(userId: string, rewardData: Omit<UserReward, 'id' | 'dateEarned'>): Promise<boolean> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot add user reward.");
    return false;
  }
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
    
    showNotification("Badge Earned!", { body: `You've earned the "${rewardData.name}" badge!` });
    // Conceptual: Trigger backend to send push notification for new badge
    // await triggerPushNotification(userId, "Badge Earned!", `You've earned the "${rewardData.name}" badge!`);


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
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot set speed dating schedule.");
    return;
  }
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
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot set game preferences.");
    return;
  }
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
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot add user points.");
    return 0; // Or throw error
  }
  const userDocRef = doc(firestore, 'users', userId);
  
  const userProfileSnapshot = await getDoc(userDocRef);
  if (!userProfileSnapshot.exists()) {
    await update_user_profile(userId, { points: pointsToAdd });
  } else {
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
    case 'game_winner': return 15; 
    case 'blind_exchange_participant': return 20;
    case 'explorer': return 10;
    case 'chat_enthusiast': return 35;
    case 'top_contributor': return 100;
    case 'game_master': return 75;
    default: return 5;
  }
}

const mockUsersForMatching: UserProfile[] = [
    { id: 'mockUser1', name: 'Alex Doe', email: 'alex@example.com', bio: 'Loves hiking and reading.', interests: ['Hiking', 'Reading', 'Photography'], profilePicture: 'https://placehold.co/200x200.png?text=Alex', dataAiHint: 'man smiling', points: 120, fcmTokens: [] },
    { id: 'mockUser2', name: 'Brenda Smith', email: 'brenda@example.com', bio: 'Passionate about art and music.', interests: ['Art', 'Music', 'Travel'], profilePicture: 'https://placehold.co/200x200.png?text=Brenda', dataAiHint: 'woman nature', points: 250, fcmTokens: [] },
    { id: 'mockUser3', name: 'Charlie Brown', email: 'charlie@example.com', bio: 'Enjoys cooking and movies.', interests: ['Cooking', 'Movies', 'Gaming'], profilePicture: 'https://placehold.co/200x200.png?text=Charlie', dataAiHint: 'person thinking', points: 80, fcmTokens: [] },
    { id: 'mockUser4', name: 'Diana Prince', email: 'diana@example.com', bio: 'Tech enthusiast and avid gamer.', interests: ['Technology', 'Gaming', 'Science'], profilePicture: 'https://placehold.co/200x200.png?text=Diana', dataAiHint: 'woman glasses', points: 300, fcmTokens: [] },
];


/**
 * Retrieves all user profiles from Firestore, ordered by points for leaderboard.
 * For AI matching simulation, it returns a predefined list of mock users.
 * @async
 * @function get_all_users
 * @param {object} [options] - Optional parameters.
 * @param {boolean} [options.forMatching=false] - If true, returns a mock list for matching simulation.
 * @returns {Promise<UserProfile[]>} A promise that resolves to an array of user profiles.
 */
export async function get_all_users(options?: { forMatching?: boolean }): Promise<UserProfile[]> {
  if (criticalConfigError && !options?.forMatching) { // Allow mock matching even if Firebase is down
    console.error("Firebase is not configured. Cannot get all users.");
    return [];
  }
  if (options?.forMatching) {
    return mockUsersForMatching.map(user => ({
        ...{ // Default values for any potentially missing fields in mock data
            bio: "",
            interests: [],
            profilePicture: `https://placehold.co/200x200.png`,
            dataAiHint: "person placeholder",
            privacySettings: { showLocation: true, showOnlineStatus: true },
            rewards: [],
            points: 0,
            speedDatingSchedule: [],
            gamePreferences: [],
            premiumFeatures: { advancedFilters: false, profileBoost: false, exclusiveModes: false },
            fcmTokens: [],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        },
        ...user
    }));
  }

  const q = query(usersCollection, orderBy("points", "desc"), limit(100)); 
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


/**
 * Conceptual: Adds an FCM token to a user's profile.
 * This would be called from the client after obtaining an FCM token.
 * @async
 * @function addFcmTokenToUserProfile
 * @param {string} userId - The ID of the user.
 * @param {string} token - The FCM device token.
 * @returns {Promise<void>}
 */
export async function addFcmTokenToUserProfile(userId: string, token: string): Promise<void> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot add FCM token.");
    return;
  }
  const userDocRef = doc(firestore, 'users', userId);
  try {
    await updateDoc(userDocRef, {
      fcmTokens: arrayUnion(token), // Use arrayUnion to add token if not already present
      updatedAt: Timestamp.now(),
    });
    console.log(`FCM token added for user ${userId}`);
  } catch (error) {
    console.error(`Error adding FCM token for user ${userId}:`, error);
  }
}

/**
 * Conceptual: Removes an FCM token from a user's profile (e.g., on logout or token refresh).
 * @async
 * @function removeFcmTokenFromUserProfile
 * @param {string} userId - The ID of the user.
 * @param {string} token - The FCM device token to remove.
 * @returns {Promise<void>}
 */
export async function removeFcmTokenFromUserProfile(userId: string, token: string): Promise<void> {
  if (criticalConfigError) {
    console.error("Firebase is not configured. Cannot remove FCM token.");
    return;
  }
  const userDocRef = doc(firestore, 'users', userId);
  try {
    const user = await get_user(userId);
    const updatedTokens = (user.fcmTokens || []).filter(t => t !== token);
    await updateDoc(userDocRef, {
      fcmTokens: updatedTokens,
      updatedAt: Timestamp.now(),
    });
    console.log(`FCM token removed for user ${userId}`);
  } catch (error) {
    console.error(`Error removing FCM token for user ${userId}:`, error);
  }
}
