"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  submitSpeedDatingFeedback,
  getFeedbackForSessionByUser,
  createSpeedDatingSession,
  registerForSpeedDatingSession,
  findAvailableSessions,
  getUpcomingSessionsForUser,
  SpeedDatingSession, // Service-defined type
  SpeedDatingFeedbackData
} from '@/services/speed_dating_service';
import { Timestamp } from 'firebase/firestore';

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
 *              User authentication is required.
 */
export default function SpeedDatingPage() {
  const t = useTranslations('SpeedDating');
  const { toast } = useToast();
  const { user: currentUser, loading: authLoading } = useAuthContext();
  const router = useRouter();

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<SpeedDatingSession[]>([]);
  const [availableFilteredSessions, setAvailableFilteredSessions] = useState<SpeedDatingSession[]>([]);

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionForFeedback, setSelectedSessionForFeedback] = useState<SpeedDatingSession | null>(null);

  const [feedback, setFeedback] = useState<{ [partnerId: string]: { rating: 'positive' | 'neutral' | 'negative' | ''; comment: string } }>({});

  // Mock user ID - replace with actual user identification
  const userId = 'user1';

  // Mock partners - in a real app, this would be dynamically fetched based on the selectedSessionForFeedback
  const mockPartners: MetPartner[] = selectedSessionForFeedback?.id === 'sd-completed-mock' ? [
    { id: 'partnerA_from_sd0', name: 'Alex' },
    { id: 'partnerB_from_sd0', name: 'Bella' },
  ] : [];

  const fetchUserSessions = useCallback(async () => {
    if (!currentUser) return;
    setLoadingSessions(true);
    try {
      const sessions = await getUpcomingSessionsForUser(currentUser.uid);

      // Check feedback status for completed sessions
      for (const session of sessions) {
        if (session.status === 'completed' && !session.feedbackSubmitted) {
          const existingFeedback = await getFeedbackForSessionByUser(currentUser.uid, session.id);
          if (existingFeedback.length > 0) { // Simple check: if any feedback exists
            session.feedbackSubmitted = true;
          }
        }
      }
      setUpcomingSessions(sessions.sort((a, b) => (a.dateTime as Timestamp).toDate().getTime() - (b.dateTime as Timestamp).toDate().getTime()));
    } catch (err) {
      console.error("Failed to fetch user sessions:", err);
      setError(t('fetchError'));
      toast({ variant: 'destructive', title: t('errorTitle'), description: t('fetchError') });
    } finally {
      setLoadingSessions(false);
    }
  }, [currentUser, t, toast]);

  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchUserSessions();
    } else if (!authLoading && !currentUser) {
      setLoadingSessions(false); // Not logged in, stop loading
    }
  }, [authLoading, currentUser, fetchUserSessions]);

  const handleInterestChange = (interest: string, checked: boolean) => {
    if (!interest || typeof interest !== 'string') {
      console.warn('Invalid interest value received:', interest);
      return;
    }

    setSelectedInterests(prev => {
      const newInterests = checked
        ? [...prev, interest]
        : prev.filter(i => i !== interest);

      // Ensure no duplicate interests
      return [...new Set(newInterests)];
    });
  };

  const handleScheduleSession = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const foundSessions = await findAvailableSessions(selectedInterests);
      setAvailableFilteredSessions(foundSessions);
      if (foundSessions.length === 0) {
        toast({
          variant: 'destructive',
          title: t('noSessionsFoundTitle'),
          description: t('noSessionsFoundDesc')
        });
      } else {
        toast({
          title: t('sessionsFoundTitle'),
          description: t('sessionsFoundDesc', { count: foundSessions.length })
        });
      }
    } catch (err) {
      console.error("Failed to find sessions:", err);
      setError(t('scheduleError'));
      toast({
        variant: 'destructive',
        title: t('errorTitle'),
        description: t('scheduleError')
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectSessionForFeedback = (session: SpeedDatingSession) => {
    if (!session) {
      return;
    }
    setSelectedSessionForFeedback(session);
    const initialFeedback: { [partnerId: string]: { rating: 'positive' | 'neutral' | 'negative' | ''; comment: string } } = {};
    // In a real app, you'd fetch partners for this specific session
    // For now, using generic mockPartners
    mockPartners.forEach(p => {
      initialFeedback[p.id] = { rating: '', comment: '' };
    });
    setFeedback(initialFeedback);
  };

  const handleRegisterForSession = async (sessionId: string) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setIsProcessing(true);
    try {
      await registerForSpeedDatingSession(currentUser.uid, sessionId);
      toast({ title: t('registrationSuccessTitle'), description: t('registrationSuccessDesc') });
      await fetchUserSessions(); // Refresh user's upcoming sessions
      setAvailableFilteredSessions(prev => prev.filter(s => s.id !== sessionId)); // Remove from available list
    } catch (err) {
      console.error("Failed to register for session:", err);
      toast({ variant: 'destructive', title: t('errorTitle'), description: t('registrationErrorDesc') });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProvideFeedback = (session: SpeedDatingSession) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (session.feedbackSubmitted) {
      toast({ title: t('feedbackAlreadySubmittedTitle'), description: t('feedbackAlreadySubmittedDesc') });
      return;
    }
    handleSelectSessionForFeedback(session);
  };

  const handleFeedbackChange = (partnerId: string, type: 'rating' | 'comment', value: string) => {
    setFeedback(prev => ({
      ...prev,
      [partnerId]: {
        ...prev[partnerId],
        [type]: type === 'rating' ? (value as 'positive' | 'neutral' | 'negative' | '') : value,
      },
    }));
  };

  const handleSubmitFeedback = async () => {
    if (!selectedSessionForFeedback || !currentUser) {
      if (!currentUser) router.push('/login');
      return;
    }
    setIsProcessing(true);
    try {
      const feedbackPromises = Object.entries(feedback).map(([partnerId, feedbackEntry]) => {
        if (feedbackEntry.rating) {
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
        return Promise.resolve(null);
      });
      await Promise.all(feedbackPromises);
      toast({ title: t('feedbackSubmittedTitle'), description: t('feedbackSubmittedDesc') });
      await fetchUserSessions(); // Refresh to show feedbackSubmitted = true
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
            <CardTitle>{t('feedbackTitle', { date: (selectedSessionForFeedback.dateTime as Timestamp).toDate().toLocaleDateString() })}</CardTitle>
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
                    aria-label={t('ratingLabelFor', { name: partner.name })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="positive" id={`${partner.id}-positive`} />
                      <Label htmlFor={`${partner.id}-positive`} className="cursor-pointer"><Heart className="h-5 w-5 text-green-500" /></Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="neutral" id={`${partner.id}-neutral`} />
                      <Label htmlFor={`${partner.id}-neutral`} className="cursor-pointer"><Meh className="h-5 w-5 text-yellow-500" /></Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="negative" id={`${partner.id}-negative`} />
                      <Label htmlFor={`${partner.id}-negative`} className="cursor-pointer"><Frown className="h-5 w-5 text-red-500" /></Label>
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
                    aria-label={t('commentLabelFor', { name: partner.name })}
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
              <Send className="mr-2 h-4 w-4" />
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
              {availableFilteredSessions.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-semibold">{t('availableSessionsTitle')}</h3>
                  <ul className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {availableFilteredSessions.map(session => (
                      <li key={session.id} className="p-3 border rounded-md bg-muted/50 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">{(session.dateTime as Timestamp).toDate().toLocaleDateString()}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {session.interests.map(intr => <Badge key={intr} variant="secondary" className="text-xs">{intr}</Badge>)}
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleRegisterForSession(session.id)} disabled={isProcessing}>
                          {t('registerButton')}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : upcomingSessions.length > 0 ? (
                <ul className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <li key={session.id} className="p-3 border rounded-md bg-card hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium flex items-center">
                          <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />
                          {session.dateTime.toLocaleString()}
                        </span>
                        <Badge variant="secondary" className="flex items-center">
                          <Users className="mr-1 h-3 w-3" /> {session.participantsCount}
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
                <p className="text-center text-muted-foreground py-4">{t('noSessions')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
