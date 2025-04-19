;"use client";

import {useEffect, useState} from 'react';
import {Location, MeetingPlace, getMeetingPlaces} from '@/services/geolocation';
import {useTranslations} from 'next-intl';

/**
 * @fileOverview Geolocation Meeting page component.
 *
 * @module GeolocationMeeting
 *
 * @description This component retrieves the user's location and displays a list of
 * meeting places nearby. It uses the `getMeetingPlaces` function from the geolocation
 * service.
 */

/**
 * GeolocationMeeting component.
 *
 * @component
 * @description A client component that retrieves the user's location and displays nearby meeting places.
 * @returns {JSX.Element} The rendered Geolocation Meeting page.
 */
export default function GeolocationMeeting() {
  const [location, setLocation] = useState<Location | null>(null);
  const [meetingPlaces, setMeetingPlaces] = useState<MeetingPlace[]>([]);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('GeolocationMeeting');

  /**
   * Retrieves the user's current location on mount.
   * @function
   * @returns {void}
   */
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
      setError(t('geolocationNotSupported'));
    }
  }, [t]);

  /**
   * Fetches meeting places when the location is available.
   * @async
   * @function
   * @returns {Promise<void>}
   */
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
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      {error && <div className="text-red-500 mb-4">Error: {error}</div>}
      {location ? (
        <>
          <p className="mb-4">
            {t('yourLocation')}: {t('latitude')} {location.lat}, {t('longitude')} {location.lng}
          </p>
          <h2 className="text-xl font-semibold mb-2">{t('meetingPlacesTitle')}:</h2>
          <ul>
            {meetingPlaces.map((place) => (
              <li key={place.name} className="mb-2">
                {place.name} - {t('latitude')} {place.location.lat}, {t('longitude')}{' '}
                {place.location.lng}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>{t('loadingLocation')}</p>
      )}
    </div>
  );
}
