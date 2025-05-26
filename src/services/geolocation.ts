/**
 * @fileOverview Provides services for retrieving geolocation data and meeting places.
 *
 * @module geolocation
 *
 * @description This module defines the Location and MeetingPlace interfaces,
 * and the getMeetingPlaces function for retrieving meeting places for a given location.
 * It also includes conceptual functions for fetching nearby users and compatibility.
 */

import type { UserProfile } from './user_profile'; // For compatibility calculation
import { get_user } from './user_profile'; // To fetch user profiles

/**
 * Represents a geographical location with latitude and longitude coordinates.
 */
export interface Location {
  /**
   * The latitude of the location.
   */
  lat: number;
  /**
   * The longitude of the location.
   */
  lng: number;
}

/**
 * Represents a meeting place with location and name
 */
export interface MeetingPlace {
  /**
   * The name of the meeting place.
   */
  name: string;
  /**
   * The location of the meeting place
   */
  location: Location;
}

/**
 * @interface NearbyUser
 * @description Represents a user found nearby.
 */
export interface NearbyUser {
  id: string;
  name: string;
  profilePicture?: string;
  dataAiHint?: string;
  distance: number; // in km
  location: Location;
  interests?: string[];
}


/**
 * Asynchronously retrieves meeting places for a given location.
 *
 * @async
 * @function getMeetingPlaces
 * @param {Location} location - The location for which to retrieve meeting places.
 * @returns {Promise<MeetingPlace[]>} A promise that resolves to a list of meeting places.
 */
export async function getMeetingPlaces(location: Location): Promise<MeetingPlace[]> {
  // TODO: Implement this by calling a real places API (e.g., Google Places API).
  console.log(`Simulating fetching meeting places near: ${location.lat}, ${location.lng}`);
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API delay

  // Mock data for demonstration
  const mockPlacesBase = [
    { name: 'Café Central', offsetLat: 0.002, offsetLng: -0.001 },
    { name: 'City Park Fountain', offsetLat: -0.005, offsetLng: 0.003 },
    { name: 'Public Library Steps', offsetLat: 0.001, offsetLng: 0.005 },
    { name: 'The Art Gallery Courtyard', offsetLat: 0.008, offsetLng: -0.002 },
    { name: 'Riverside Bench', offsetLat: -0.003, offsetLng: -0.006 },
  ];

  return mockPlacesBase.map(place => ({
    name: place.name,
    location: {
      lat: location.lat + place.offsetLat,
      lng: location.lng + place.offsetLng,
    },
  }));
}

/**
 * Retrieves the location of a user.
 * This is a placeholder. In a real app, this would fetch from a database where users store their last known location (with consent).
 * @param userId - The ID of the user.
 * @returns A promise that resolves to the user's location or null if not found/not shared.
 */
export async function getUserLocation(userId: string): Promise<Location | null> {
  // TODO: Implement this by calling an API or database.
  console.log(`Simulating fetching location for user: ${userId}`);
  await new Promise(resolve => setTimeout(resolve, 300));

  // Placeholder implementation:
  const mockUserLocations: { [key: string]: Location } = {
    'user1': { lat: 37.7749, lng: -122.4194 }, // Example: San Francisco
    'user2': { lat: 34.0522, lng: -118.2437 }, // Example: Los Angeles
    'mockUser1': { lat: 37.7759, lng: -122.4204 },
    'mockUser2': { lat: 37.7700, lng: -122.4100 },
  };
  return mockUserLocations[userId] || null;
}

/**
 * Calculates the distance between two locations using the Haversine formula.
 *
 * @param location1 - The first location.
 * @param location2 - The second location.
 * @returns The distance between the two locations in kilometers.
 */
export function calculateDistance(location1: Location, location2: Location): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (location2.lat - location1.lat) * Math.PI / 180;
  const dLng = (location2.lng - location1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(location1.lat * Math.PI / 180) *
    Math.cos(location2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

/**
 * Simulates fetching nearby users.
 * In a real application, this would query a backend with geospatial indexing capabilities.
 * @async
 * @function fetchNearbyUsersFromService
 * @param {Location} currentLocation - The current user's location.
 * @param {number} [radiusKm=10] - The search radius in kilometers.
 * @returns {Promise<NearbyUser[]>} A list of simulated nearby users.
 */
export async function fetchNearbyUsersFromService(currentLocation: Location, radiusKm: number = 10): Promise<NearbyUser[]> {
  console.log(`Simulating fetching nearby users within ${radiusKm}km of: ${currentLocation.lat}, ${currentLocation.lng}`);
  // TODO: Replace with actual backend call.
  // The backend would query a database (e.g., Firestore with GeoFirestore, PostGIS)
  // for users within the specified radius.
  await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate network delay

  // Mock data for demonstration - these users would typically come from your user database
  const allMockUsers: UserProfile[] = [
    { id: 'mockUserNearby1', name: 'Alex N.', email: 'alex@example.com', interests: ['Hiking', 'Coffee'], profilePicture: 'https://placehold.co/100x100.png?text=AN', dataAiHint: 'man nature', privacySettings: { showLocation: true } },
    { id: 'mockUserNearby2', name: 'Brenda K.', email: 'brenda@example.com', interests: ['Books', 'Art'], profilePicture: 'https://placehold.co/100x100.png?text=BK', dataAiHint: 'woman smiling', privacySettings: { showLocation: true } },
    { id: 'mockUserNearby3', name: 'Charlie M.', email: 'charlie@example.com', interests: ['Music', 'Tech'], profilePicture: 'https://placehold.co/100x100.png?text=CM', dataAiHint: 'person city', privacySettings: { showLocation: true } },
    { id: 'mockUserFar', name: 'David F.', email: 'david@example.com', interests: ['Movies'], profilePicture: 'https://placehold.co/100x100.png?text=DF', dataAiHint: 'man outdoor', privacySettings: { showLocation: true } },
  ];

  // Simulate locations for these mock users relative to currentLocation for testing
  const mockUserLocations: { [id: string]: Location } = {
    'mockUserNearby1': { lat: currentLocation.lat + 0.01, lng: currentLocation.lng + 0.01 }, // Approx 1.5km
    'mockUserNearby2': { lat: currentLocation.lat - 0.02, lng: currentLocation.lng - 0.015 }, // Approx 3km
    'mockUserNearby3': { lat: currentLocation.lat + 0.005, lng: currentLocation.lng - 0.008 }, // Approx 1km
    'mockUserFar': { lat: currentLocation.lat + 0.1, lng: currentLocation.lng + 0.15 }, // Approx > 15km
  };

  return allMockUsers
    .filter(user => user.privacySettings?.showLocation) // Only include users who share location
    .map(user => {
      const userMockLocation = mockUserLocations[user.id] || { lat: 0, lng: 0 }; // Fallback location
      return {
        id: user.id,
        name: user.name || 'Unknown User',
        profilePicture: user.profilePicture,
        dataAiHint: user.dataAiHint,
        location: userMockLocation,
        distance: calculateDistance(currentLocation, userMockLocation),
        interests: user.interests,
      };
    })
    .filter(user => user.distance <= radiusKm) // Filter by radius
    .sort((a, b) => a.distance - b.distance); // Sort by distance
}


/**
 * Conceptual: Calculates a meeting compatibility score between two users.
 * This would typically be a backend calculation.
 * @async
 * @function getMeetingCompatibility
 * @param {string} user1Id - ID of the first user.
 * @param {string} user2Id - ID of the second user.
 * @returns {Promise<number>} A compatibility score (0-100).
 */
export async function getMeetingCompatibility(user1Id: string, user2Id: string): Promise<number> {
  console.log(`Conceptual: Calculating meeting compatibility between ${user1Id} and ${user2Id}`);
  // In a real app, this would:
  // 1. Fetch full profiles for user1 and user2 (or relevant parts like location, interests).
  //    const user1Profile = await get_user(user1Id);
  //    const user2Profile = await get_user(user2Id);
  //    if (!user1Profile || !user2Profile) return 0;
  //    const location1 = user1Profile.location; // Assuming location is part of UserProfile
  //    const location2 = user2Profile.location;

  // For simulation, let's use mock data if needed or assume some values
  const user1Profile = await get_user(user1Id); // Using existing service
  const user2Profile = await get_user(user2Id);

  if (!user1Profile || !user2Profile) return 0;

  let score = 0;

  // a. Proximity Score (example: max 40 points)
  const loc1 = await getUserLocation(user1Id); // Or from userProfile if stored & recent
  const loc2 = await getUserLocation(user2Id);
  if (loc1 && loc2) {
    const distance = calculateDistance(loc1, loc2);
    if (distance < 1) score += 40;       // Very close
    else if (distance < 5) score += 30;  // Nearby
    else if (distance < 10) score += 20; // Moderate distance
    else if (distance < 20) score += 10; // Bit far
  }

  // b. Shared Interests Score (example: max 40 points)
  const interests1 = user1Profile.interests || [];
  const interests2 = user2Profile.interests || [];
  const sharedInterests = interests1.filter(i => interests2.includes(i));
  score += Math.min(40, sharedInterests.length * 10); // 10 points per shared interest, max 40

  // c. Other factors (e.g., age compatibility, preferences - placeholder, max 20 points)
  // This would require more profile data. For now, a small random bonus.
  score += Math.random() * 20;

  return Math.min(100, Math.round(score)); // Ensure score is between 0 and 100
}
