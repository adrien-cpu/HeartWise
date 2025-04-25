/**
 * @fileOverview Provides services for managing user profile data.
 * @module user_profile
 * @description This module defines the UserProfile interface and functions for retrieving and updating user profiles.
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
  privacySettings?: {
    showLocation?: boolean;
    showOnlineStatus?: boolean;
  };
  // Add other fields like age, preferences, etc. as needed
}

// Mock in-memory user data store
const mockUserData: { [key: string]: UserProfile } = {
  "user1": {
    id: "user1",
    name: "Alice",
    bio: "Loves hiking and photography.",
    interests: ["Hiking", "Photography", "Reading"],
    profilePicture: "/images/alice.jpg", // Placeholder
    privacySettings: {
      showLocation: true,
      showOnlineStatus: true,
    }
  },
  "user2": {
    id: "user2",
    name: "Bob",
    bio: "Passionate about cooking and travel.",
    interests: ["Cooking", "Travel"],
    profilePicture: "/images/bob.jpg", // Placeholder
    privacySettings: {
      showLocation: false,
      showOnlineStatus: true,
    }
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
    }
  };

  console.log("Updated profile:", mockUserData[userId]);
  return mockUserData[userId];
}
