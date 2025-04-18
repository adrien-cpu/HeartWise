"use client";

import {useEffect, useState} from 'react';
import {Location, MeetingPlace, getMeetingPlaces} from '@/services/geolocation';

export default function GeolocationMeeting() {
  const [location, setLocation] = useState<Location | null>(null);
  const [meetingPlaces, setMeetingPlaces] = useState<MeetingPlace[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setError(error.message);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

  useEffect(() => {
    async function fetchMeetingPlaces() {
      if (location) {
        try {
          const places = await getMeetingPlaces(location);
          setMeetingPlaces(places);
        } catch (e: any) {
          setError(e.message);
        }
      }
    }

    fetchMeetingPlaces();
  }, [location]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Geolocation Meeting</h1>
      {error && <div className="text-red-500 mb-4">Error: {error}</div>}
      {location ? (
        <>
          <p className="mb-4">
            Your location: Latitude {location.lat}, Longitude {location.lng}
          </p>
          <h2 className="text-xl font-semibold mb-2">Meeting Places:</h2>
          <ul>
            {meetingPlaces.map((place) => (
              <li key={place.name} className="mb-2">
                {place.name} - Latitude {place.location.lat}, Longitude{' '}
                {place.location.lng}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Loading location...</p>
      )}
    </div>
  );
}
