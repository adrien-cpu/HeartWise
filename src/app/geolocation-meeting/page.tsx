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
import 'leaflet/dist/leaflet.css';

// Import Leaflet components dynamically to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
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
  const [userLocation, setUserLocation] = useState<Location | null>(null);
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

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const location = await getUserLocation();
        setUserLocation(location);
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
    const distance = calculateDistance(userLocation, place.location);
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">{t('title')}</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>{t('errorTitle')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('mapTitle')}</CardTitle>
              <CardDescription>{t('mapDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              {userLocation && (
                <MapContainer
                  center={[userLocation.lat, userLocation.lng]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  ref={mapRef}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {/* User location marker */}
                  <Marker position={[userLocation.lat, userLocation.lng]}>
                    <Popup>
                      {t('yourLocation')}
                    </Popup>
                  </Marker>
                  {/* Meeting places markers */}
                  {filteredPlaces.map((place, index) => (
                    <Marker key={`place-${index}`} position={[place.location.lat, place.location.lng]}>
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold">{place.name}</h3>
                          <p className="text-sm">{place.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{place.rating} / 5</span>
                          </div>
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => handlePlaceSelect(place)}
                          >
                            {t('viewDetails')}
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  {/* Nearby users markers */}
                  {nearbyUsers.map((user, index) => (
                    <Marker key={`user-${index}`} position={[user.location.lat, user.location.lng]}>
                      <Popup>
                        <div className="p-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.profilePicture} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-bold">{user.name}</h3>
                              <p className="text-sm text-muted-foreground">{user.distance.toFixed(1)} km</p>
                            </div>
                          </div>
                          {user.interests && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">{t('interests')}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {user.interests.map((interest, i) => (
                                  <Badge key={i} variant="secondary">{interest}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => handleUserSelect(user)}
                          >
                            {t('viewProfile')}
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                {t('filters')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t('maxDistance')}</label>
                <Slider
                  value={[filters.maxDistance]}
                  onValueChange={(value) => handleFilterChange('maxDistance', value[0])}
                  max={20}
                  step={1}
                  className="mt-2"
                />
                <span className="text-sm text-muted-foreground">{filters.maxDistance} km</span>
              </div>

              <div>
                <label className="text-sm font-medium">{t('category')}</label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allCategories')}</SelectItem>
                    <SelectItem value="cafe">{t('cafe')}</SelectItem>
                    <SelectItem value="restaurant">{t('restaurant')}</SelectItem>
                    <SelectItem value="bar">{t('bar')}</SelectItem>
                    <SelectItem value="park">{t('park')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {selectedPlace && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedPlace.name}</CardTitle>
                <CardDescription>{selectedPlace.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="info">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="info">{t('info')}</TabsTrigger>
                    <TabsTrigger value="booking">{t('booking')}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="info" className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{selectedPlace.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{selectedPlace.openingHours}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{selectedPlace.capacity} {t('people')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <span className="text-sm">{selectedPlace.rating} / 5</span>
                    </div>
                  </TabsContent>
                  <TabsContent value="booking">
                    <div className="space-y-4">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot.id}
                          variant={slot.available ? "outline" : "secondary"}
                          className="w-full justify-between"
                          disabled={!slot.available}
                          onClick={() => handleTimeSlotSelect(slot)}
                        >
                          <span>{slot.start} - {slot.end}</span>
                          <Badge variant={slot.available ? "default" : "secondary"}>
                            {slot.available ? t('available') : t('booked')}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {selectedUser && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedUser.profilePicture} />
                    <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedUser.name}</CardTitle>
                    <CardDescription>{selectedUser.distance.toFixed(1)} km</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedUser.interests && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('interests')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedUser.availability && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('availability')}</h4>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">
                        {selectedUser.availability.start} - {selectedUser.availability.end}
                      </span>
                    </div>
                  </div>
                )}
                <Button className="w-full" onClick={() => toast({ title: t('connectionRequestSent') })}>
                  {t('connect')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
