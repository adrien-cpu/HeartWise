
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, CalendarClock, Users, Heart, Frown, Meh, Send, CheckCircle2, Search } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  submitSpeedDatingFeedback,
  getFeedbackForSessionByUser,
  createSpeedDatingSession as createSessionService,
  registerForSpeedDatingSession,
  findAvailableSessions,
  getUpcomingSessionsForUser,
  type SpeedDatingSession,
  type SpeedDatingFeedbackData
} from '@/services/speed_dating_service';
import { Timestamp } from 'firebase/firestore';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { showNotification, requestNotificationPermission } from '@/lib/notifications';


// Mock data for partners met during a session (kept for frontend display logic, will be dynamic later)
interface MetPartner {
    id: string;
    name: string;
    // profilePicture?: string; // Could add this if fetching partner details for feedback UI
}

const availableInterests = ["Movies", "Travel", "Food", "Tech", "Books", "Music", "Sports", "Art", "Gaming", "Science"];

/**
 * @fileOverview Implements the SpeedDatingPage component.
 * @module SpeedDatingPage
 * @description Displays the Speed Dating interface, allowing users to find/create sessions
 *              and provide feedback for completed sessions, with data persisted to Firestore.
 *              User authentication is required.
 */
export default function SpeedDatingPage() {
  const t = useTranslations('SpeedDating');
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [selectedInterestsForSearch, setSelectedInterestsForSearch] = useState<string[]>([]);
  const [selectedInterestsForCreation, setSelectedInterestsForCreation] = useState<string[]>([]);
  const [selectedDateForCreation, setSelectedDateForCreation] = useState<Date | undefined>(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Default to tomorrow
  const [selectedTimeForCreation, setSelectedTimeForCreation] = useState<string>("19:00"); // Default to 7 PM
  const [maxParticipantsForCreation, setMaxParticipantsForCreation] = useState<number>(10);


  const [userSessions, setUserSessions] = useState<SpeedDatingSession[]>([]); // Sessions user is part of or created
  const [foundSessions, setFoundSessions] = useState<SpeedDatingSession[]>([]); // Sessions found via search

  const [loadingUserSessions, setLoadingUserSessions] = useState(true);
  const [loadingFoundSessions, setLoadingFoundSessions] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false); // For any button processing

  const [error, setError] = useState<string | null>(null);
  const [selectedSessionForFeedback, setSelectedSessionForFeedback] = useState<SpeedDatingSession | null>(null);

  const [feedback, setFeedback] = useState<{ [partnerId: string]: { rating: 'positive' | 'neutral' | 'negative' | ''; comment: string } }>({});

  const [mockPartnersForFeedback, setMockPartnersForFeedback] = useState<MetPartner[]>([]);

  useEffect(() => {
    requestNotificationPermission(); // Request permission when component mounts
  }, []);


  const fetchUserSessions = useCallback(async () => {
    if (!currentUser) return;
    setLoadingUserSessions(true);
    try {
      const sessions = await getUpcomingSessionsForUser(currentUser.uid);
      const sessionsWithFeedbackStatus = await Promise.all(sessions.map(async (session) => {
        let feedbackSubmitted = false;
        if (session.status === 'completed') {
          const existingFeedback = await getFeedbackForSessionByUser(currentUser.uid, session.id);
          if (existingFeedback.length > 0) { 
            feedbackSubmitted = true;
          }
        }
        return { ...session, feedbackSubmitted };
      }));
      setUserSessions(sessionsWithFeedbackStatus.sort((a, b) => (a.dateTime as Timestamp).toDate().getTime() - (b.dateTime as Timestamp).toDate().getTime()));
    } catch (err) {
      console.error("Failed to fetch user sessions:", err);
      setError(t('fetchError'));
      toast({ variant: 'destructive', title: t('errorTitle'), description: t('fetchError') });
    } finally {
      setLoadingUserSessions(false);
    }
  }, [currentUser, t, toast]);

  useEffect(() => {
    if (!authLoading && currentUser) {
        fetchUserSessions();
    } else if (!authLoading && !currentUser) {
        setLoadingUserSessions(false);
    }
  }, [authLoading, currentUser, fetchUserSessions]);


  const handleInterestChange = (interest: string, checked: boolean, type: 'search' | 'create') => {
    const setter = type === 'search' ? setSelectedInterestsForSearch : setSelectedInterestsForCreation;
    setter(prev =>
      checked ? [...prev, interest] : prev.filter(i => i !== interest)
    );
  };

  const handleFindSessions = async () => {
    if (!currentUser) {
      toast({ variant: 'destructive', title: t('authErrorTitle'), description: t('authErrorDesc') });
      router.push('/login');
      return;
    }
    setLoadingFoundSessions(true);
    setIsProcessingAction(true);
    setError(null);
    setFoundSessions([]);
    try {
      const sessions = await findAvailableSessions(selectedInterestsForSearch);
      setFoundSessions(sessions);
      if (sessions.length === 0) {
        toast({ title: t('noSessionsFoundTitle'), description: t('noSessionsFoundDesc') });
      } else {
        toast({ title: t('sessionsFoundTitle'), description: t('sessionsFoundDesc', {count: sessions.length}) });
      }
    } catch (err) {
      console.error("Failed to find sessions:", err);
      setError(t('scheduleError'));
      toast({ variant: 'destructive', title: t('errorTitle'), description: t('scheduleError') });
    } finally {
      setLoadingFoundSessions(false);
      setIsProcessingAction(false);
    }
  };

  const handleCreateNewSession = async () => {
    if (!currentUser) {
      toast({ variant: 'destructive', title: t('authErrorTitle'), description: t('authErrorDesc') });
      router.push('/login');
      return;
    }
    if (selectedInterestsForCreation.length === 0) {
      toast({ variant: 'destructive', title: t('createInterestsErrorTitle'), description: t('createInterestsErrorDesc') });
      return;
    }
    if (!selectedDateForCreation || !selectedTimeForCreation) {
      toast({ variant: 'destructive', title: t('createDateTimeErrorTitle'), description: t('createDateTimeErrorDesc') });
      return;
    }
    if (maxParticipantsForCreation < 2 || maxParticipantsForCreation > 20) {
      toast({ variant: 'destructive', title: t('createMaxParticipantsErrorTitle'), description: t('createMaxParticipantsErrorDesc') });
      return;
    }

    const [hours, minutes] = selectedTimeForCreation.split(':').map(Number);
    const sessionDateTime = new Date(selectedDateForCreation);
    sessionDateTime.setHours(hours, minutes, 0, 0);

    if (sessionDateTime.getTime() <= Date.now()) {
      toast({ variant: 'destructive', title: t('createPastDateTimeErrorTitle'), description: t('createPastDateTimeErrorDesc') });
      return;
    }

    setIsProcessingAction(true);
    setError(null);
    try {
      await createSessionService({
        creatorId: currentUser.uid,
        interests: selectedInterestsForCreation,
        sessionDateTime: Timestamp.fromDate(sessionDateTime),
        maxParticipants: maxParticipantsForCreation
      });
      toast({ title: t('createSuccessTitle'), description: t('createSuccessDesc') });
      showNotification(t('createSuccessNotifTitle'), { body: t('createSuccessNotifBody') });
      setSelectedInterestsForCreation([]);
      await fetchUserSessions();
    } catch (err: any) {
      console.error("Failed to create session:", err);
      setError(err.message || t('createError'));
      toast({ variant: 'destructive', title: t('errorTitle'), description: err.message || t('createError') });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleRegisterForSession = async (sessionId: string) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setIsProcessingAction(true);
    try {
      await registerForSpeedDatingSession(currentUser.uid, sessionId);
      toast({ title: t('registrationSuccessTitle'), description: t('registrationSuccessDesc')});
      showNotification(t('registrationSuccessNotifTitle'), { body: t('registrationSuccessNotifBody') });
      await fetchUserSessions();
      setFoundSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err: any) {
      console.error("Failed to register for session:", err);
      toast({ variant: 'destructive', title: t('errorTitle'), description: err.message || t('registrationErrorDesc') });
    } finally {
      setIsProcessingAction(false);
    }
  };


  const handleProvideFeedback = (session: SpeedDatingSession) => {
     if (!currentUser) {
      router.push('/login');
      return;
    }
    if (session.feedbackSubmitted) {
        toast({title: t('feedbackAlreadySubmittedTitle'), description: t('feedbackAlreadySubmittedDesc')});
        return;
    }
    setSelectedSessionForFeedback(session);
    const currentSessionPartners: MetPartner[] = session.participantIds
        .filter(pid => pid !== currentUser.uid)
        .map((pid, index) => ({ id: pid, name: session.participants?.[pid]?.name || `Partner ${index + 1}` }));


    setMockPartnersForFeedback(currentSessionPartners);

    const initialFeedback: { [partnerId: string]: { rating: 'positive' | 'neutral' | 'negative' | ''; comment: string } } = {};
    currentSessionPartners.forEach(p => {
        initialFeedback[p.id] = { rating: '', comment: '' };
    });
    setFeedback(initialFeedback);
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
      setIsProcessingAction(true);
      try {
        const feedbackPromises = Object.entries(feedback).map(([partnerId, feedbackEntry]) => {
            if (feedbackEntry.rating) {
                const partnerName = mockPartnersForFeedback.find(p => p.id === partnerId)?.name || 'Unknown Partner';
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
        showNotification(t('feedbackSubmittedNotifTitle'), { body: t('feedbackSubmittedNotifBody') });
        await fetchUserSessions();
        setSelectedSessionForFeedback(null);
        setFeedback({});
      } catch (error) {
         console.error("Failed to submit feedback:", error);
         toast({ variant: 'destructive', title: t('errorTitle'), description: t('feedbackErrorDesc') });
      } finally {
        setIsProcessingAction(false);
      }
  };

  if (authLoading && !currentUser) {
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
                 {mockPartnersForFeedback.length > 0 ? mockPartnersForFeedback.map(partner => (
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
                 )) : (
                    <p className="text-muted-foreground text-center">{t('noPartnersForFeedback')}</p>
                 )}
              </CardContent>
              <CardFooter className="flex justify-between">
                 <Button variant="outline" onClick={() => setSelectedSessionForFeedback(null)} disabled={isProcessingAction}>
                     {t('cancelButton')}
                 </Button>
                 <Button onClick={handleSubmitFeedback} disabled={isProcessingAction || mockPartnersForFeedback.length === 0}>
                    {isProcessingAction && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Send className="mr-2 h-4 w-4"/>
                    {t('submitFeedbackButton')}
                 </Button>
              </CardFooter>
          </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 shadow-lg border">
            <CardHeader>
              <CardTitle>{t('createSessionTitle')}</CardTitle>
              <CardDescription>{t('createSessionDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-semibold mb-2 block">{t('selectInterestsForCreation')}</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {availableInterests.map(interest => (
                    <div key={`create-${interest}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`create-interest-${interest}`}
                        checked={selectedInterestsForCreation.includes(interest)}
                        onCheckedChange={(checked) => handleInterestChange(interest, !!checked, 'create')}
                        disabled={isProcessingAction}
                      />
                      <Label htmlFor={`create-interest-${interest}`} className="text-sm font-medium cursor-pointer">
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="session-date" className="font-semibold mb-2 block">{t('sessionDate')}</Label>
                <DatePicker date={selectedDateForCreation} setDate={setSelectedDateForCreation} disabled={isProcessingAction} />
              </div>
              <div>
                <Label htmlFor="session-time" className="font-semibold mb-2 block">{t('sessionTime')}</Label>
                <TimePicker value={selectedTimeForCreation} onChange={setSelectedTimeForCreation} disabled={isProcessingAction} />
              </div>
               <div>
                <Label htmlFor="max-participants" className="font-semibold mb-2 block">{t('maxParticipantsLabel')}</Label>
                <input
                    type="number"
                    id="max-participants"
                    value={maxParticipantsForCreation}
                    onChange={(e) => setMaxParticipantsForCreation(Math.max(2, Math.min(20, parseInt(e.target.value,10) || 2)))}
                    min="2"
                    max="20"
                    className="w-full p-2 border rounded-md"
                    disabled={isProcessingAction}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCreateNewSession} disabled={isProcessingAction || !currentUser || selectedInterestsForCreation.length === 0} className="w-full">
                {isProcessingAction && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('createButton')}
              </Button>
            </CardFooter>
             {!currentUser && !authLoading && (
                <p className="px-6 pb-4 text-sm text-muted-foreground">{t('loginToCreate')}</p>
            )}
          </Card>

          <Card className="lg:col-span-2 shadow-lg border">
            <CardHeader>
              <CardTitle>{t('findSessionTitle')}</CardTitle>
              <CardDescription>{t('findSessionDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-semibold mb-2 block">{t('selectInterests')}</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableInterests.map(interest => (
                    <div key={`search-${interest}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`search-interest-${interest}`}
                        checked={selectedInterestsForSearch.includes(interest)}
                        onCheckedChange={(checked) => handleInterestChange(interest, !!checked, 'search')}
                        disabled={isProcessingAction}
                      />
                      <Label htmlFor={`search-interest-${interest}`} className="text-sm font-medium cursor-pointer">
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleFindSessions} disabled={isProcessingAction || !currentUser} className="w-full sm:w-auto">
                {loadingFoundSessions && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Search className="mr-2 h-4 w-4" />
                {t('findButton')}
              </Button>

              {loadingFoundSessions ? (
                 <div className="mt-4 space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                 </div>
              ) : foundSessions.length > 0 ? (
                <div className="mt-6 space-y-3">
                  <h3 className="font-semibold">{t('availableSessionsTitle')}</h3>
                  <ul className="max-h-60 overflow-y-auto space-y-2 pr-2 border rounded-md p-2 bg-muted/20">
                    {foundSessions.map(session => (
                       <li key={session.id} className="p-3 border rounded-md bg-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex-grow">
                            <p className="text-sm font-medium">{(session.dateTime as Timestamp).toDate().toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'})}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {session.interests.map(intr => <Badge key={intr} variant="secondary" className="text-xs">{intr}</Badge>)}
                            </div>
                             <p className="text-xs text-muted-foreground mt-1">{t('participantsCount', { current: session.participantsCount, max: session.maxParticipants })}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleRegisterForSession(session.id)}
                            disabled={isProcessingAction || session.participantIds.includes(currentUser?.uid || '')}
                            className="mt-2 sm:mt-0"
                           >
                            {session.participantIds.includes(currentUser?.uid || '') ? t('alreadyRegistered') : t('registerButton')}
                          </Button>
                       </li>
                    ))}
                  </ul>
                </div>
              ) : (
                 !loadingFoundSessions && <p className="mt-4 text-center text-muted-foreground">{t('noResultsHelp')}</p>
              )}
            </CardContent>
             {!currentUser && !authLoading && (
                <CardFooter>
                    <p className="text-sm text-muted-foreground">{t('loginToFind')}</p>
                </CardFooter>
            )}
          </Card>

           <Card className="lg:col-span-3 shadow-lg border">
            <CardHeader>
              <CardTitle>{t('upcomingSessions')}</CardTitle>
              <CardDescription>{t('upcomingSessionsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUserSessions ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="space-y-2 p-3 border rounded-md bg-muted/30">
                       <Skeleton className="h-5 w-3/4" />
                       <Skeleton className="h-4 w-1/2" />
                       <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : userSessions.length > 0 ? (
                <ul className="space-y-4">
                  {userSessions.map((session) => (
                    <li key={session.id} className="p-3 border rounded-md bg-card hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-1">
                         <span className="font-medium flex items-center text-sm">
                           <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground"/>
                           {(session.dateTime as Timestamp).toDate().toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'})}
                         </span>
                         <Badge variant={session.status === 'full' ? 'destructive' : 'secondary'} className="text-xs">
                           <Users className="mr-1 h-3 w-3"/> {session.participantsCount}/{session.maxParticipants} {t('participants')}
                         </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 my-2">
                        {session.interests.map(interest => (
                          <Badge key={interest} variant="outline" className="text-xs">{interest}</Badge>
                        ))}
                      </div>
                       {session.status === 'completed' && (
                           (session as any).feedbackSubmitted ?
                             <div className="flex items-center text-sm text-green-600">
                               <CheckCircle2 className="mr-1 h-4 w-4" />
                               {t('feedbackSubmittedShort')}
                             </div>
                           : (
                             <Button size="sm" variant="outline" onClick={() => handleProvideFeedback(session)} disabled={isProcessingAction || !currentUser}>
                               {t('provideFeedbackButton')}
                             </Button>
                           )
                       )}
                       {session.status === 'in-progress' && (
                           <Badge variant="default">{t('sessionInProgress')}</Badge>
                       )}
                       {(session.status === 'scheduled' || session.status === 'full') && (
                            <Badge variant="outline" className={session.status === 'full' ? 'border-destructive text-destructive' : ''}>
                                {session.status === 'full' ? t('sessionFull') : t('sessionScheduled')}
                            </Badge>
                       )}
                        {session.status === 'cancelled' && (
                            <Badge variant="destructive">{t('sessionCancelled')}</Badge>
                       )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground py-4">{!currentUser && !authLoading ? t('loginToViewSessions') : t('noSessions')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

    
