/**
 * @fileOverview Provides services for retrieving geolocation data and meeting places.
 *
 * @module geolocation
 *
 * @description This module defines the Location and MeetingPlace interfaces,
 * and the getMeetingPlaces function for retrieving meeting places for a given location.
 */

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
 * Asynchronously retrieves meeting places for a given location.
 *
 * @async
 * @function getMeetingPlaces
 * @param {Location} location - The location for which to retrieve meeting places.
 * @returns {Promise<MeetingPlace[]>} A promise that resolves to a list of meeting places.
 */
export async function getMeetingPlaces(location: Location): Promise<MeetingPlace[]> {
  // TODO: Implement this by calling an API.

  const allMeetingPlaces = [
    {
      name: 'Starbucks',
      location: { lat: 37.7749, lng: -122.4194 },
    },
    {
      name: 'Public Library',
      location: { lat: 37.7833, lng: -122.4167 },
    },
  ];

  // Filter meeting places based on distance to the provided location (placeholder logic)
  const filteredMeetingPlaces = allMeetingPlaces.filter(place => {
    const distance = calculateDistance(location, place.location);
    // Include places within a 1000 km radius for demonstration
    return distance < 1000;
  });

  return filteredMeetingPlaces;
}

/**
 * Retrieves the location of a user.
 *
 * @param userId - The ID of the user.
 * @returns A promise that resolves to the user's location.
 */
export async function getUserLocation(userId: string): Promise<Location | null> {
  // TODO: Implement this by calling an API or database.

  // Placeholder implementation: Return a fixed location for demonstration purposes.
  if (userId === 'user1') {
    return { lat: 37.7749, lng: -122.4194 }; // Example location 1: San Francisco
  } else if (userId === 'user2') {
    return { lat: 34.0522, lng: -118.2437 }; // Example location 2: Los Angeles
  }
  return null;
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
