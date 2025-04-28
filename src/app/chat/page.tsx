"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Send, User, HeartHandshake, Smile, Info, Flirt, Video, Phone, AlertCircle } from 'lucide-react'; // Added Video, Phone, AlertCircle icons
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { UserProfile, get_user } from '@/services/user_profile'; // Import user profile service
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Added Tooltip


/**
 * @fileOverview Chat page component.
 * @module ChatPage
 * @description Displays the chat interface, allowing users to select conversations and send/receive messages. Includes mock compatibility display and optional intention tags. Simulates video/audio call initiation.
 */


// Mock data structures
interface Message {
  id: string;
  senderId: string; // 'user1' for current user, 'user2', 'user3' etc. for others
  senderName: string;
  text: string;
  timestamp: Date;
  intentionTag?: string; // Optional intention tag (e.g., 'humor', 'serious', 'flirt')
  status?: 'sent' | 'delivered' | 'read' | 'error'; // Mock message status
}

interface ConversationParticipant extends UserProfile {
  // Inherits UserProfile fields like id, name, profilePicture, bio, interests etc.
  compatibilityScore?: number; // Mock compatibility score (0-100)
  isOnline?: boolean; // Mock online status
}

interface Conversation {
  id: string;
  participant: ConversationParticipant; // Use the extended participant type
  lastMessage: string;
  lastMessageTimestamp: Date;
  unreadCount?: number; // Mock unread message count
  messages: Message[];
}

// Mock current user ID
const CURRENT_USER_ID = 'user1';
const CURRENT_USER_NAME = 'Me'; // Or fetch from profile

// Mock participants with compatibility and online status
const mockParticipants: { [key: string]: ConversationParticipant } = {
  'user2': {
    id: 'user2',
    name: 'Bob',
    profilePicture: 'https://picsum.photos/seed/bob/50/50',
    bio: 'Loves cooking and travel.',
    interests: ['Cooking', 'Travel'],
    compatibilityScore: 75,
    isOnline: true,
  },
  'user3': {
    id: 'user3',
    name: 'Charlie',
    profilePicture: 'https://picsum.photos/seed/charlie/50/50',
    bio: 'Tech enthusiast and bookworm.',
    interests: ['Tech', 'Books'],
    compatibilityScore: 60,
    isOnline: false,
  },
  'user4': {
    id: 'user4',
    name: 'Diana',
    profilePicture: 'https://picsum.photos/seed/diana/50/50',
    bio: 'Outdoor adventurer and music lover.',
    interests: ['Hiking', 'Music', 'Travel'],
    compatibilityScore: 88,
    isOnline: true,
  },
};


// Mock conversations data using participants
const initialConversations: Conversation[] = [
  {
    id: 'conv1',
    participant: mockParticipants['user2'],
    lastMessage: 'Hey, how are you?',
    lastMessageTimestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    unreadCount: 2,
    messages: [
      { id: 'm1', senderId: 'user2', senderName: mockParticipants['user2'].name || 'Bob', text: 'Hey, how are you?', timestamp: new Date(Date.now() - 5 * 60 * 1000), status: 'read' },
      { id: 'm2', senderId: 'user1', senderName: CURRENT_USER_NAME, text: 'Hi Bob! I\'m good, thanks. You?', timestamp: new Date(Date.now() - 4 * 60 * 1000), intentionTag: 'friendly', status: 'delivered' },
       { id: 'm6', senderId: 'user2', senderName: mockParticipants['user2'].name || 'Bob', text: 'Doing great! Just finished a cooking class.', timestamp: new Date(Date.now() - 3 * 60 * 1000), status: 'delivered' },
       { id: 'm7', senderId: 'user2', senderName: mockParticipants['user2'].name || 'Bob', text: 'What about you?', timestamp: new Date(Date.now() - 2 * 60 * 1000), status: 'delivered' },
    ],
  },
   {
    id: 'conv2',
    participant: mockParticipants['user3'],
    lastMessage: 'Did you see that movie?',
    lastMessageTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    unreadCount: 0,
    messages: [
      { id: 'm3', senderId: 'user3', senderName: mockParticipants['user3'].name || 'Charlie', text: 'Did you see that movie?', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), status: 'read' },
    ],
  },
   {
    id: 'conv3',
    participant: mockParticipants['user4'],
    lastMessage: 'Planning anything fun this weekend?',
    lastMessageTimestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    unreadCount: 1,
    messages: [
       { id: 'm4', senderId: 'user1', senderName: CURRENT_USER_NAME, text: 'Hey Diana!', timestamp: new Date(Date.now() - 1.1 * 24 * 60 * 60 * 1000), status: 'read' },
       { id: 'm5', senderId: 'user4', senderName: mockParticipants['user4'].name || 'Diana', text: 'Planning anything fun this weekend?', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: 'delivered' },
    ],
  },
];

// Available intention tags
const intentionTags = [
  { value: 'friendly', label: 'Friendly', icon: <Smile className="h-4 w-4 mr-2"/> },
  { value: 'humor', label: 'Humor', icon: <Smile className="h-4 w-4 mr-2"/> }, // Reusing Smile icon
  { value: 'serious', label: 'Serious', icon: <Info className="h-4 w-4 mr-2"/> },
  { value: 'flirt', label: 'Flirt', icon: <Flirt className="h-4 w-4 mr-2"/> },
  { value: 'tender', label: 'Tender', icon: <HeartHandshake className="h-4 w-4 mr-2"/> }, // Reusing HeartHandshake
];

/**
 * ChatPage component.
 *
 * @component
 * @description Displays the chat interface, allowing users to select conversations and send/receive messages. Includes intention tag selection and mock call initiation.
 *              **Requires Backend:** Real-time messaging (WebSockets), persistent message storage (Database), actual call functionality (WebRTC - e.g., Twilio, Agora), and AI logic for intention tag analysis/suggestion.
 * @returns {JSX.Element} The rendered Chat page.
 */
export default function ChatPage() {
  const t = useTranslations('Chat');
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedIntention, setSelectedIntention] = useState<string>(''); // State for selected intention tag
  const [loadingChats, setLoadingChats] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

  // Fetch current user profile
  useEffect(() => {
    setLoadingChats(true); // Also indicate loading while fetching user profile
    get_user(CURRENT_USER_ID)
      .then(profile => setCurrentUserProfile(profile))
      .catch(err => {
         console.error("Failed to fetch current user profile:", err);
         toast({ variant: 'destructive', title: t('errorLoadingProfile') })
        })
      .finally(() => setLoadingChats(false)); // Stop loading indicator here or combine with chat loading
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]); // Depend on toast


  // Fetch conversations (mocked)
  useEffect(() => {
    const loadChats = async () => {
      setLoadingChats(true);
      // Simulate API call - **Replace with actual backend fetch**
      // Requires backend API to get conversations for CURRENT_USER_ID
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
          const sortedConversations = [...initialConversations].sort((a,b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime());
          setConversations(sortedConversations);
          if (sortedConversations.length > 0 && !selectedConversationId) {
            setSelectedConversationId(sortedConversations[0].id); // Select the first one initially if none selected
          }
      } catch (error) {
          console.error("Failed to load chats:", error);
          toast({ variant: 'destructive', title: t('errorLoadingChats') });
      } finally {
        setLoadingChats(false);
      }
    };
    loadChats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]); // Depend on toast

  // Scroll to bottom when messages change or conversation is selected
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedConversationId, conversations]); // Rerun when conversation or messages change

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  /**
   * Handles sending a new message.
   * **Requires Backend:** API endpoint to send message, WebSocket for real-time delivery.
   * @async
   */
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId || !selectedConversation) return;

    const tempId = `msg-${Date.now()}`; // Temporary ID for optimistic update
    setSendingMessage(true);
    const messageToSend: Message = {
      id: tempId,
      senderId: CURRENT_USER_ID,
      senderName: CURRENT_USER_NAME,
      text: newMessage.trim(),
      timestamp: new Date(),
      intentionTag: selectedIntention || undefined, // Include selected intention or undefined
      status: 'sent', // Initial status
    };

     // Optimistic UI update
     setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversationId
            ? {
                ...conv,
                messages: [...conv.messages, messageToSend],
                lastMessage: messageToSend.text,
                lastMessageTimestamp: messageToSend.timestamp,
              }
            : conv
        ).sort((a,b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime()) // Re-sort
      );
      setNewMessage('');
      setSelectedIntention(''); // Reset intention tag
      // Scroll after optimistic update
       requestAnimationFrame(() => {
         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
       });


    try {
      // **Replace with actual API call to send message**
      // e.g., await sendMessageAPI(selectedConversationId, messageToSend);
      await new Promise(resolve => setTimeout(resolve, 700)); // Simulate network delay

      // **Update message status based on API response (if needed)**
      // e.g., if API confirms delivery, update status to 'delivered'
      // This might also happen via WebSocket confirmation
      // setConversations(prev => prev.map(conv => {
      //     if (conv.id === selectedConversationId) {
      //         const msgs = conv.messages.map(msg => msg.id === tempId ? {...msg, status: 'delivered'} : msg);
      //         return {...conv, messages: msgs};
      //     }
      //     return conv;
      // }));


    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        variant: 'destructive',
        title: t('errorSendingMessage'),
      });
      // Revert optimistic update or mark message as failed
       setConversations(prev => prev.map(conv => {
           if (conv.id === selectedConversationId) {
               const msgs = conv.messages.map(msg => msg.id === tempId ? {...msg, status: 'error'} : msg);
               return {...conv, messages: msgs};
           }
           return conv;
       }));
    } finally {
      setSendingMessage(false);
    }
  };

  /**
   * Handles key press events in the input field (send on Enter).
   * @param {React.KeyboardEvent<HTMLInputElement>} e - The keyboard event.
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent newline in input
      handleSendMessage();
    }
  };

  // Get initials for AvatarFallback
  const getInitials = (name?: string): string => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Get display info for intention tag
  const getIntentionTagInfo = (tagValue?: string) => {
      return intentionTags.find(tag => tag.value === tagValue);
  }

  // Mock call initiation functions
  const handleStartVideoCall = () => {
      if (!selectedConversation) return;
      // **Requires Backend/WebRTC integration**
      console.log(`Initiating video call with ${selectedConversation.participant.name}`);
      toast({ title: t('videoCallTitle'), description: t('videoCallDesc', { name: selectedConversation.participant.name }) });
      // Actual WebRTC logic would go here
  }
  const handleStartAudioCall = () => {
      if (!selectedConversation) return;
       // **Requires Backend/WebRTC integration**
      console.log(`Initiating audio call with ${selectedConversation.participant.name}`);
      toast({ title: t('audioCallTitle'), description: t('audioCallDesc', { name: selectedConversation.participant.name }) });
       // Actual WebRTC logic would go here
  }


  return (
    <TooltipProvider> {/* Wrap with TooltipProvider */}
        <div className="container mx-auto h-[calc(100vh-80px)] flex flex-col p-0 md:p-4"> {/* Adjust height based on header/footer */}
        <Card className="flex flex-grow overflow-hidden h-full shadow-lg rounded-lg border">
            {/* Conversation List Sidebar */}
            <div className="w-full md:w-1/3 border-r flex flex-col bg-card">
            <CardHeader className="p-4">
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('conversationListDesc')}</CardDescription>
            </CardHeader>
            <Separator />
            <ScrollArea className="flex-grow">
                <div className="p-2 space-y-1">
                {loadingChats ? (
                    [...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 p-3 rounded-md">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1 flex-grow">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                        </div>
                    ))
                ) : conversations.length > 0 ? (
                    conversations.map(conv => (
                    <Button
                        key={conv.id}
                        variant="ghost"
                        className={cn(
                        "w-full justify-start h-auto py-3 px-3 text-left rounded-md transition-colors relative", // Added relative positioning for badge
                        selectedConversationId === conv.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/50"
                        )}
                        onClick={() => setSelectedConversationId(conv.id)}
                        aria-current={selectedConversationId === conv.id ? "page" : undefined}
                    >
                        <Avatar className="h-10 w-10 mr-3 border">
                        <AvatarImage src={conv.participant.profilePicture} alt={conv.participant.name || 'User'} />
                        <AvatarFallback>{getInitials(conv.participant.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow overflow-hidden">
                        <p className="font-medium truncate">{conv.participant.name || t('unknownUser')}</p>
                        <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                        </div>
                        <div className="ml-auto pl-2 shrink-0 flex flex-col items-end space-y-1">
                            <span className="text-xs text-muted-foreground">
                                {conv.lastMessageTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                             {/* Unread Count Badge */}
                            {conv.unreadCount && conv.unreadCount > 0 && (
                                <Badge variant="destructive" className="h-5 px-1.5 text-xs">{conv.unreadCount}</Badge>
                            )}
                        </div>
                    </Button>
                    ))
                ) : (
                    <p className="p-4 text-center text-muted-foreground">{t('noChats')}</p>
                )}
                </div>
            </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="w-full md:w-2/3 flex flex-col bg-muted/10">
            {selectedConversation ? (
                <>
                {/* Chat Header */}
                <CardHeader className="p-4 border-b flex flex-row items-center justify-between space-x-3 bg-card">
                    <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={selectedConversation.participant.profilePicture} alt={selectedConversation.participant.name || t('unknownUser')} />
                        <AvatarFallback>{getInitials(selectedConversation.participant.name)}</AvatarFallback>
                    </Avatar>
                        <div>
                        <CardTitle className="text-lg">{selectedConversation.participant.name || t('unknownUser')}</CardTitle>
                         <CardDescription className={cn("text-xs", selectedConversation.participant.isOnline ? "text-green-600" : "text-muted-foreground")}>
                            {selectedConversation.participant.isOnline ? t('statusOnline') : t('statusOffline')}
                         </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                         {/* Mock Compatibility Score Display */}
                         {selectedConversation.participant.compatibilityScore !== undefined && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="secondary" className="flex items-center space-x-1 text-sm font-medium cursor-default">
                                        <HeartHandshake className="h-4 w-4 text-primary" />
                                        <span>{selectedConversation.participant.compatibilityScore}%</span>
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('compatibilityScoreTitle')}</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                         {/* Call Buttons */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={handleStartAudioCall} aria-label={t('startAudioCall')}>
                                    <Phone className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('startAudioCall')}</p>
                            </TooltipContent>
                         </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={handleStartVideoCall} aria-label={t('startVideoCall')}>
                                    <Video className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('startVideoCall')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </CardHeader>

                {/* Messages Area */}
                <ScrollArea className="flex-grow p-4 space-y-4 bg-muted/20" aria-live="polite">
                    {selectedConversation.messages.map((msg) => {
                    const intentionInfo = getIntentionTagInfo(msg.intentionTag);
                    const isCurrentUser = msg.senderId === CURRENT_USER_ID;
                    return (
                        <div
                            key={msg.id}
                            className={cn(
                            "flex items-end space-x-2 max-w-[85%]",
                            isCurrentUser ? "ml-auto justify-end" : "mr-auto justify-start"
                            )}
                        >
                            {!isCurrentUser && (
                            <Avatar className="h-8 w-8 border self-start mt-1 flex-shrink-0">
                                <AvatarImage src={selectedConversation.participant.profilePicture} alt={selectedConversation.participant.name || t('unknownUser')} />
                                <AvatarFallback>{getInitials(selectedConversation.participant.name)}</AvatarFallback>
                            </Avatar>
                            )}
                            <div
                            className={cn(
                                "rounded-lg px-3 py-2 shadow-sm relative group", // Added relative for tooltip positioning
                                isCurrentUser
                                ? "bg-primary text-primary-foreground rounded-br-none"
                                : "bg-card text-card-foreground border rounded-bl-none"
                            )}
                            >
                            {/* Display Intention Tag if present */}
                            {intentionInfo && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center text-xs opacity-80 mb-1 cursor-default" >
                                            {React.cloneElement(intentionInfo.icon, { className: "h-3 w-3 mr-1" })}
                                            <span>{intentionInfo.label}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" align={isCurrentUser ? "end" : "start"}>
                                         <p>{`${t('intentionTagTitle')}: ${intentionInfo.label}`}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            <p className="text-xs text-right opacity-70 mt-1">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {/* Optional: Add status indicator */}
                                {/* {isCurrentUser && msg.status && <Check className="inline-block h-3 w-3 ml-1 text-blue-400" />} */}
                            </p>
                             {/* Error Indicator */}
                            {msg.status === 'error' && (
                                 <Tooltip>
                                    <TooltipTrigger asChild>
                                        <AlertCircle className="absolute -left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                                    </TooltipTrigger>
                                     <TooltipContent side="left">
                                        <p>{t('messageFailedToSend')}</p>
                                     </TooltipContent>
                                </Tooltip>
                            )}
                            </div>
                            {isCurrentUser && (
                            <Avatar className="h-8 w-8 border self-start mt-1 flex-shrink-0">
                                {/* Current user avatar - fetch from profile or use placeholder */}
                                <AvatarImage src={currentUserProfile?.profilePicture || undefined} alt={CURRENT_USER_NAME} />
                                <AvatarFallback>{getInitials(CURRENT_USER_NAME)}</AvatarFallback>
                            </Avatar>
                            )}
                        </div>
                        );
                    })}
                    <div ref={messagesEndRef} /> {/* Element to scroll to */}
                </ScrollArea>

                {/* Message Input Area */}
                <CardFooter className="p-4 border-t bg-card space-y-2 flex-col items-start">
                    <div className="flex w-full items-center space-x-2">
                        <Input
                        type="text"
                        placeholder={t('sendMessagePlaceholder')}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={sendingMessage}
                        className="flex-grow"
                        aria-label={t('sendMessagePlaceholder')}
                        aria-busy={sendingMessage}
                        />
                        <Button aria-label={t('sendButton')} title={t('sendButton')} type="button" size="icon" onClick={handleSendMessage} disabled={sendingMessage || !newMessage.trim()}>
                        {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                    {/* Intention Tag Selector */}
                    <div className="flex items-center space-x-2 w-full">
                        <Label htmlFor="intention-select" className="text-xs text-muted-foreground whitespace-nowrap">{t('intentionTagLabel')}:</Label>
                        <Select value={selectedIntention} onValueChange={setSelectedIntention} disabled={sendingMessage}>
                            <SelectTrigger id="intention-select" className="h-8 text-xs flex-grow" aria-label={t('selectIntentionPlaceholder')}>
                            <SelectValue placeholder={t('selectIntentionPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="" className="text-xs">{t('noTagOption')}</SelectItem>
                            {intentionTags.map(tag => (
                                <SelectItem key={tag.value} value={tag.value} className="text-xs">
                                <div className="flex items-center">
                                    {tag.icon} {tag.label}
                                </div>
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardFooter>
                </>
            ) : (
                <div className="flex flex-grow items-center justify-center text-muted-foreground p-4 text-center">
                {loadingChats ? <Loader2 className="h-8 w-8 animate-spin" /> : <p>{t('selectChatPrompt')}</p> }
                </div>
            )}
            </div>
        </Card>
        </div>
    </TooltipProvider>
  );
}
```
  </change>
  <change>
    <file>src/messages/en.json</file>
    <description>Add English translations for new chat UI elements (call buttons, status, unread badge, errors).</description>
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
    "selectInterestsErrorDesc": "Please select at least one interest to schedule a session."
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

    