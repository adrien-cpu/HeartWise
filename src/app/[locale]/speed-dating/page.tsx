"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, CalendarClock, Users, Heart, Frown, Meh, Send, CheckCircle2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { useRouter } from 'next/navigation'; // Import useRouter
import { submitSpeedDatingFeedback, SpeedDatingFeedbackData, getFeedbackForSessionByUser } from '@/services/speed_dating_service'; // Import the service
import { Timestamp } from 'firebase/firestore';

// Mock data structure for Speed Dating Session (kept for frontend display logic)
interface SpeedDatingSession {
  id: string;
  dateTime: Date; // Use Date for client-side display, convert to Timestamp for Firestore if needed by a session creation service
  interests: string[];
  participantsCount: number;
  status: 'scheduled' | 'completed' | 'in-progress';
  feedbackSubmitted?: boolean;
}

// Mock data for partners met during a session (kept for frontend display logic)
interface MetPartner {
    id: string;
    name: string;
}

// Mock interests (kept for frontend display logic)
const availableInterests = ["Movies", "Travel", "Food", "Tech", "Books", "Music", "Sports"];

/**
 * @fileOverview Implements the SpeedDatingPage component.
 * @module SpeedDatingPage
 * @description Displays the Speed Dating interface, allowing users to schedule sessions based on interests
 *              and providing a feedback mechanism for completed sessions, with feedback persisted to Firestore.
 *              User authentication is required for submitting feedback.
 */
export default function SpeedDatingPage() {
  const t = useTranslations('SpeedDating');
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<SpeedDatingSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionForFeedback, setSelectedSessionForFeedback] = useState<SpeedDatingSession | null>(null);
  
  // Type for feedback state, mapping partnerId to their feedback
  const [feedback, setFeedback] = useState<{ [partnerId: string]: { rating: 'positive' | 'neutral' | 'negative' | ''; comment: string } }>({});


  // Mock partners for the completed session (this would come from the session data in a real app)
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
        // In a real app, this would call a service like `getSpeedDatingSessionsForUser(currentUser.uid)`
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        const mockSessions: SpeedDatingSession[] = [
           { id: 'sd0', dateTime: new Date(Date.now() - 1 * 60 * 60 * 1000), interests: ["Sports", "Music"], participantsCount: 6, status: 'completed', feedbackSubmitted: false },
           { id: 'sd1', dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000), interests: ["Movies", "Food"], participantsCount: 8, status: 'scheduled' },
           { id: 'sd2', dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), interests: ["Tech", "Books"], participantsCount: 12, status: 'scheduled' },
           { id: 'sd3', dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), interests: ["Travel", "Music"], participantsCount: 5, status: 'scheduled' },
        ];
        
        // Check if feedback was already submitted for completed sessions
        if (currentUser) {
            for (const session of mockSessions) {
                if (session.status === 'completed') {
                    const existingFeedback = await getFeedbackForSessionByUser(currentUser.uid, session.id);
                    // A simple check: if any feedback exists for this session by this user, mark as submitted.
                    // A more granular check might involve checking per partner if the UI supports partial feedback.
                    if (existingFeedback.length > 0) {
                        session.feedbackSubmitted = true;
                    }
                }
            }
        }

        setUpcomingSessions(mockSessions.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()));
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
        setError(t('fetchError'));
        toast({ variant: 'destructive', title: t('errorTitle'), description: t('fetchError') });
      } finally {
        setLoadingSessions(false);
      }
    };
    // Only fetch sessions if auth state is determined (not loading)
    // If user is not logged in, they can see sessions but not interact with feedback
    if (!authLoading) {
        fetchSessions();
    }
  }, [t, toast, currentUser, authLoading]);

  // Handle interest selection
  const handleInterestChange = (interest: string, checked: boolean) => {
    setSelectedInterests(prev =>
      checked ? [...prev, interest] : prev.filter(i => i !== interest)
    );
  };

  // Handle scheduling a session (remains simulated as per current scope)
  const handleScheduleSession = async () => {
    if (!currentUser) {
      toast({ variant: 'destructive', title: t('authErrorTitle'), description: t('authErrorDesc') });
      router.push('/login');
      return;
    }
    if (selectedInterests.length === 0) {
      toast({ variant: 'destructive', title: t('selectInterestsErrorTitle'), description: t('selectInterestsErrorDesc') });
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      // Simulate scheduling logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({ title: t('scheduleSuccessTitle'), description: t('scheduleSuccess') });
      
       const newSession: SpeedDatingSession = {
         id: `sd-${Date.now()}`,
         dateTime: new Date(Date.now() + (Math.random() * 5 + 1) * 24 * 60 * 60 * 1000),
         interests: [...selectedInterests],
         participantsCount: Math.floor(Math.random() * 10) + 2,
         status: 'scheduled',
         feedbackSubmitted: false,
       };
       setUpcomingSessions(prev => [...prev, newSession].sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()));
       setSelectedInterests([]);
    } catch (err) {
      console.error("Failed to schedule session:", err);
      setError(t('scheduleError'));
      toast({ variant: 'destructive', title: t('errorTitle'), description: t('scheduleError') });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle opening the feedback form
  const handleProvideFeedback = (session: SpeedDatingSession) => {
     if (!currentUser) {
      toast({ variant: 'destructive', title: t('authErrorTitle'), description: t('authErrorDesc') });
      router.push('/login');
      return;
    }
    if (session.feedbackSubmitted) {
        toast({title: t('feedbackAlreadySubmittedTitle'), description: t('feedbackAlreadySubmittedDesc')});
        return;
    }
    setSelectedSessionForFeedback(session);
    const initialFeedback: { [partnerId: string]: { rating: 'positive' | 'neutral' | 'negative' | ''; comment: string } } = {};
    mockPartners.forEach(p => { // Using mockPartners for UI structure
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
        [type]: type === 'rating' ? (value as 'positive' | 'neutral' | 'negative' | '') : value,
      },
    }));
  };

  // Handle submitting feedback
  const handleSubmitFeedback = async () => {
      if (!selectedSessionForFeedback || !currentUser) {
          toast({ variant: 'destructive', title: t('errorTitle'), description: !currentUser ? t('authErrorDesc') : t('sessionNotSelectedError') });
          if (!currentUser) router.push('/login');
          return;
      }

      setIsProcessing(true);
      try {
        // Iterate over each partner for whom feedback was provided
        const feedbackPromises = Object.entries(feedback).map(([partnerId, feedbackEntry]) => {
            if (feedbackEntry.rating) { // Only submit if a rating was given
                const partnerName = mockPartners.find(p => p.id === partnerId)?.name || 'Unknown Partner';
                const feedbackPayload: Omit<SpeedDatingFeedbackData, 'id' | 'timestamp'> = {
                    userId: currentUser.uid,
                    sessionId: selectedSessionForFeedback.id,
                    partnerId: partnerId,
                    partnerName: partnerName,
                    rating: feedbackEntry.rating,
                    comment: feedbackEntry.comment,
                };
                return submitSpeedDatingFeedback(feedbackPayload);
            }
            return Promise.resolve(null); // No feedback for this partner
        });

        await Promise.all(feedbackPromises);

        toast({ title: t('feedbackSubmittedTitle'), description: t('feedbackSubmittedDesc') });
        
         setUpcomingSessions(prevSessions =>
           prevSessions.map(s =>
             s.id === selectedSessionForFeedback.id ? { ...s, feedbackSubmitted: true } : s
           )
         );
        setSelectedSessionForFeedback(null);
        setFeedback({});
      } catch (error) {
         console.error("Failed to submit feedback:", error);
         toast({ variant: 'destructive', title: t('errorTitle'), description: t('feedbackErrorDesc') });
      } finally {
        setIsProcessing(false);
      }
  };

  if (authLoading) {
      return (
        <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[calc(100vh-150px)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
  }


  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">{t('title')}</h1>

      {selectedSessionForFeedback ? (
          <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>{t('feedbackTitle', { date: selectedSessionForFeedback.dateTime.toLocaleDateString() })}</CardTitle>
                <CardDescription>{t('feedbackDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 {mockPartners.map(partner => (
                    <div key={partner.id} className="border p-4 rounded-md space-y-3 bg-muted/50">
                        <h3 className="font-semibold">{t('feedbackFor', { name: partner.name })}</h3>
                        <div>
                             <Label className="mb-2 block text-sm font-medium">{t('ratingLabel')}</Label>
                             <RadioGroup
                                value={feedback[partner.id]?.rating || ''}
                                onValueChange={(value) => handleFeedbackChange(partner.id, 'rating', value)}
                                className="flex space-x-4"
                                aria-label={t('ratingLabelFor', { name: partner.name})}
                             >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="positive" id={`${partner.id}-positive`} />
                                  <Label htmlFor={`${partner.id}-positive`} className="cursor-pointer"><Heart className="h-5 w-5 text-green-500"/></Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="neutral" id={`${partner.id}-neutral`} />
                                  <Label htmlFor={`${partner.id}-neutral`} className="cursor-pointer"><Meh className="h-5 w-5 text-yellow-500"/></Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="negative" id={`${partner.id}-negative`} />
                                  <Label htmlFor={`${partner.id}-negative`} className="cursor-pointer"><Frown className="h-5 w-5 text-red-500"/></Label>
                                </div>
                              </RadioGroup>
                        </div>
                        <div>
                           <Label htmlFor={`${partner.id}-comment`} className="mb-2 block text-sm font-medium">{t('commentLabel')}</Label>
                            <Textarea
                                id={`${partner.id}-comment`}
                                placeholder={t('commentPlaceholder')}
                                value={feedback[partner.id]?.comment || ''}
                                onChange={(e) => handleFeedbackChange(partner.id, 'comment', e.target.value)}
                                rows={2}
                                aria-label={t('commentLabelFor', { name: partner.name})}
                            />
                        </div>
                    </div>
                 ))}
              </CardContent>
              <CardFooter className="flex justify-between">
                 <Button variant="outline" onClick={() => setSelectedSessionForFeedback(null)} disabled={isProcessing}>
                     {t('cancelButton')}
                 </Button>
                 <Button onClick={handleSubmitFeedback} disabled={isProcessing}>
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Send className="mr-2 h-4 w-4"/>
                    {t('submitFeedbackButton')}
                 </Button>
              </CardFooter>
          </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-lg border">
            <CardHeader>
              <CardTitle>{t('scheduleTitle')}</CardTitle>
              <CardDescription>{t('scheduleDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-semibold mb-3 block">{t('selectInterests')}</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableInterests.map(interest => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={`interest-${interest}`}
                        checked={selectedInterests.includes(interest)}
                        onCheckedChange={(checked) => handleInterestChange(interest, !!checked)}
                        disabled={isProcessing}
                        aria-labelledby={`label-interest-${interest}`}
                      />
                      <Label
                        id={`label-interest-${interest}`}
                        htmlFor={`interest-${interest}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleScheduleSession} disabled={isProcessing || selectedInterests.length === 0 || !currentUser} className="w-full sm:w-auto">
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('scheduleButton')}
              </Button>
            </CardFooter>
            {error && <p className="px-6 pb-4 text-sm text-destructive">{error}</p>}
             {!currentUser && !authLoading && (
                <p className="px-6 pb-4 text-sm text-muted-foreground">{t('loginToSchedule')}</p>
            )}
          </Card>

          <Card className="shadow-lg border">
            <CardHeader>
              <CardTitle>{t('upcomingSessions')}</CardTitle>
              <CardDescription>{t('upcomingSessionsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSessions ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2 p-3 border rounded-md bg-muted/30">
                       <Skeleton className="h-5 w-3/4" />
                       <Skeleton className="h-4 w-1/2" />
                       <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : upcomingSessions.length > 0 ? (
                <ul className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <li key={session.id} className="p-3 border rounded-md bg-card hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-1">
                         <span className="font-medium flex items-center text-sm">
                           <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground"/>
                           {session.dateTime.toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'})}
                         </span>
                         <Badge variant="secondary" className="flex items-center text-xs">
                           <Users className="mr-1 h-3 w-3"/> {session.participantsCount} {t('participants')}
                         </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 my-2">
                        {session.interests.map(interest => (
                          <Badge key={interest} variant="outline" className="text-xs">{interest}</Badge>
                        ))}
                      </div>
                       {session.status === 'completed' && (
                           session.feedbackSubmitted ? (
                             <div className="flex items-center text-sm text-green-600">
                               <CheckCircle2 className="mr-1 h-4 w-4" />
                               {t('feedbackSubmittedShort')}
                             </div>
                           ) : (
                             <Button size="sm" variant="outline" onClick={() => handleProvideFeedback(session)} disabled={isProcessing || !currentUser}>
                               {t('provideFeedbackButton')}
                             </Button>
                           )
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
                <p className="text-center text-muted-foreground py-4">{t('noSessions')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

