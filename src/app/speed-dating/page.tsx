
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
```
  </change>
  <change>
    <file>src/messages/en.json</file>
    <description>Add English translations for Speed Dating feedback UI.</description>
    <content><![CDATA[
{
  "Home": {
    "tagline": "Find meaningful connections.",
    "features": "Features",
    "geolocationMeeting": "Geolocation Meeting",
    "facialAnalysisMatching": "Facial Analysis Matching",
    "aiConversationCoach": "AI Conversation Coach",
    "riskyWordsDictionary": "Risky Words Dictionary",
    "blindExchangeMode": "Blind Exchange Mode",
    "game": "Game",
    "speedDating": "Speed Dating",
    "chat": "Chat",
    "rewards": "Rewards",
    "profile": "Profile",
    "myAccount": "My Account",
    "settings": "Settings",
    "logout": "Logout",
    "dashboardTitle": "Welcome to HeartWise",
    "dashboardDescription": "Explore our features and find your perfect match:",
    "selectLanguage": "Select Language",
    "locale": "{locale, select, en {English} fr {French} other {Unknown}}",
    "navigation": "Navigation",
    "dashboard": "Dashboard",
    "mainPageTitle": "Welcome to HeartWise",
    "mainPageDescription": "The innovative dating app focused on emotional intelligence and genuine connection. Explore our features to find meaningful relationships.",
    "goToDashboard": "Go to Dashboard"
  },
  "GeolocationMeeting": {
    "title": "Find Nearby Connections",
    "geolocationNotSupported": "Geolocation is not supported by your browser.",
    "yourLocation": "Your Current Location",
    "latitude": "Latitude",
    "longitude": "Longitude",
    "meetingPlacesTitle": "Suggested Meeting Spots",
    "meetingPlacesDescription": "Public places near you for potential meetups.",
    "loadingLocation": "Getting your location...",
    "locationUnavailable": "Could not retrieve location.",
    "geolocationErrorTitle": "Geolocation Error",
    "geolocationError": "Could not get location: {message}",
    "fetchError": "Failed to load nearby data.",
    "nearbyUsersTitle": "Users Nearby",
    "nearbyUsersDescription": "Connect with users in your vicinity.",
    "noMeetingPlaces": "No suggested meeting places found nearby.",
    "noNearbyUsers": "No other users found nearby.",
    "connectButton": "Connect",
    "errorTitle": "Error"
  },
  "FacialAnalysisMatching": {
    "title": "Facial Analysis & Matching",
    "image1UrlPlaceholder": "Enter URL for Image 1",
    "image2UrlPlaceholder": "Enter URL for Image 2",
    "analyzeAndCompareButton": "Analyze & Compare",
    "analysisResult1": "Analysis Result (Image 1)",
    "analysisResult2": "Analysis Result (Image 2)",
    "age": "Estimated Age",
    "gender": "Estimated Gender",
    "emotion": "Dominant Emotion",
    "compatibilityScore": "Compatibility Score",
    "errorMissingImageUrl": "Please enter URLs for both images.",
    "errorAnalysisFailed": "Analysis failed: {message}",
    "unknownError": "An unknown error occurred"
  },
  "AIConversationCoachPage": {
    "pageTitle": "AI Conversation Coach",
    "pageDescription": "Get personalized tips and style suggestions to improve your conversations.",
    "adviceGenerated": "Advice Generated",
    "adviceReceived": "Received conversation advice successfully.",
    "errorGeneratingAdvice": "Error Generating Advice",
    "adviceGenerationFailed": "Failed to generate conversation advice.",
    "getTipsButton": "Get Conversation Tips",
    "tips": "Conversation Tips",
    "conversationHistoryLabel": "Conversation History",
    "conversationHistoryPlaceholder": "Paste recent messages for context...",
    "user1ProfileLabel": "Your Profile Summary",
    "user1ProfilePlaceholder": "Briefly describe yourself (interests, personality)...",
    "user2ProfileLabel": "Partner's Profile Summary",
    "user2ProfilePlaceholder": "Briefly describe your potential partner...",
    "conversationInputTitle": "Provide Context",
    "provideContext": "Help the AI understand the situation for better advice.",
    "userComfortLevelLabel": "Your Comfort Level (Optional)",
    "userComfortLevelPlaceholder": "e.g., shy, outgoing, direct, poetic...",
    "comfortLevelHelp": "Helps tailor the tone of suggestions.",
    "getStyleSuggestionsButton": "Suggest Communication Styles",
    "styleSuggestionsGenerated": "Styles Generated",
    "styleSuggestionsReceived": "Received style suggestions.",
    "errorGeneratingStyles": "Error Generating Styles",
    "styleGenerationFailed": "Failed to generate style suggestions.",
    "styleSuggestionsTitle": "Style Suggestions",
    "styleSuggestionsDescription": "Explore different ways to communicate based on the context.",
    "examples": "Examples:",
    "adviceCardDescription": "General tips based on the conversation flow.",
    "missingInputError": "Missing Information",
    "fillFieldsError": "Please fill in Conversation History and both Profile Summaries to get advice.",
    "missingProfileError": "Missing Profiles",
    "fillProfileFieldsError": "Please fill in both Profile Summaries to get style suggestions."
  },
  "BlindExchangeMode": {
    "title": "Blind Exchange Mode",
    "matchedProfile": "Potential Connection",
    "compatibility": "Compatibility",
    "loading": "Finding a potential connection...",
    "match": "Match",
    "user1": "User 1",
    "user2": "User 2",
    "sharedInterests": "Shared Interests",
    "noMatches": "No suitable match found at the moment."
  },
  "Game": {
    "title": "General Knowledge Game",
    "randomPartner": "Play with Random Partner",
    "matchPartner": "Play with Match",
    "question": "Question",
    "answer": "Answer",
    "nextQuestion": "Next Question",
    "submitAnswer": "Submit answer",
    "correctAnswer": "Correct answer!",
    "incorrectAnswer": "Incorrect answer."
  },
  "ProfilePage": {
    "title": "User Profile",
    "description": "View and edit your profile information.",
    "loading": "Loading profile...",
    "noProfile": "Profile not found.",
    "editProfile": "Edit Profile",
    "cancel": "Cancel",
    "saveChanges": "Save Changes",
    "saving": "Saving...",
    "nameLabel": "Name",
    "bioLabel": "Bio",
    "bioPlaceholder": "Tell us a bit about yourself...",
    "interestsLabel": "Interests",
    "privacySettingsLabel": "Privacy Settings",
    "showLocationLabel": "Show my approximate location to others",
    "showOnlineStatusLabel": "Show my online status",
    "fetchErrorTitle": "Error Fetching Profile",
    "fetchErrorDescription": "Could not load your profile data. Please try again later.",
    "updateSuccessTitle": "Profile Updated",
    "updateSuccessDescription": "Your profile has been successfully updated.",
    "updateErrorTitle": "Error Updating Profile",
    "updateErrorDescription": "Failed to save your profile changes. Please try again.",
    "notSet": "Not set",
    "noInterests": "No interests selected.",
    "anonymousUser": "Anonymous User",
    "yes": "Yes",
    "no": "No",
    "uploadPicture": "Upload Picture"
  },
  "SpeedDating": {
    "title": "Speed Dating",
    "scheduleTitle": "Schedule a Speed Dating Session",
    "scheduleDescription": "Select interests you'd like to match on.",
    "selectInterests": "Select Interests",
    "scheduleButton": "Find a Session",
    "upcomingSessions": "Upcoming Sessions",
    "upcomingSessionsDesc": "Your scheduled speed dating events.",
    "noSessions": "No upcoming speed dating sessions scheduled.",
    "loading": "Loading...",
    "fetchError": "Failed to load speed dating data.",
    "scheduleSuccessTitle": "Session Scheduled!",
    "scheduleSuccess": "Speed dating session based on your interests has been scheduled!",
    "scheduleError": "Failed to schedule speed dating session.",
    "errorTitle": "Error",
    "selectInterestsErrorTitle": "Select Interests",
    "selectInterestsErrorDesc": "Please select at least one interest to schedule a session.",
    "provideFeedbackButton": "Provide Feedback",
    "sessionInProgress": "In Progress",
    "sessionScheduled": "Scheduled",
    "feedbackTitle": "Feedback for Session ({date})",
    "feedbackDescription": "Share your thoughts on the partners you met.",
    "feedbackFor": "Feedback for {name}",
    "ratingLabel": "Overall Impression",
    "commentLabel": "Comments (Optional)",
    "commentPlaceholder": "Any specific thoughts?",
    "submitFeedbackButton": "Submit Feedback",
    "feedbackSubmittedTitle": "Feedback Submitted",
    "feedbackSubmittedDesc": "Thank you for your feedback!",
    "feedbackErrorDesc": "Failed to submit feedback. Please try again.",
    "cancelButton": "Cancel"
  },
  "Chat": {
    "title": "Chat",
    "conversationListDesc": "Select a conversation to view messages.",
    "loadingChats": "Loading conversations...",
    "noChats": "No active conversations. Start chatting!",
    "sendMessagePlaceholder": "Type your message...",
    "sendButton": "Send",
    "errorLoadingChats": "Error loading conversations.",
    "errorSendingMessage": "Error sending message.",
    "selectChatPrompt": "Select a conversation to start chatting.",
    "compatibilityScoreTitle": "Compatibility Score",
    "statusOnline": "Online",
    "statusOffline": "Offline",
    "intentionTagLabel": "Intention (Optional)",
    "selectIntentionPlaceholder": "Select intention...",
    "noTagOption": "None",
    "intentionTagTitle": "Intention",
    "startAudioCall": "Start Audio Call",
    "startVideoCall": "Start Video Call",
    "videoCallTitle": "Starting Video Call...",
    "videoCallDesc": "Connecting video call with {name}. (Requires backend)",
    "audioCallTitle": "Starting Audio Call...",
    "audioCallDesc": "Connecting audio call with {name}. (Requires backend)",
    "messageFailedToSend": "Failed to send message.",
    "errorLoadingProfile": "Error loading your profile.",
    "unknownUser": "Unknown User"
  },
  "RiskyWordsDictionary": {
    "title": "Risky Words Dictionary",
    "description": "Analyze your messages for potentially ambiguous or sensitive phrases before sending.",
    "inputTextTitle": "Enter Text to Analyze",
    "inputTextDescription": "Type or paste the message you want to check.",
    "messageLabel": "Your Message",
    "placeholder": "Type your message here...",
    "analyzeButton": "Analyze Text",
    "analyzingButton": "Analyzing...",
    "analysisResultsTitle": "Analysis Results",
    "analysisResultsDescription": "Potential interpretations and suggestions for clarification.",
    "possibleInterpretations": "Possible Interpretations",
    "clarificationSuggestion": "Clarification Suggestion",
    "analysisComplete": "Analysis Complete",
    "noRiskyWordsFound": "No potentially risky words found in the text.",
    "riskyWordsFound": "{count, plural, =1 {One potentially risky phrase found.} other {# potentially risky phrases found.}}",
    "errorTitle": "Error",
    "emptyInputError": "Please enter some text to analyze.",
    "analysisError": "An error occurred while analyzing the text. Please try again."
  },
  "RewardsPage": {
    "title": "Your Rewards",
    "description": "Check out the badges you've earned and your current points!",
    "myBadges": "My Badges",
    "earnedBadgesDesc": "Badges earned through your activity in the app.",
    "noBadges": "You haven't earned any badges yet. Keep exploring!",
    "fetchErrorTitle": "Error Loading Rewards",
    "fetchErrorDescription": "Could not load your rewards. Please try again later.",
    "earned": "Earned",
    "badge_profile_complete_name": "Profile Pro",
    "badge_profile_complete_desc": "Filled out your profile details.",
    "badge_first_chat_name": "Ice Breaker",
    "badge_first_chat_desc": "Initiated your first chat.",
    "badge_first_match_name": "Match Maker",
    "badge_first_match_desc": "Got your first match!",
    "badge_speed_dater_name": "Speed Dater",
    "badge_speed_dater_desc": "Participated in a Speed Dating session.",
    "badge_game_winner_name": "Quiz Whiz",
    "badge_game_winner_desc": "Won a round in the game.",
    "badge_blind_exchange_participant_name": "Mystery Seeker",
    "badge_blind_exchange_participant_desc": "Tried the Blind Exchange mode.",
    "badge_explorer_name": "Local Explorer",
    "badge_explorer_desc": "Checked out the Geolocation feature.",
    "yourPoints": "Your Points",
    "pointsDesc": "Points earned for activities and achievements.",
    "noPoints": "You haven't earned any points yet.",
    "pointsSuffix": "points"
  },
  "DashboardPage": {
    "welcome": "Welcome, {name}!",
    "dashboardOverview": "Here's your personalized HeartWise dashboard.",
    "personalizedAdviceTitle": "Today's Tip",
    "personalizedAdviceDesc": "A suggestion to enhance your experience.",
    "profileCompletenessTitle": "Profile Completeness",
    "profileCompletenessDesc": "Complete your profile to improve matches.",
    "quickStatsTitle": "Quick Stats",
    "quickStatsDesc": "Your recent activity overview.",
    "totalPoints": "Total Points",
    "badgesEarned": "Badges Earned",
    "recentBadgesTitle": "Recent Badges",
    "recentBadgesDesc": "Your latest achievements.",
    "moreBadges": "more",
    "mockAdvice1": "Consider updating your bio to reflect your current mood or interests.",
    "mockAdvice2": "Try initiating a conversation with someone who shares a unique interest.",
    "mockAdvice3": "Explore the Blind Exchange mode for a different kind of connection."
  },
   "Sidebar": {
      "toggleSidebar": "Toggle Sidebar"
   }
}

    