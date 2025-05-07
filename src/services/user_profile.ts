/**
 * @fileOverview Provides services for managing user profile data, including rewards and points.
 * @module user_profile
 * @description This module defines the UserProfile, UserReward, and PremiumFeatures interfaces and functions for retrieving/updating profiles, rewards, and points.
 *              Uses a mock in-memory store for demonstration. It also simulates unlocking premium features.
 */

/**
 * Defines the structure for premium features available to users.
 */
export interface PremiumFeatures {
  advancedFilters?: boolean; // e.g., Unlocked by points
  profileBoost?: boolean;    // e.g., Unlocked by a specific badge
  exclusiveModes?: boolean;  // e.g., Unlocked by another badge
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
  dataAiHint?: string;
  privacySettings?: {
    showLocation?: boolean;
    showOnlineStatus?: boolean;
  };
  rewards?: UserReward[];
  points?: number;
  speedDatingSchedule?: string[];
  gamePreferences?: string[];
  premiumFeatures?: PremiumFeatures; // Added premium features
}

/**
 * Represents a reward or badge earned by the user.
 */
export interface UserReward {
    id: string;
    name: string;
    description: string;
    type: string; // e.g., 'first_chat', 'profile_complete', 'game_winner', 'chat_enthusiast', 'top_contributor'
    dateEarned: Date;
    icon?: string;
}


// Mock in-memory user data store
const mockUserData: { [key: string]: UserProfile } = {
  "user1": {
    id: "user1",
    name: "Alice",
    email: "alice@example.com",
    bio: "Loves hiking and photography.",
    interests: ["Hiking", "Photography", "Reading"],
    profilePicture: "https://picsum.photos/seed/alice/200",
    dataAiHint: "woman nature",
    privacySettings: {
      showLocation: true,
      showOnlineStatus: true,
    },
    rewards: [
        { id: 'r1', name: 'Profile Pro', description: 'Filled out your profile details.', type: 'profile_complete', dateEarned: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { id: 'r2', name: 'Ice Breaker', description: 'Initiated your first chat.', type: 'first_chat', dateEarned: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { id: 'r3', name: 'Local Explorer', description: 'Checked out the geolocation feature.', type: 'explorer', dateEarned: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ],
    points: 175,
    speedDatingSchedule: [],
    gamePreferences: ["history", "geography"],
    premiumFeatures: { advancedFilters: false, profileBoost: false, exclusiveModes: false },
  },
  "user2": {
    id: "user2",
    name: "Bob",
    email: "bob@example.com",
    bio: "Passionate about cooking and travel.",
    interests: ["Cooking", "Travel"],
    profilePicture: "https://picsum.photos/seed/bob/200",
    dataAiHint: "man kitchen",
    privacySettings: {
      showLocation: false,
      showOnlineStatus: true,
    },
    rewards: [
        { id: 'r4', name: 'Profile Pro', description: 'Filled out your profile details.', type: 'profile_complete', dateEarned: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
    ],
    points: 50,
    speedDatingSchedule: [],
    gamePreferences: ["science"],
    premiumFeatures: { advancedFilters: false, profileBoost: false, exclusiveModes: false },
  },
  "user3": {
    id: "user3",
    name: "Charlie",
    email: "charlie@example.com",
    bio: "Tech enthusiast and bookworm.",
    interests: ["Tech", "Books", "Gaming"],
    profilePicture: "https://picsum.photos/seed/charlie/200",
    dataAiHint: "person reading",
    privacySettings: { showLocation: true, showOnlineStatus: false },
    rewards: [
        { id: 'r5', name: 'Profile Pro', description: 'Filled out your profile details.', type: 'profile_complete', dateEarned: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
        { id: 'r6', name: 'Quiz Whiz', description: 'Won a round in the game.', type: 'game_winner', dateEarned: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
        { id: 'r9', name: 'Top Contributor', description: 'Provided valuable feedback or content.', type: 'top_contributor', dateEarned: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ],
    points: 210,
    speedDatingSchedule: [],
    gamePreferences: ["science", "history"],
    premiumFeatures: { advancedFilters: false, profileBoost: true, exclusiveModes: false }, // Charlie has Profile Boost
  },
   "user4": {
    id: "user4",
    name: "Diana",
    email: "diana@example.com",
    bio: "Outdoor adventurer and music lover.",
    interests: ["Hiking", "Music", "Travel", "Sports"],
    profilePicture: "https://picsum.photos/seed/diana/200",
    dataAiHint: "woman mountains",
    privacySettings: { showLocation: true, showOnlineStatus: true },
    rewards: [
         { id: 'r7', name: 'Profile Pro', description: 'Filled out your profile details.', type: 'profile_complete', dateEarned: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
         { id: 'r8', name: 'Speed Dater', description: 'Participated in a Speed Dating session.', type: 'speed_dater', dateEarned: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ],
    points: 550, // Diana has enough for advanced filters
    speedDatingSchedule: [],
    gamePreferences: ["music", "geography"],
    premiumFeatures: { advancedFilters: true, profileBoost: false, exclusiveModes: false }, // Diana has Advanced Filters
   },
};

/**
 * Retrieves the profile for a given user ID.
 * Initializes rewards, points, and premium features if missing.
 * @async
 * @function get_user
 * @param {string} userId - The ID of the user.
 * @returns {Promise<UserProfile>} A promise that resolves to the user's profile.
 * @throws {Error} If the user is not found.
 */
export async function get_user(userId: string): Promise<UserProfile> {
  console.log(`Fetching profile for user: ${userId}`);
  await new Promise(resolve => setTimeout(resolve, 300));

  const user = mockUserData[userId];
  if (!user) {
    throw new Error(`User with ID ${userId} not found.`);
  }

  // Ensure defaults are set
  if (!user.rewards) user.rewards = [];
  if (user.points === undefined) user.points = 0;
  if (!user.premiumFeatures) user.premiumFeatures = { advancedFilters: false, profileBoost: false, exclusiveModes: false };
  if (user.premiumFeatures.advancedFilters === undefined) user.premiumFeatures.advancedFilters = false;
  if (user.premiumFeatures.profileBoost === undefined) user.premiumFeatures.profileBoost = false;
  if (user.premiumFeatures.exclusiveModes === undefined) user.premiumFeatures.exclusiveModes = false;
  if (!user.speedDatingSchedule) user.speedDatingSchedule = [];
  if (!user.gamePreferences) user.gamePreferences = [];
  if (!user.privacySettings) user.privacySettings = { showLocation: true, showOnlineStatus: true };


  console.log("Fetched profile:", user);
  return user;
}

/**
 * Updates the profile for a given user ID.
 * Merges provided data with existing profile data.
 * @async
 * @function update_user_profile
 * @param {string} userId - The ID of the user to update.
 * @param {Partial<UserProfile>} profileData - An object containing the profile fields to update.
 * @returns {Promise<UserProfile>} A promise that resolves to the updated user profile.
 * @throws {Error} If the user is not found or the update fails.
 */
export async function update_user_profile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
  console.log(`Updating profile for user: ${userId}`, profileData);
  await new Promise(resolve => setTimeout(resolve, 500));

  const existingUser = mockUserData[userId];

  if (!existingUser) {
    // If user doesn't exist, create them (useful for signup)
    mockUserData[userId] = {
      id: userId,
      name: profileData.name,
      email: profileData.email,
      bio: profileData.bio,
      interests: profileData.interests || [],
      profilePicture: profileData.profilePicture,
      dataAiHint: profileData.dataAiHint,
      privacySettings: profileData.privacySettings || { showLocation: true, showOnlineStatus: true },
      rewards: profileData.rewards || [],
      points: profileData.points || 0,
      speedDatingSchedule: profileData.speedDatingSchedule || [],
      gamePreferences: profileData.gamePreferences || [],
      premiumFeatures: profileData.premiumFeatures || { advancedFilters: false, profileBoost: false, exclusiveModes: false },
    };
    console.log("Created new profile:", mockUserData[userId]);
  } else {
    // Merge the new data with the existing profile
    mockUserData[userId] = {
      ...existingUser,
      ...profileData,
      privacySettings: {
        ...(existingUser.privacySettings || {}),
        ...(profileData.privacySettings || {}),
      },
      premiumFeatures: {
        ...(existingUser.premiumFeatures || {}),
        ...(profileData.premiumFeatures || {}),
      },
      interests: profileData.interests !== undefined ? profileData.interests : existingUser.interests,
      speedDatingSchedule: profileData.speedDatingSchedule !== undefined ? profileData.speedDatingSchedule : existingUser.speedDatingSchedule,
      gamePreferences: profileData.gamePreferences !== undefined ? profileData.gamePreferences : existingUser.gamePreferences,
      points: profileData.points !== undefined ? profileData.points : existingUser.points,
      dataAiHint: profileData.dataAiHint !== undefined ? profileData.dataAiHint : existingUser.dataAiHint,
    };
    console.log("Updated profile:", mockUserData[userId]);
  }

  // Re-ensure defaults after merging, especially for nested objects
  const user = mockUserData[userId];
  if (!user.rewards) user.rewards = [];
  if (user.points === undefined) user.points = 0;
  if (!user.premiumFeatures) user.premiumFeatures = { advancedFilters: false, profileBoost: false, exclusiveModes: false };
  if (user.premiumFeatures.advancedFilters === undefined) user.premiumFeatures.advancedFilters = false;
  if (user.premiumFeatures.profileBoost === undefined) user.premiumFeatures.profileBoost = false;
  if (user.premiumFeatures.exclusiveModes === undefined) user.premiumFeatures.exclusiveModes = false;

  return user;
}


/**
 * Retrieves the rewards for a given user ID.
 * @async
 * @function get_user_rewards
 * @param {string} userId - The ID of the user.
 * @returns {Promise<UserReward[]>} A promise that resolves to an array of the user's rewards.
 * @throws {Error} If the user is not found.
 */
export async function get_user_rewards(userId: string): Promise<UserReward[]> {
  console.log(`Fetching rewards for user: ${userId}`);
  await new Promise(resolve => setTimeout(resolve, 250));

  const user = await get_user(userId); // Ensures user and defaults are loaded
  return user.rewards || [];
}

/**
 * Checks and potentially unlocks premium features based on user's points and rewards.
 * This function is called internally after points or rewards are updated.
 * @param {string} userId - The ID of the user.
 */
async function checkAndUnlockPremiumFeatures(userId: string): Promise<void> {
    const user = mockUserData[userId];
    if (!user || !user.premiumFeatures) return;

    let changed = false;

    // Unlock Advanced Filters by points
    if (!user.premiumFeatures.advancedFilters && (user.points || 0) >= 500) {
        user.premiumFeatures.advancedFilters = true;
        console.log(`User ${userId} unlocked Advanced Filters.`);
        changed = true;
        // Potentially trigger a notification or UI update here
    }

    // Unlock Profile Boost by 'top_contributor' badge
    if (!user.premiumFeatures.profileBoost && user.rewards?.some(r => r.type === 'top_contributor')) {
        user.premiumFeatures.profileBoost = true;
        console.log(`User ${userId} unlocked Profile Boost.`);
         changed = true;
    }

    // Unlock Exclusive Modes by 'game_master' badge
    if (!user.premiumFeatures.exclusiveModes && user.rewards?.some(r => r.type === 'game_master')) {
        user.premiumFeatures.exclusiveModes = true;
        console.log(`User ${userId} unlocked Exclusive Game Modes.`);
         changed = true;
    }

    // If any feature status changed, update the mock store
    if (changed) {
       mockUserData[userId] = user;
       // In a real backend, this is where you'd persist the updated premiumFeatures
       // e.g., await update_user_profile(userId, { premiumFeatures: user.premiumFeatures });
       // Avoid calling update_user_profile here to prevent potential infinite loops
       console.log(`Updated premium features for user ${userId}:`, user.premiumFeatures);
    }
}


/**
 * Adds a reward to a user's profile (if they haven't earned it already).
 * Also adds points associated with the reward type and checks for premium feature unlocks.
 * @async
 * @function add_user_reward
 * @param {string} userId - The ID of the user.
 * @param {Omit<UserReward, 'id' | 'dateEarned'>} rewardData - Data for the new reward.
 * @returns {Promise<boolean>} A promise resolving to true if the reward was added, false otherwise.
 */
export async function add_user_reward(userId: string, rewardData: Omit<UserReward, 'id' | 'dateEarned'>): Promise<boolean> {
    console.log(`Attempting to add reward type ${rewardData.type} for user: ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 100));

    const user = await get_user(userId); // Ensures user and defaults are loaded

    const hasReward = user.rewards!.some(r => r.type === rewardData.type);

    if (!hasReward) {
        const newReward: UserReward = {
            ...rewardData,
            id: `r${Date.now()}-${Math.random().toString(16).substring(2, 8)}`,
            dateEarned: new Date(),
        };
        user.rewards!.push(newReward);

        const pointsToAdd = getPointsForReward(rewardData.type);
        user.points! += pointsToAdd;

        console.log(`Reward ${rewardData.type} added for user ${userId}. Points added: ${pointsToAdd}. Total points: ${user.points}`);
        mockUserData[userId] = user; // Update mock data
        await checkAndUnlockPremiumFeatures(userId); // Check for unlocks after adding reward and points
        return true;
    } else {
         console.log(`User ${userId} already has reward ${rewardData.type}`);
        return false;
    }
}

/**
 * Retrieves the speed dating schedule for a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<string[]>} A promise resolving to the user's schedule.
 */
export async function get_user_speed_dating_schedule(userId: string): Promise<string[]> {
  const user = await get_user(userId);
  return user.speedDatingSchedule || [];
}

/**
 * Sets the speed dating schedule for a user.
 * @param {string} userId - The ID of the user.
 * @param {string[]} schedule - The new schedule.
 * @returns {Promise<void>}
 */
export async function set_user_speed_dating_schedule(userId: string, schedule: string[]): Promise<void> {
  await update_user_profile(userId, { speedDatingSchedule: schedule });
}

/**
 * Retrieves the game preferences for a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<string[]>} A promise resolving to the user's game preferences.
 */
export async function get_user_game_preferences(userId: string): Promise<string[]> {
    const user = await get_user(userId);
    return user.gamePreferences || [];
}

/**
 * Sets the game preferences for a user.
 * @param {string} userId - The ID of the user.
 * @param {string[]} preferences - The new game preferences.
 * @returns {Promise<void>}
 */
export async function set_user_game_preferences(userId: string, preferences: string[]): Promise<void> {
    await update_user_profile(userId, { gamePreferences: preferences });
}

/**
 * Retrieves the user's current points.
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
 * Adds points to a user's profile and checks for premium feature unlocks.
 * @async
 * @function add_user_points
 * @param {string} userId - The ID of the user.
 * @param {number} pointsToAdd - The number of points to add.
 * @returns {Promise<number>} A promise resolving to the user's new total points.
 * @throws {Error} If the user is not found.
 */
export async function add_user_points(userId: string, pointsToAdd: number): Promise<number> {
  console.log(`Adding ${pointsToAdd} points to user: ${userId}`);
  await new Promise(resolve => setTimeout(resolve, 50));

  const user = await get_user(userId); // Ensures user and defaults are loaded

  user.points! += pointsToAdd;
  console.log(`User ${userId} new total points: ${user.points}`);
  mockUserData[userId] = user; // Update mock data
  await checkAndUnlockPremiumFeatures(userId); // Check for unlocks after adding points
  return user.points!;
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
        case 'chat_enthusiast': return 35; // New badge
        case 'top_contributor': return 100; // New badge
        case 'game_master': return 75; // New badge
        default: return 5;
    }
}

/**
 * Retrieves all user profiles (for leaderboard simulation).
 * Ensures points and premium features are initialized for all users.
 * @async
 * @function get_all_users
 * @returns {Promise<UserProfile[]>} A promise that resolves to an array of all user profiles.
 */
export async function get_all_users(): Promise<UserProfile[]> {
  console.log("Fetching all user profiles for leaderboard");
  await new Promise(resolve => setTimeout(resolve, 400));
  // Ensure defaults are applied to all users before returning
  Object.keys(mockUserData).forEach(id => {
      const user = mockUserData[id];
       if (!user.rewards) user.rewards = [];
       if (user.points === undefined) user.points = 0;
       if (!user.premiumFeatures) user.premiumFeatures = { advancedFilters: false, profileBoost: false, exclusiveModes: false };
       if (user.premiumFeatures.advancedFilters === undefined) user.premiumFeatures.advancedFilters = false;
       if (user.premiumFeatures.profileBoost === undefined) user.premiumFeatures.profileBoost = false;
       if (user.premiumFeatures.exclusiveModes === undefined) user.premiumFeatures.exclusiveModes = false;
       if (!user.speedDatingSchedule) user.speedDatingSchedule = [];
       if (!user.gamePreferences) user.gamePreferences = [];
       if (!user.privacySettings) user.privacySettings = { showLocation: true, showOnlineStatus: true };
  })
  return Object.values(mockUserData);
}

/**
 * Retrieves the premium features status for a given user.
 * @async
 * @function get_user_premium_features
 * @param {string} userId - The ID of the user.
 * @returns {Promise<PremiumFeatures>} A promise resolving to the user's premium features status.
 */
export async function get_user_premium_features(userId: string): Promise<PremiumFeatures> {
    const user = await get_user(userId);
    return user.premiumFeatures || { advancedFilters: false, profileBoost: false, exclusiveModes: false };
}
