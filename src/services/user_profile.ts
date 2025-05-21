
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
  limit,
  arrayRemove
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
      // Ensure dateEarned is always a Firestore Timestamp
      dateEarned: reward.dateEarned instanceof Timestamp ? reward.dateEarned : Timestamp.fromDate(new Date((reward.dateEarned as any)?.seconds ? (reward.dateEarned as any).seconds * 1000 : Date.now())),
    })) || [],
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : undefined,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : undefined,
    points: data.points ?? 0,
    premiumFeatures: data.premiumFeatures ?? { advancedFilters: false, profileBoost: false, exclusiveModes: false },
    gamePreferences: data.gamePreferences ?? [],
    speedDatingSchedule: data.speedDatingSchedule ?? [],
    interests: data.interests ?? [],
    privacySettings: data.privacySettings ?? { showLocation: true, showOnlineStatus: true },
    fcmTokens: data.fcmTokens ?? [],
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
      // This case should ideally not be hit if userDocSnap.exists() is true.
      // However, to satisfy TypeScript and as a fallback:
      console.error(`Failed to map document for user ID ${userId}. Data might be malformed. Returning default.`);
      return {
        id: userId, name: "Error User", email: "", bio: "", interests: [],
        profilePicture: `https://placehold.co/200x200.png`, dataAiHint: "person placeholder",
        privacySettings: { showLocation: true, showOnlineStatus: true },
        rewards: [], points: 0, speedDatingSchedule: [], gamePreferences: [],
        premiumFeatures: { advancedFilters: false, profileBoost: false, exclusiveModes: false },
        fcmTokens: [],
        createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
    };
  }

  // Ensure all optional fields have default values if they are undefined after mapping
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

  // Prepare data for Firestore, ensuring server timestamps are used for new docs
  const dataToUpdate: any = { ...profileData, updatedAt: serverTimestamp() };


  const docSnap = await getDoc(userDocRef);
  if (!docSnap.exists()) {
    dataToUpdate.createdAt = serverTimestamp();
    // Ensure default values for potentially missing fields on creation
    dataToUpdate.points = profileData.points ?? 0;
    dataToUpdate.rewards = profileData.rewards ?? [];
    dataToUpdate.premiumFeatures = profileData.premiumFeatures ?? { advancedFilters: false, profileBoost: false, exclusiveModes: false };
    dataToUpdate.privacySettings = profileData.privacySettings ?? { showLocation: true, showOnlineStatus: true };
    dataToUpdate.interests = profileData.interests ?? [];
    dataToUpdate.gamePreferences = profileData.gamePreferences ?? [];
    dataToUpdate.speedDatingSchedule = profileData.speedDatingSchedule ?? [];
    dataToUpdate.fcmTokens = profileData.fcmTokens ?? [];
    if (!profileData.profilePicture) { // Set default placeholder if not provided
        dataToUpdate.profilePicture = `https://placehold.co/200x200.png`;
        dataToUpdate.dataAiHint = "person placeholder";
    }
  }
  
  if (!dataToUpdate.dataAiHint && dataToUpdate.name) {
    dataToUpdate.dataAiHint = `${dataToUpdate.name.split(' ')[0].toLowerCase()} person`;
  }


  await setDoc(userDocRef, dataToUpdate, { merge: true });

  // Fetch the potentially merged profile to return the complete, updated state
  const updatedProfile = await get_user(userId);
  // After profile update, check if any premium features should be unlocked
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

    // Define thresholds and badge types for unlocking features
    const ADVANCED_FILTERS_POINTS_THRESHOLD = 500;
    const PROFILE_BOOST_BADGE_TYPE = 'top_contributor'; // Example badge type needed for profile boost
    const EXCLUSIVE_MODES_BADGE_TYPE = 'game_master';   // Example badge type needed for exclusive modes

    const userPoints = currentUserProfile.points || 0;
    const userRewards = currentUserProfile.rewards || [];

    // Check for Advanced Filters unlock
    if (!newFeatures.advancedFilters && userPoints >= ADVANCED_FILTERS_POINTS_THRESHOLD) {
        newFeatures.advancedFilters = true;
        changed = true;
        unlockedFeatureName = "Advanced Filters";
    }

    // Check for Profile Boost unlock
    if (!newFeatures.profileBoost && userRewards.some(r => r.type === PROFILE_BOOST_BADGE_TYPE)) {
        newFeatures.profileBoost = true;
        changed = true;
        unlockedFeatureName = unlockedFeatureName ? `${unlockedFeatureName} & Profile Boost` : "Profile Boost";
    }

    // Check for Exclusive Modes unlock
    if (!newFeatures.exclusiveModes && userRewards.some(r => r.type === EXCLUSIVE_MODES_BADGE_TYPE)) {
        newFeatures.exclusiveModes = true;
        changed = true;
        unlockedFeatureName = unlockedFeatureName ? `${unlockedFeatureName} & Exclusive Modes` : "Exclusive Modes";
    }

    if (changed) {
       await updateDoc(userDocRef, { premiumFeatures: newFeatures, updatedAt: serverTimestamp() });
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
  // Fetch the latest profile to check existing rewards accurately
  const userProfile = await get_user(userId); // Ensures we have the latest rewards array

  const hasReward = (userProfile.rewards || []).some(r => r.type === rewardData.type);

  if (!hasReward) {
    const newReward: UserReward = {
      ...rewardData,
      id: `rwd-${Date.now()}-${Math.random().toString(16).slice(2)}`, // Simple unique ID
      dateEarned: Timestamp.now(), // Use client-side timestamp for consistency if serverTimestamp causes issues in arrayUnion context
    };
    const pointsToAward = getPointsForReward(rewardData.type);

    await updateDoc(userDocRef, {
      rewards: arrayUnion(newReward), // Atomically adds the new reward to the array
      points: increment(pointsToAward), // Atomically increments points
      updatedAt: serverTimestamp(),
    });
    console.log(`Reward ${rewardData.type} added for user ${userId}. Points added: ${pointsToAward}.`);
    
    showNotification("Badge Earned!", { body: `You've earned the "${rewardData.name}" badge!` });
    // Conceptual: Trigger backend to send push notification for new badge
    // await triggerPushNotification(userId, "Badge Earned!", `You've earned the "${rewardData.name}" badge!`);


    // Re-fetch profile after update to pass the latest state to checkAndUnlockPremiumFeatures
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
  await updateDoc(userDocRef, { speedDatingSchedule: schedule, updatedAt: serverTimestamp() });
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
  await updateDoc(userDocRef, { gamePreferences: preferences, updatedAt: serverTimestamp() });
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
  
  // Ensure the user document exists before trying to increment points.
  // If it doesn't, create it with the initial points.
  const userProfileSnapshot = await getDoc(userDocRef);
  if (!userProfileSnapshot.exists()) {
    await update_user_profile(userId, { points: pointsToAdd });
  } else {
    await updateDoc(userDocRef, {
      points: increment(pointsToAdd), // Atomically increments points
      updatedAt: serverTimestamp(),
    });
  }

  const updatedProfile = await get_user(userId); // Fetch updated profile
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
  // Define points awarded for each badge type
  switch (rewardType) {
    case 'profile_complete': return 50;
    case 'first_chat': return 20;
    case 'first_match': return 30;
    case 'speed_dater': return 25;
    case 'game_winner': return 15; // Points for winning a game round
    case 'blind_exchange_participant': return 20;
    case 'explorer': return 10; // e.g., for using geolocation feature
    case 'chat_enthusiast': return 35; // e.g., for sending many messages
    case 'top_contributor': return 100; // e.g., for valuable feedback or high game scores
    case 'game_master': return 75; // e.g., for mastering multiple games
    default: return 5; // Default points for generic/unspecified rewards
  }
}

// Mock user data for AI matching simulation
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
  if (criticalConfigError && !options?.forMatching) {
    console.error("Firebase is not configured. Cannot get all users.");
    return [];
  }
  if (options?.forMatching) {
    // Ensure mock users have all UserProfile fields, especially profilePicture and dataAiHint
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
        ...user // Spread the mock user data, overriding defaults
    }));
  }

  const q = query(usersCollection, orderBy("points", "desc"), limit(100)); // For leaderboard, limit to top 100
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
 * Adds an FCM token to a user's profile in Firestore if it's not already present.
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
  if (!userId || !token) {
    console.error("User ID and token are required to add FCM token.");
    return;
  }
  const userDocRef = doc(firestore, 'users', userId);
  try {
    // Using arrayUnion ensures the token is only added if it's not already present.
    await updateDoc(userDocRef, {
      fcmTokens: arrayUnion(token),
      updatedAt: serverTimestamp(),
    });
    console.log(`FCM token added or confirmed for user ${userId}`);
  } catch (error) {
    console.error(`Error adding FCM token for user ${userId}:`, error);
  }
}

/**
 * Removes an FCM token from a user's profile (e.g., on logout or token refresh).
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
   if (!userId || !token) {
    console.error("User ID and token are required to remove FCM token.");
    return;
  }
  const userDocRef = doc(firestore, 'users', userId);
  try {
    // Using arrayRemove to remove the specific token.
    await updateDoc(userDocRef, {
      fcmTokens: arrayRemove(token),
      updatedAt: serverTimestamp(),
    });
    console.log(`FCM token removed for user ${userId}`);
  } catch (error) {
    console.error(`Error removing FCM token for user ${userId}:`, error);
  }
}

// Conceptual: Function that would be triggered by a backend service (e.g., Cloud Function)
// to send push notifications to users.
// async function triggerPushNotification(recipientUserIds: string[], title: string, body: string, data?: { [key: string]: string }) {
//   if (criticalConfigError) return;
//   console.log(`Conceptual: Triggering push notification to users: ${recipientUserIds.join(', ')}`);
//   console.log(`Title: ${title}, Body: ${body}, Data:`, data);

//   for (const userId of recipientUserIds) {
//     const userProfile = await get_user(userId);
//     if (userProfile && userProfile.fcmTokens && userProfile.fcmTokens.length > 0) {
//       // In a real backend with Firebase Admin SDK:
//       // const message = {
//       //   notification: { title, body },
//       //   tokens: userProfile.fcmTokens,
//       //   data: data // Optional custom data for the notification
//       // };
//       // await admin.messaging().sendMulticast(message);
//       // console.log(`Push notification sent to tokens for user ${userId}`);
//     } else {
//       console.log(`User ${userId} has no FCM tokens, cannot send push notification.`);
//     }
//   }
// }
