"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getUserLocation, getMeetingPlaces, Location, MeetingPlace, calculateDistance } from '@/services/geolocation'; // Using TypeScript service
import { Loader2, MapPin } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';

// Mock nearby users structure
interface NearbyUser {
  id: string;
  name: string;
  distance: number; // in km
  location: Location;
}

export default function GeolocationMeeting() {
  const t = useTranslations('GeolocationMeeting');
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [meetingPlaces, setMeetingPlaces] = useState<MeetingPlace[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const currentLocation: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(currentLocation);
          setError(null);
          setLoadingLocation(false);

          // Fetch meeting places and nearby users once location is available
          setLoadingPlaces(true);
          setLoadingUsers(true);
          try {
            const places = await getMeetingPlaces(currentLocation);
            setMeetingPlaces(places);

            // Simulate fetching nearby users (replace with actual API call if available)
            const fetchedUsers = await fetchNearbyUsers(currentLocation);
            setNearbyUsers(fetchedUsers);

          } catch (fetchError: any) {
            setError(t('fetchError'));
            toast({ variant: "destructive", title: t('fetchError'), description: fetchError.message });
          } finally {
            setLoadingPlaces(false);
            setLoadingUsers(false);
          }
        },
        (geoError) => {
          setError(t('geolocationError', { message: geoError.message }));
          setLoadingLocation(false);
          toast({
            variant: "destructive",
            title: t('geolocationErrorTitle'),
            description: t('geolocationError', { message: geoError.message }),
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Options for geolocation
      );
    } else {
      setError(t('geolocationNotSupported'));
      setLoadingLocation(false);
      toast({ variant: "destructive", title: t('geolocationNotSupported') });
    }
  }, [t, toast]); // Added t and toast to dependency array

  // Mock function to simulate fetching nearby users
  const fetchNearbyUsers = async (currentLocation: Location): Promise<NearbyUser[]> => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    // In a real app, this would fetch from your backend
    const mockUsersData: { id: string; name: string; location: Location }[] = [
      { id: 'userA', name: 'Alex', location: { lat: currentLocation.lat + 0.01, lng: currentLocation.lng + 0.01 } },
      { id: 'userB', name: 'Brenda', location: { lat: currentLocation.lat - 0.02, lng: currentLocation.lng - 0.015 } },
      { id: 'userC', name: 'Chris', location: { lat: currentLocation.lat + 0.005, lng: currentLocation.lng - 0.008 } },
      { id: 'userD', name: 'Diana', location: { lat: currentLocation.lat + 0.1, lng: currentLocation.lng + 0.15 } }, // Further away
    ];

    return mockUsersData.map(user => ({
      ...user,
      distance: calculateDistance(currentLocation, user.location),
    })).sort((a, b) => a.distance - b.distance); // Sort by distance
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">{t('title')}</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>{t('errorTitle')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('yourLocation')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingLocation ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{t('loadingLocation')}</span>
            </div>
          ) : userLocation ? (
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>{t('latitude')}: {userLocation.lat.toFixed(4)}, {t('longitude')}: {userLocation.lng.toFixed(4)}</span>
            </div>
          ) : (
            <span>{t('locationUnavailable')}</span>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('meetingPlacesTitle')}</CardTitle>
            <CardDescription>{t('meetingPlacesDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPlaces ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            ) : meetingPlaces.length > 0 ? (
              <ul className="space-y-2">
                {meetingPlaces.map((place, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{place.name} ({calculateDistance(userLocation!, place.location).toFixed(1)} km)</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t('noMeetingPlaces')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('nearbyUsersTitle')}</CardTitle>
             <CardDescription>{t('nearbyUsersDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-2/3" />
              </div>
             ) : nearbyUsers.length > 0 ? (
              <ul className="space-y-2">
                {nearbyUsers.map((user) => (
                  <li key={user.id} className="flex justify-between items-center">
                    <span>{user.name}</span>
                    <span className="text-sm text-muted-foreground">{user.distance.toFixed(1)} km</span>
                    {/* Add a button to initiate contact/meeting */}
                     <Button size="sm" variant="outline" onClick={() => toast({ title: `Connecting with ${user.name}...` })}>{t('connectButton')}</Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t('noNearbyUsers')}</p>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
