"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getUserLocation, getMeetingPlaces, Location, MeetingPlace, calculateDistance, fetchNearbyUsersFromService, NearbyUser } from '@/services/geolocation';
import { Loader2, MapPin, Filter, Calendar, Clock, Users, Star, User } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// Chargement dynamique des composants Leaflet
const MapWithNoSSR = dynamic(
  () => import('@/components/geolocation/Map'),
  {
    ssr: false,
    loading: () => <div>Chargement de la carte...</div>
  }
);

// Import dynamique des composants Marker et Popup
const DynamicMarker = dynamic(
  () => import('@/components/geolocation/Map').then(mod => mod.Marker),
  { ssr: false }
);

const DynamicPopup = dynamic(
  () => import('@/components/geolocation/Map').then(mod => mod.Popup),
  { ssr: false }
);

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  available: boolean;
  bookedBy?: string;
}

export default function GeolocationMeeting() {
  const t = useTranslations('GeolocationMeeting');
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [meetingPlaces, setMeetingPlaces] = useState<MeetingPlace[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<MeetingPlace | null>(null);
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [filters, setFilters] = useState({
    maxDistance: 5,
    minRating: 0,
    category: 'all',
  });
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [meetingPlace, setMeetingPlace] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const location = await getUserLocation();
        setUserLocation({ lat: location.lat, lng: location.lng });
        setError(null);
        setLoadingLocation(false);

        // Fetch meeting places and nearby users once location is available
        setLoadingPlaces(true);
        setLoadingUsers(true);
        try {
          const places = await getMeetingPlaces(location);
          setMeetingPlaces(places);

          const users = await fetchNearbyUsersFromService(location, filters.maxDistance);
          setNearbyUsers(users);
        } catch (fetchError: any) {
          setError(t('fetchError'));
          toast({ variant: "destructive", title: t('fetchError'), description: fetchError.message });
        } finally {
          setLoadingPlaces(false);
          setLoadingUsers(false);
        }
      } catch (error: any) {
        setError(t('geolocationError', { message: error.message }));
        setLoadingLocation(false);
        toast({
          variant: "destructive",
          title: t('geolocationErrorTitle'),
          description: t('geolocationError', { message: error.message }),
        });
      }
    };

    initializeLocation();
  }, [t, toast, filters.maxDistance]);

  const handleFilterChange = (key: string, value: number | string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredPlaces = meetingPlaces.filter(place => {
    if (!userLocation) return false;
    const distance = calculateDistance(
      userLocation,
      { lat: place.location.lat, lng: place.location.lng }
    );
    return distance <= filters.maxDistance;
  });

  const handlePlaceSelect = async (place: MeetingPlace) => {
    setSelectedPlace(place);
    setSelectedUser(null);
    // Simulate fetching time slots
    const slots = generateTimeSlots();
    setTimeSlots(slots);
  };

  const handleUserSelect = (user: NearbyUser) => {
    setSelectedUser(user);
    setSelectedPlace(null);
  };

  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 21;

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push({
        id: `${hour}:00`,
        start: `${hour}:00`,
        end: `${hour + 1}:00`,
        available: Math.random() > 0.3, // Simulate availability
      });
    }

    return slots;
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) {
      toast({
        title: t('slotUnavailable'),
        description: t('slotUnavailableDescription'),
        variant: "destructive",
      });
      return;
    }

    // Simulate booking
    setTimeSlots(prev =>
      prev.map(s =>
        s.id === slot.id
          ? { ...s, available: false, bookedBy: 'currentUser' }
          : s
      )
    );

    toast({
      title: t('bookingSuccess'),
      description: t('bookingSuccessDescription', { time: slot.start }),
    });
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const location = await getUserLocation();
      setUserLocation({ lat: location.lat, lng: location.lng });
      setMeetingPlace([location.lat, location.lng]);
      setMapCenter([location.lat, location.lng]);
      setError(null);
    } catch (error: any) {
      setError(t('geolocationError', { message: error.message }));
      toast({
        variant: "destructive",
        title: t('geolocationErrorTitle'),
        description: t('geolocationError', { message: error.message }),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetLocation = async () => {
    setIsLoading(true);
    try {
      const location = await getUserLocation();
      setUserLocation({ lat: location.lat, lng: location.lng });
      setMeetingPlace([location.lat, location.lng]);
      setMapCenter([location.lat, location.lng]);
      setError(null);
    } catch (error: any) {
      setError(t('geolocationError', { message: error.message }));
      toast({
        variant: "destructive",
        title: t('geolocationErrorTitle'),
        description: t('geolocationError', { message: error.message }),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareLocation = async () => {
    if (!userLocation || !user) return;

    try {
      // Implémentation du partage de position
      toast({
        title: "Position partagée",
        description: "Votre position a été partagée avec succès",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Trouver un lieu de rencontre</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="search">Rechercher un lieu</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Entrez une adresse..."
                  />
                  <Button onClick={handleSearch}>Rechercher</Button>
                </div>
              </div>

              <div>
                <Label>Votre position actuelle</Label>
                <div className="text-sm text-gray-500">
                  {userLocation ? (
                    `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`
                  ) : (
                    'Position non disponible'
                  )}
                </div>
              </div>

              <div>
                <Label>Lieu de rencontre</Label>
                <div className="text-sm text-gray-500">
                  {meetingPlace ? (
                    `${meetingPlace[0].toFixed(6)}, ${meetingPlace[1].toFixed(6)}`
                  ) : (
                    'Aucun lieu sélectionné'
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleGetLocation}
                  disabled={isLoading}
                >
                  {isLoading ? 'Chargement...' : 'Obtenir ma position'}
                </Button>
                <Button
                  onClick={handleShareLocation}
                  disabled={!userLocation || !user}
                  variant="outline"
                >
                  Partager ma position
                </Button>
              </div>
            </div>
          </div>

          <div className="h-[400px] relative">
            <MapWithNoSSR
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              {userLocation && (
                <DynamicMarker position={userLocation}>
                  <DynamicPopup>
                    Votre position
                  </DynamicPopup>
                </DynamicMarker>
              )}
              {meetingPlace && (
                <DynamicMarker position={meetingPlace}>
                  <DynamicPopup>
                    Lieu de rencontre
                  </DynamicPopup>
                </DynamicMarker>
              )}
            </MapWithNoSSR>
          </div>
        </div>
      </Card>
    </div>
  );
}
