/**
 * @fileOverview User profile service using Supabase.
 * @module user_profile
 */

import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

export type UserProfile = Database['public']['Tables']['users']['Row'] & {
  rewards?: UserReward[];
};

export interface UserReward {
  id: string;
  name: string;
  description: string | null;
  type: string;
  icon: string | null;
  date_earned: string;
  created_at: string;
}

export interface PremiumFeatures {
  advancedFilters?: boolean;
  profileBoost?: boolean;
  exclusiveModes?: boolean;
}

/**
 * Get user profile by ID
 */
export async function get_user(userId: string): Promise<UserProfile> {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError && userError.code !== 'PGRST116') {
    throw new Error(`Failed to fetch user: ${userError.message}`);
  }

  // Get user rewards
  const { data: rewards, error: rewardsError } = await supabase
    .from('user_rewards')
    .select('*')
    .eq('user_id', userId)
    .order('date_earned', { ascending: false });

  if (rewardsError) {
    console.error('Error fetching rewards:', rewardsError);
  }

  // Create default profile if user doesn't exist
  if (!user) {
    const defaultProfile: UserProfile = {
      id: userId,
      name: 'New User',
      email: '',
      bio: null,
      profile_picture: null,
      data_ai_hint: 'person placeholder',
      interests: [],
      points: 0,
      speed_dating_schedule: [],
      game_preferences: [],
      privacy_settings: { showLocation: true, showOnlineStatus: true },
      premium_features: { advancedFilters: false, profileBoost: false, exclusiveModes: false },
      fcm_tokens: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      rewards: rewards || [],
    };
    return defaultProfile;
  }

  return {
    ...user,
    rewards: rewards || [],
  };
}

/**
 * Update user profile
 */
export async function update_user_profile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('users')
    .upsert({ 
      id: userId, 
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return get_user(userId);
}

/**
 * Add user reward
 */
export async function add_user_reward(userId: string, rewardData: Omit<UserReward, 'id' | 'date_earned' | 'created_at'>): Promise<boolean> {
  // Check if user already has this reward
  const { data: existing } = await supabase
    .from('user_rewards')
    .select('id')
    .eq('user_id', userId)
    .eq('type', rewardData.type)
    .single();

  if (existing) {
    console.log(`User ${userId} already has reward ${rewardData.type}`);
    return false;
  }

  const { error } = await supabase
    .from('user_rewards')
    .insert({
      user_id: userId,
      ...rewardData,
    });

  if (error) {
    throw new Error(`Failed to add reward: ${error.message}`);
  }

  // Award points for the reward
  const pointsToAward = getPointsForReward(rewardData.type);
  await add_user_points(userId, pointsToAward);

  return true;
}

/**
 * Add points to user
 */
export async function add_user_points(userId: string, pointsToAdd: number): Promise<number> {
  const { data, error } = await supabase.rpc('increment_user_points', {
    user_id: userId,
    points_to_add: pointsToAdd
  });

  if (error) {
    // Fallback: manual update
    const user = await get_user(userId);
    const newPoints = (user.points || 0) + pointsToAdd;
    await update_user_profile(userId, { points: newPoints });
    return newPoints;
  }

  return data;
}

/**
 * Get all users for leaderboard
 */
export async function get_all_users(options?: { forMatching?: boolean }): Promise<UserProfile[]> {
  if (options?.forMatching) {
    // Return mock data for matching simulation
    return [
      { id: 'mock1', name: 'Alex Doe', email: 'alex@example.com', bio: 'Loves hiking', interests: ['Hiking', 'Reading'], profile_picture: 'https://placehold.co/200x200.png?text=Alex', data_ai_hint: 'man smiling', points: 120, speed_dating_schedule: [], game_preferences: [], privacy_settings: {}, premium_features: {}, fcm_tokens: [], created_at: '', updated_at: '' },
      { id: 'mock2', name: 'Brenda Smith', email: 'brenda@example.com', bio: 'Art lover', interests: ['Art', 'Music'], profile_picture: 'https://placehold.co/200x200.png?text=Brenda', data_ai_hint: 'woman nature', points: 250, speed_dating_schedule: [], game_preferences: [], privacy_settings: {}, premium_features: {}, fcm_tokens: [], created_at: '', updated_at: '' },
    ];
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('points', { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return data.map(user => ({ ...user, rewards: [] }));
}

/**
 * Helper function to get points for reward type
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

// Game preferences functions
export async function get_user_game_preferences(userId: string): Promise<string[]> {
  const user = await get_user(userId);
  return user.game_preferences;
}

export async function set_user_game_preferences(userId: string, preferences: string[]): Promise<void> {
  await update_user_profile(userId, { game_preferences: preferences });
}

// Speed dating schedule functions
export async function get_user_speed_dating_schedule(userId: string): Promise<string[]> {
  const user = await get_user(userId);
  return user.speed_dating_schedule;
}

export async function set_user_speed_dating_schedule(userId: string, schedule: string[]): Promise<void> {
  await update_user_profile(userId, { speed_dating_schedule: schedule });
}

// Points functions
export async function get_user_points(userId: string): Promise<number> {
  const user = await get_user(userId);
  return user.points;
}

export async function get_user_rewards(userId: string): Promise<UserReward[]> {
  const user = await get_user(userId);
  return user.rewards || [];
}

export async function get_user_premium_features(userId: string): Promise<PremiumFeatures> {
  const user = await get_user(userId);
  return user.premium_features || { advancedFilters: false, profileBoost: false, exclusiveModes: false };
}