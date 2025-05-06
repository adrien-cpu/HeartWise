/**
 * @fileOverview Provides services for managing user profile data, including rewards and points.
 * @module user_profile
 * @description This module defines the UserProfile and UserReward interfaces and functions for retrieving/updating profiles, rewards, and points.
 *              Uses a mock in-memory store for demonstration.
 */

/**
 * Represents the structure of a user profile.
 */
export interface UserProfile {
  id: string;
  name?: string;
  bio?: string;
  interests?: string[];
  profilePicture?: string; // URL to the profile picture
  dataAiHint?: string; // Hint for AI image generation if profile picture is a placeholder
  privacySettings?: {
    showLocation?: boolean;
    showOnlineStatus?: boolean;
  };
  rewards?: UserReward[]; // User's earned badges/rewards
  points?: number; // Gamification points
  speedDatingSchedule?: string[]; // Added for Speed Dating feature
  gamePreferences?: string[]; // Added for Game feature
  // Add other fields like age, preferences, etc. as needed
}

/**
 * Represents a reward or badge earned by the user.
 */
export interface UserReward {
    id: string;
    name: string; // e.g., "First Chat Initiated"
    description: string; // e.g., "Started your first conversation!"
    type: string; // e.g., 'first_chat', 'profile_complete', 'game_winner'
    dateEarned: Date;
    icon?: string; // Optional: URL or identifier for a visual icon
}


// Mock in-memory user data store
const mockUserData: { [key: string]: UserProfile } = {
  "user1": {
    id: "user1",
    name: "Alice",
    bio: "Loves hiking and photography.",
    interests: ["Hiking", "Photography", "Reading"],
    profilePicture: "https://picsum.photos/seed/alice/200", // Using Picsum for placeholder
    dataAiHint: "woman nature",
    privacySettings: {
      showLocation: true,
      showOnlineStatus: true,
    },
    rewards: [
        { id: 'r1', name: 'Profile Complete', description: 'Filled out your profile details.', type: 'profile_complete', dateEarned: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { id: 'r2', name: 'First Chat', description: 'Initiated your first chat.', type: 'first_chat', dateEarned: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { id: 'r3', name: 'Explorer', description: 'Checked out the geolocation feature.', type: 'explorer', dateEarned: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ],
    points: 150, // Initial points for Alice
    speedDatingSchedule: [],
    gamePreferences: ["history", "geography"],
  },
  "user2": {
    id: "user2",
    name: "Bob",
    bio: "Passionate about cooking and travel.",
    interests: ["Cooking", "Travel"],
    profilePicture: "https://picsum.photos/seed/bob/200", // Using Picsum for placeholder
    dataAiHint: "man kitchen",
    privacySettings: {
      showLocation: false,
      showOnlineStatus: true,
    },
    rewards: [
        { id: 'r4', name: 'Profile Complete', description: 'Filled out your profile details.', type: 'profile_complete', dateEarned: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
    ],
    points: 50, // Initial points for Bob
    speedDatingSchedule: [],
    gamePreferences: ["science"],
  },
};

/**
 * Retrieves the profile for a given user ID.
 * @async
 * @function get_user
 * @param {string} userId - The ID of the user.
 * @returns {Promise<UserProfile>} A promise that resolves to the user's profile.
 * @throws {Error} If the user is not found.
 */
export async function get_user(userId: string): Promise<UserProfile> {
  console.log(`Fetching profile for user: ${userId}`);
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

  const user = mockUserData[userId];
  if (!user) {
    throw new Error(`User with ID ${userId} not found.`);
  }
  console.log("Fetched profile:", user);
  // Ensure rewards and points are initialized if missing
  if (!user.rewards) {
      user.rewards = [];
  }
  if (user.points === undefined) {
      user.points = 0;
  }
  return user;
}

/**
 * Updates the profile for a given user ID.
 * @async
 * @function update_user_profile
 * @param {string} userId - The ID of the user to update.
 * @param {Partial<UserProfile>} profileData - An object containing the profile fields to update.
 * @returns {Promise<UserProfile>} A promise that resolves to the updated user profile.
 * @throws {Error} If the user is not found or the update fails.
 */
export async function update_user_profile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
  console.log(`Updating profile for user: ${userId}`, profileData);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  if (!mockUserData[userId]) {
    throw new Error(`User with ID ${userId} not found.`);
  }

  // Merge the new data with the existing profile
  mockUserData[userId] = {
    ...mockUserData[userId],
    ...profileData,
    // Ensure privacy settings are merged correctly
    privacySettings: {
      ...(mockUserData[userId].privacySettings || {}), // Existing settings or empty object
      ...(profileData.privacySettings || {}),       // New settings or empty object
    },
    // Note: Rewards are typically added via specific actions, not general profile updates.
    // Merging interests, schedule, preferences correctly if they are part of the update
     interests: profileData.interests !== undefined ? profileData.interests : mockUserData[userId].interests,
     speedDatingSchedule: profileData.speedDatingSchedule !== undefined ? profileData.speedDatingSchedule : mockUserData[userId].speedDatingSchedule,
     gamePreferences: profileData.gamePreferences !== undefined ? profileData.gamePreferences : mockUserData[userId].gamePreferences,
     points: profileData.points !== undefined ? profileData.points : mockUserData[userId].points, // Merge points
     dataAiHint: profileData.dataAiHint !== undefined ? profileData.dataAiHint : mockUserData[userId].dataAiHint, // Merge dataAiHint
  };

  console.log("Updated profile:", mockUserData[userId]);
  return mockUserData[userId];
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
  await new Promise(resolve => setTimeout(resolve, 250)); // Simulate network delay

  const user = mockUserData[userId];
  if (!user) {
    throw new Error(`User with ID ${userId} not found.`);
  }

  return user.rewards || []; // Return rewards array or empty array if undefined
}

/**
 * Adds a reward to a user's profile (if they haven't earned it already).
 * Also adds points associated with the reward type.
 * @async
 * @function add_user_reward
 * @param {string} userId - The ID of the user.
 * @param {Omit<UserReward, 'id' | 'dateEarned'>} rewardData - Data for the new reward.
 * @returns {Promise<boolean>} A promise resolving to true if the reward was added, false otherwise.
 */
export async function add_user_reward(userId: string, rewardData: Omit<UserReward, 'id' | 'dateEarned'>): Promise<boolean> {
    console.log(`Attempting to add reward type ${rewardData.type} for user: ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

    const user = mockUserData[userId];
    if (!user) {
        console.error(`User not found: ${userId}`);
        return false;
    }

    if (!user.rewards) {
        user.rewards = [];
    }
     if (user.points === undefined) {
        user.points = 0;
    }

    // Check if the user already has this type of reward
    const hasReward = user.rewards.some(r => r.type === rewardData.type);

    if (!hasReward) {
        const newReward: UserReward = {
            ...rewardData,
            id: `r${Date.now()}-${Math.random().toString(16).substring(2, 8)}`, // Generate unique ID
            dateEarned: new Date(),
        };
        user.rewards.push(newReward);

        // Add points based on reward type (example values)
        const pointsToAdd = getPointsForReward(rewardData.type);
        user.points += pointsToAdd;

        console.log(`Reward ${rewardData.type} added for user ${userId}. Points added: ${pointsToAdd}. Total points: ${user.points}`);
        return true;
    } else {
         console.log(`User ${userId} already has reward ${rewardData.type}`);
        return false; // Reward already exists
    }
}

/**
 * Retrieves the speed dating schedule for a user.
 * Mock implementation.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<string[]>} A promise resolving to the user's schedule.
 */
export async function get_user_speed_dating_schedule(userId: string): Promise<string[]> {
  const user = await get_user(userId);
  return user.speedDatingSchedule || [];
}

/**
 * Sets the speed dating schedule for a user.
 * Mock implementation.
 * @param {string} userId - The ID of the user.
 * @param {string[]} schedule - The new schedule.
 * @returns {Promise<void>}
 */
export async function set_user_speed_dating_schedule(userId: string, schedule: string[]): Promise<void> {
  await update_user_profile(userId, { speedDatingSchedule: schedule });
}

/**
 * Retrieves the game preferences for a user.
 * Mock implementation.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<string[]>} A promise resolving to the user's game preferences.
 */
export async function get_user_game_preferences(userId: string): Promise<string[]> {
    const user = await get_user(userId);
    return user.gamePreferences || [];
}

/**
 * Sets the game preferences for a user.
 * Mock implementation.
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
 * Adds points to a user's profile.
 * @async
 * @function add_user_points
 * @param {string} userId - The ID of the user.
 * @param {number} pointsToAdd - The number of points to add.
 * @returns {Promise<number>} A promise resolving to the user's new total points.
 * @throws {Error} If the user is not found.
 */
export async function add_user_points(userId: string, pointsToAdd: number): Promise<number> {
  console.log(`Adding ${pointsToAdd} points to user: ${userId}`);
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay

  if (!mockUserData[userId]) {
    throw new Error(`User with ID ${userId} not found.`);
  }

  if (mockUserData[userId].points === undefined) {
    mockUserData[userId].points = 0;
  }

  mockUserData[userId].points! += pointsToAdd;
  console.log(`User ${userId} new total points: ${mockUserData[userId].points}`);
  return mockUserData[userId].points!;
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
        default: return 5; // Default points for unknown badges
    }
}
