"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, CalendarClock, Users } from 'lucide-react'; // Icons
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { get_user_speed_dating_schedule, set_user_speed_dating_schedule } from '@/services/user_profile'; // Assuming this service exists and handles schedule

// Mock data structure for Speed Dating Session
interface SpeedDatingSession {
  id: string;
  dateTime: Date;
  interests: string[];
  participantsCount: number;
}

// Mock interests
const availableInterests = ["Movies", "Travel", "Food", "Tech", "Books", "Music", "Sports"];

export default function SpeedDatingPage() {
  const t = useTranslations('SpeedDating');
  const { toast } = useToast();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<SpeedDatingSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock user ID - replace with actual user identification
  const userId = 'user1';

  // Fetch upcoming sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      setLoadingSessions(true);
      setError(null);
      try {
        // Simulate API call to fetch upcoming sessions
        // Replace with actual API call: const sessions = await fetchUpcomingSpeedDatingSessions();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        const mockSessions: SpeedDatingSession[] = [
          { id: 'sd1', dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000), interests: ["Movies", "Food"], participantsCount: 8 },
          { id: 'sd2', dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), interests: ["Tech", "Books"], participantsCount: 12 },
          { id: 'sd3', dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), interests: ["Travel", "Music"], participantsCount: 5 },
        ];
        setUpcomingSessions(mockSessions);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
        setError(t('fetchError'));
        toast({ variant: 'destructive', title: t('errorTitle'), description: t('fetchError') });
      } finally {
        setLoadingSessions(false);
      }
    };
    fetchSessions();
  }, [t, toast]);

  // Handle interest selection
  const handleInterestChange = (interest: string, checked: boolean) => {
    setSelectedInterests(prev =>
      checked ? [...prev, interest] : prev.filter(i => i !== interest)
    );
  };

  // Handle scheduling a session
  const handleScheduleSession = async () => {
    if (selectedInterests.length === 0) {
      toast({ variant: 'destructive', title: t('selectInterestsErrorTitle'), description: t('selectInterestsErrorDesc') });
      return;
    }

    setIsScheduling(true);
    setError(null);
    try {
      // Simulate API call to schedule a session
      // Replace with actual API call: await scheduleSpeedDating(userId, selectedInterests);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

      // In a real app, you might update the user's schedule via a service:
      // await set_user_speed_dating_schedule(userId, selectedInterests); // Adapt service if needed

      toast({ title: t('scheduleSuccessTitle'), description: t('scheduleSuccess') });
      setSelectedInterests([]); // Reset selection after scheduling

      // Optionally, refetch sessions to show the newly scheduled one (if backend adds it immediately)
      // fetchSessions();

    } catch (err) {
      console.error("Failed to schedule session:", err);
      setError(t('scheduleError'));
      toast({ variant: 'destructive', title: t('errorTitle'), description: t('scheduleError') });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">{t('title')}</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Scheduling Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('scheduleTitle')}</CardTitle>
            <CardDescription>{t('scheduleDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="font-semibold mb-2 block">{t('selectInterests')}</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableInterests.map(interest => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={`interest-${interest}`}
                      checked={selectedInterests.includes(interest)}
                      onCheckedChange={(checked) => handleInterestChange(interest, !!checked)}
                      disabled={isScheduling}
                    />
                    <Label
                      htmlFor={`interest-${interest}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleScheduleSession} disabled={isScheduling || selectedInterests.length === 0}>
              {isScheduling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('scheduleButton')}
            </Button>
          </CardFooter>
          {error && <p className="px-6 pb-4 text-sm text-destructive">{error}</p>}
        </Card>

        {/* Upcoming Sessions Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('upcomingSessions')}</CardTitle>
            <CardDescription>{t('upcomingSessionsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSessions ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                     <Skeleton className="h-5 w-3/4" />
                     <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : upcomingSessions.length > 0 ? (
              <ul className="space-y-4">
                {upcomingSessions.map((session) => (
                  <li key={session.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                       <span className="font-medium flex items-center">
                         <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground"/>
                         {session.dateTime.toLocaleString()}
                       </span>
                       <Badge variant="secondary" className="flex items-center">
                         <Users className="mr-1 h-3 w-3"/> {session.participantsCount}
                       </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {session.interests.map(interest => (
                        <Badge key={interest} variant="outline" className="text-xs">{interest}</Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t('noSessions')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
