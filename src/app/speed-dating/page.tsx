
"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, CalendarClock, Users, Heart, Frown, Meh, Send } from 'lucide-react'; // Icons, Added feedback icons and Send
import { Badge } from "@/components/ui/badge";
import { get_user_speed_dating_schedule, set_user_speed_dating_schedule } from '@/services/user_profile'; // Assuming this service exists and handles schedule
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Added RadioGroup
import { Textarea } from "@/components/ui/textarea"; // Added Textarea
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Mock data structure for Speed Dating Session
interface SpeedDatingSession {
  id: string;
  dateTime: Date;
  interests: string[];
  participantsCount: number;
  status: 'scheduled' | 'completed' | 'in-progress'; // Added status
}

// Mock data for partners met during a session
interface MetPartner {
    id: string;
    name: string;
}

// Mock interests
const availableInterests = ["Movies", "Travel", "Food", "Tech", "Books", "Music", "Sports"];

/**
 * SpeedDatingPage component.
 *
 * @component
 * @description Displays the Speed Dating interface, allowing users to schedule sessions based on interests
 *              and providing a simulated feedback mechanism for completed sessions.
 *              **Requires Backend:** Real scheduling, matching, session management, and feedback storage.
 * @returns {JSX.Element} The rendered Speed Dating page.
 */
export default function SpeedDatingPage() {
  const t = useTranslations('SpeedDating');
  const { toast } = useToast();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<SpeedDatingSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionForFeedback, setSelectedSessionForFeedback] = useState<SpeedDatingSession | null>(null);
  const [feedback, setFeedback] = useState<{ [partnerId: string]: { rating: string; comment: string } }>({});

  // Mock user ID - replace with actual user identification
  const userId = 'user1';

  // Mock partners for the completed session
  const mockPartners: MetPartner[] = [
      { id: 'partner1', name: 'Charlie' },
      { id: 'partner2', name: 'Diana' },
      { id: 'partner3', name: 'Ethan' },
  ];

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
           { id: 'sd0', dateTime: new Date(Date.now() - 1 * 60 * 60 * 1000), interests: ["Sports", "Music"], participantsCount: 6, status: 'completed' }, // Completed session
          { id: 'sd1', dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000), interests: ["Movies", "Food"], participantsCount: 8, status: 'scheduled' },
          { id: 'sd2', dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), interests: ["Tech", "Books"], participantsCount: 12, status: 'scheduled' },
          { id: 'sd3', dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), interests: ["Travel", "Music"], participantsCount: 5, status: 'scheduled' },
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
  }, [t, toast]); // Added t and toast to dependency array

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

      // Add a mock scheduled session to the list for immediate UI update (remove if refetching)
       const newSession: SpeedDatingSession = {
         id: `sd-${Date.now()}`,
         dateTime: new Date(Date.now() + Math.random() * 5 * 24 * 60 * 60 * 1000), // Random future date
         interests: [...selectedInterests],
         participantsCount: Math.floor(Math.random() * 10) + 2, // Random participants
         status: 'scheduled',
       };
       setUpcomingSessions(prev => [...prev, newSession].sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()));


    } catch (err) {
      console.error("Failed to schedule session:", err);
      setError(t('scheduleError'));
      toast({ variant: 'destructive', title: t('errorTitle'), description: t('scheduleError') });
    } finally {
      setIsScheduling(false);
    }
  };

  // Handle opening the feedback form
  const handleProvideFeedback = (session: SpeedDatingSession) => {
    setSelectedSessionForFeedback(session);
    // Initialize feedback state for the selected session's partners
    const initialFeedback: { [partnerId: string]: { rating: string; comment: string } } = {};
    mockPartners.forEach(p => {
        initialFeedback[p.id] = { rating: '', comment: '' };
    });
    setFeedback(initialFeedback);
  };

  // Handle changes in the feedback form
  const handleFeedbackChange = (partnerId: string, type: 'rating' | 'comment', value: string) => {
    setFeedback(prev => ({
      ...prev,
      [partnerId]: {
        ...prev[partnerId],
        [type]: value,
      },
    }));
  };

  // Handle submitting feedback
  const handleSubmitFeedback = async () => {
      if (!selectedSessionForFeedback) return;
       // **Requires Backend:** API endpoint to submit feedback.
      console.log("Submitting feedback:", feedback);
      setIsScheduling(true); // Reuse scheduling loader state
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        toast({ title: t('feedbackSubmittedTitle'), description: t('feedbackSubmittedDesc') });
        setSelectedSessionForFeedback(null); // Close feedback form
        setFeedback({});
         // Optionally update the session status locally if needed, or refetch
         setUpcomingSessions(prev => prev.map(s => s.id === selectedSessionForFeedback.id ? { ...s, status: 'completed' } : s));
      } catch (error) {
         console.error("Failed to submit feedback:", error);
         toast({ variant: 'destructive', title: t('errorTitle'), description: t('feedbackErrorDesc') });
      } finally {
        setIsScheduling(false);
      }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">{t('title')}</h1>

      {selectedSessionForFeedback ? (
          // Feedback Form View
          <Card>
              <CardHeader>
                <CardTitle>{t('feedbackTitle', { date: selectedSessionForFeedback.dateTime.toLocaleDateString() })}</CardTitle>
                <CardDescription>{t('feedbackDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 {mockPartners.map(partner => (
                    <div key={partner.id} className="border p-4 rounded-md space-y-3">
                        <h3 className="font-semibold">{t('feedbackFor', { name: partner.name })}</h3>
                        <div>
                             <Label className="mb-2 block text-sm">{t('ratingLabel')}</Label>
                             <RadioGroup
                                value={feedback[partner.id]?.rating || ''}
                                onValueChange={(value) => handleFeedbackChange(partner.id, 'rating', value)}
                                className="flex space-x-4"
                             >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="positive" id={`${partner.id}-positive`} />
                                  <Label htmlFor={`${partner.id}-positive`}><Heart className="h-5 w-5 text-green-500"/></Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="neutral" id={`${partner.id}-neutral`} />
                                  <Label htmlFor={`${partner.id}-neutral`}><Meh className="h-5 w-5 text-yellow-500"/></Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="negative" id={`${partner.id}-negative`} />
                                  <Label htmlFor={`${partner.id}-negative`}><Frown className="h-5 w-5 text-red-500"/></Label>
                                </div>
                              </RadioGroup>
                        </div>
                        <div>
                           <Label htmlFor={`${partner.id}-comment`} className="mb-2 block text-sm">{t('commentLabel')}</Label>
                            <Textarea
                                id={`${partner.id}-comment`}
                                placeholder={t('commentPlaceholder')}
                                value={feedback[partner.id]?.comment || ''}
                                onChange={(e) => handleFeedbackChange(partner.id, 'comment', e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>
                 ))}
              </CardContent>
              <CardFooter className="flex justify-between">
                 <Button variant="outline" onClick={() => setSelectedSessionForFeedback(null)} disabled={isScheduling}>
                     {t('cancelButton')}
                 </Button>
                 <Button onClick={handleSubmitFeedback} disabled={isScheduling}>
                    {isScheduling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Send className="mr-2 h-4 w-4"/>
                    {t('submitFeedbackButton')}
                 </Button>
              </CardFooter>
          </Card>
      ) : (
        // Default View: Scheduling and Upcoming Sessions
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
                        aria-labelledby={`label-interest-${interest}`}
                      />
                      <Label
                        id={`label-interest-${interest}`}
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
                      <div className="flex flex-wrap gap-1 my-2">
                        {session.interests.map(interest => (
                          <Badge key={interest} variant="outline" className="text-xs">{interest}</Badge>
                        ))}
                      </div>
                       {session.status === 'completed' && (
                           <Button size="sm" variant="outline" onClick={() => handleProvideFeedback(session)}>
                                {t('provideFeedbackButton')}
                           </Button>
                       )}
                       {session.status === 'in-progress' && (
                           <Badge variant="default">{t('sessionInProgress')}</Badge>
                       )}
                       {session.status === 'scheduled' && (
                            <Badge variant="outline">{t('sessionScheduled')}</Badge>
                       )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{t('noSessions')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
