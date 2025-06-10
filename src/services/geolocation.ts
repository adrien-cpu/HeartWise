/**
 * @fileOverview Provides services for retrieving geolocation data and meeting places.
 *
 * @module geolocation
 *
 * @description This module defines the Location and MeetingPlace interfaces,
 * and the getMeetingPlaces function for retrieving meeting places for a given location.
 * It also includes conceptual functions for fetching nearby users and compatibility.
 */

import type { UserProfile } from './user_profile';
import { get_user } from './user_profile';

export interface Location {
  lat: number;
  lng: number;
}

export interface MeetingPlace {
  id: string;
  name: string;
  description: string;
  location: Location;
  address: string;
  openingHours: string;
  capacity: number;
  rating: number;
  category: string;
}

export interface NearbyUser {
  id: string;
  name: string;
  profilePicture?: string;
  dataAiHint?: string;
  distance: number;
  location: Location;
  interests?: string[];
  availability?: {
    start: string;
    end: string;
  };
}

export const getUserLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
};

export const calculateDistance = (location1: Location, location2: Location): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(location2.lat - location1.lat);
  const dLon = toRad(location2.lng - location1.lng);
  const lat1 = toRad(location1.lat);
  const lat2 = toRad(location2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

export const getMeetingPlaces = async (userLocation: Location): Promise<MeetingPlace[]> => {
  // Simuler un délai réseau
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Générer des lieux aléatoires autour de la position de l'utilisateur
  const places: MeetingPlace[] = [];
  const categories = ['cafe', 'restaurant', 'bar', 'park'];
  const names = [
    'Le Petit Café',
    'La Belle Époque',
    'Le Jardin Secret',
    'Le Rendez-vous',
    'Le Point de Vue',
  ];

  for (let i = 0; i < 10; i++) {
    const lat = userLocation.lat + (Math.random() - 0.5) * 0.02;
    const lng = userLocation.lng + (Math.random() - 0.5) * 0.02;
    const category = categories[Math.floor(Math.random() * categories.length)];
    const name = names[Math.floor(Math.random() * names.length)];

    places.push({
      id: `place-${i}`,
      name,
      description: `Un ${category} accueillant pour vos rencontres`,
      location: { lat, lng },
      address: `${Math.floor(Math.random() * 100)} rue de la Paix`,
      openingHours: '9h-22h',
      capacity: Math.floor(Math.random() * 50) + 10,
      rating: Math.floor(Math.random() * 5) + 1,
      category,
    });
  }

  return places;
};

export const fetchNearbyUsersFromService = async (currentLocation: Location, radiusKm: number = 10): Promise<NearbyUser[]> => {
  console.log(`Simulating fetching nearby users within ${radiusKm}km of: ${currentLocation.lat}, ${currentLocation.lng}`);
  await new Promise(resolve => setTimeout(resolve, 1200));

  const allMockUsers: UserProfile[] = [
    { id: 'mockUserNearby1', name: 'Alex N.', email: 'alex@example.com', interests: ['Hiking', 'Coffee'], profilePicture: 'https://placehold.co/100x100.png?text=AN', dataAiHint: 'man nature', privacySettings: { showLocation: true } },
    { id: 'mockUserNearby2', name: 'Brenda K.', email: 'brenda@example.com', interests: ['Books', 'Art'], profilePicture: 'https://placehold.co/100x100.png?text=BK', dataAiHint: 'woman smiling', privacySettings: { showLocation: true } },
    { id: 'mockUserNearby3', name: 'Charlie M.', email: 'charlie@example.com', interests: ['Music', 'Tech'], profilePicture: 'https://placehold.co/100x100.png?text=CM', dataAiHint: 'person city', privacySettings: { showLocation: true } },
    { id: 'mockUserFar', name: 'David F.', email: 'david@example.com', interests: ['Movies'], profilePicture: 'https://placehold.co/100x100.png?text=DF', dataAiHint: 'man outdoor', privacySettings: { showLocation: true } },
  ];

  const mockUserLocations: { [id: string]: Location } = {
    'mockUserNearby1': { lat: currentLocation.lat + 0.01, lng: currentLocation.lng + 0.01 },
    'mockUserNearby2': { lat: currentLocation.lat - 0.02, lng: currentLocation.lng - 0.015 },
    'mockUserNearby3': { lat: currentLocation.lat + 0.005, lng: currentLocation.lng - 0.008 },
    'mockUserFar': { lat: currentLocation.lat + 0.1, lng: currentLocation.lng + 0.15 },
  };

  return allMockUsers
    .filter(user => user.privacySettings?.showLocation)
    .map(user => {
      const userMockLocation = mockUserLocations[user.id] || { lat: 0, lng: 0 };
      return {
        id: user.id,
        name: user.name || 'Unknown User',
        profilePicture: user.profilePicture,
        dataAiHint: user.dataAiHint,
        location: userMockLocation,
        distance: calculateDistance(currentLocation, userMockLocation),
        interests: user.interests,
        availability: {
          start: '09:00',
          end: '21:00',
        },
      };
    })
    .filter(user => user.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
};

export const getMeetingCompatibility = async (user1Id: string, user2Id: string): Promise<number> => {
  console.log(`Calculating meeting compatibility between ${user1Id} and ${user2Id}`);
  const user1Profile = await get_user(user1Id);
  const user2Profile = await get_user(user2Id);

  if (!user1Profile || !user2Profile) return 0;

  let score = 0;

  const loc1 = await getUserLocation();
  const loc2 = await getUserLocation();
  if (loc1 && loc2) {
    const distance = calculateDistance(loc1, loc2);
    if (distance < 1) score += 40;
    else if (distance < 5) score += 30;
    else if (distance < 10) score += 20;
    else if (distance < 20) score += 10;
  }

  const interests1 = user1Profile.interests || [];
  const interests2 = user2Profile.interests || [];
  const sharedInterests = interests1.filter(i => interests2.includes(i));
  score += Math.min(40, sharedInterests.length * 10);

  score += Math.random() * 20;

  return Math.min(100, Math.round(score));
};