"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Send, User, HeartHandshake, Smile, Info, Heart, Video, Phone, AlertCircle, Bot } from 'lucide-react'; // Added Bot icon
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { UserProfile, get_user } from '@/services/user_profile'; // Import user profile service
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; 
import { Badge } from "@/components/ui/badge"; 
import { tagMessageIntent, IntentionTaggingOutput } from '@/ai/flows/intention-tagging'; // Import Genkit flow

/**
 * @fileOverview Chat page component.
 * @module ChatPage
 * @description Displays the chat interface, allowing users to select conversations and send/receive messages. Includes mock compatibility display, manual intention tag selection, and AI-suggested intention tagging. Simulates video/audio call initiation.
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
    dataAiHint: 'man portrait',
    bio: 'Loves cooking and travel.',
    interests: ['Cooking', 'Travel'],
    compatibilityScore: 75,
    isOnline: true,
  },
  'user3': {
    id: 'user3',
    name: 'Charlie',
    profilePicture: 'https://picsum.photos/seed/charlie/50/50',
    dataAiHint: 'woman portrait',
    bio: 'Tech enthusiast and bookworm.',
    interests: ['Tech', 'Books'],
    compatibilityScore: 60,
    isOnline: false,
  },
  'user4': {
    id: 'user4',
    name: 'Diana',
    profilePicture: 'https://picsum.photos/seed/diana/50/50',
    dataAiHint: 'person smiling',
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
      { id: 'm2', senderId: 'user1', senderName: CURRENT_USER_NAME, text: "Hi Bob! I'm good, thanks. You?", timestamp: new Date(Date.now() - 4 * 60 * 1000), intentionTag: 'friendly', status: 'delivered' },
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

// Available intention tags for manual selection
const manualIntentionTags = [
  { value: 'friendly', label: 'Friendly', icon: <Smile className="h-4 w-4 mr-2"/> },
  { value: 'humor', label: 'Humor', icon: <Smile className="h-4 w-4 mr-2"/> },
  { value: 'serious', label: 'Serious', icon: <Info className="h-4 w-4 mr-2"/> },
  { value: 'flirt', label: 'Flirt', icon: <Heart className="h-4 w-4 mr-2"/> }, 
  { value: 'tender', label: 'Tender', icon: <HeartHandshake className="h-4 w-4 mr-2"/> },
];

/**
 * ChatPage component.
 *
 * @component
 * @description Displays the chat interface, allowing users to select conversations, send/receive messages, manually select intention tags, and view AI-suggested intentions.
 *              **Requires Backend:** Real-time messaging (WebSockets), persistent message storage (Database), actual call functionality (WebRTC - e.g., Twilio, Agora).
 * @returns {JSX.Element} The rendered Chat page.
 */
export default function ChatPage() {
  const t = useTranslations('Chat');
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedIntention, setSelectedIntention] = useState<string>(''); 
  const [loadingChats, setLoadingChats] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

  // AI Intention Tagging State
  const [aiSuggestedTag, setAiSuggestedTag] = useState<IntentionTaggingOutput | null>(null);
  const [isAnalyzingIntent, setIsAnalyzingIntent] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    setLoadingChats(true); 
    get_user(CURRENT_USER_ID)
      .then(profile => setCurrentUserProfile(profile))
      .catch(err => {
         console.error("Failed to fetch current user profile:", err);
         toast({ variant: 'destructive', title: t('errorLoadingProfile') })
        })
      .finally(() => setLoadingChats(false)); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]); 


  useEffect(() => {
    const loadChats = async () => {
      setLoadingChats(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
          const sortedConversations = [...initialConversations].sort((a,b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime());
          setConversations(sortedConversations);
          if (sortedConversations.length > 0 && !selectedConversationId) {
            setSelectedConversationId(sortedConversations[0].id); 
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
  }, [toast]); 

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedConversationId, conversations]); 

  // Debounced AI intention analysis
  const analyzeIntent = useCallback(async (message: string, context: string) => {
    if (!message.trim()) {
      setAiSuggestedTag(null);
      return;
    }
    setIsAnalyzingIntent(true);
    try {
      const result = await tagMessageIntent({ message, conversationContext: context });
      setAiSuggestedTag(result);
    } catch (error) {
      console.error("Error analyzing message intent:", error);
      setAiSuggestedTag(null); // Clear on error
      // Optionally, show a subtle toast or error indicator
    } finally {
      setIsAnalyzingIntent(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (newMessage.trim()) {
      const currentConversationHistory = selectedConversation?.messages.slice(-5).map(m => `${m.senderName}: ${m.text}`).join('\n') || '';
      debounceTimeoutRef.current = setTimeout(() => {
        analyzeIntent(newMessage, currentConversationHistory);
      }, 750); // 750ms debounce
    } else {
      setAiSuggestedTag(null); // Clear suggestion if input is empty
      setIsAnalyzingIntent(false);
    }
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [newMessage, analyzeIntent, selectedConversation]);


  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId || !selectedConversation) return;

    const tempId = `msg-${Date.now()}`; 
    setSendingMessage(true);
    const messageToSend: Message = {
      id: tempId,
      senderId: CURRENT_USER_ID,
      senderName: CURRENT_USER_NAME,
      text: newMessage.trim(),
      timestamp: new Date(),
      intentionTag: selectedIntention || aiSuggestedTag?.detectedIntention || undefined, // Prioritize manual, then AI, then none
      status: 'sent', 
    };

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
        ).sort((a,b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime()) 
      );
      setNewMessage('');
      setSelectedIntention(''); 
      setAiSuggestedTag(null); // Clear AI suggestion after sending
       requestAnimationFrame(() => {
         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
       });


    try {
      await new Promise(resolve => setTimeout(resolve, 700)); 
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        variant: 'destructive',
        title: t('errorSendingMessage'),
      });
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); 
      handleSendMessage();
    }
  };

  const getInitials = (name?: string): string => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getManualIntentionTagInfo = (tagValue?: string) => {
      return manualIntentionTags.find(tag => tag.value === tagValue);
  };
  
  const getAiIntentionTagIcon = (tagValue?: string) => {
    const manualTag = manualIntentionTags.find(tag => tag.value === tagValue);
    return manualTag ? manualTag.icon : <Bot className="h-3 w-3 mr-1"/>;
  };


  const handleStartVideoCall = () => {
      if (!selectedConversation) return;
      console.log(`Initiating video call with ${selectedConversation.participant.name}`);
      toast({ title: t('videoCallTitle'), description: t('videoCallDesc', { name: selectedConversation.participant.name }) });
  };
  const handleStartAudioCall = () => {
      if (!selectedConversation) return;
      console.log(`Initiating audio call with ${selectedConversation.participant.name}`);
      toast({ title: t('audioCallTitle'), description: t('audioCallDesc', { name: selectedConversation.participant.name }) });
  };


  return (
    <TooltipProvider> 
        <div className="container mx-auto h-[calc(100vh-80px)] flex flex-col p-0 md:p-4"> 
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
                        "w-full justify-start h-auto py-3 px-3 text-left rounded-md transition-colors relative", 
                        selectedConversationId === conv.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/50"
                        )}
                        onClick={() => setSelectedConversationId(conv.id)}
                        aria-current={selectedConversationId === conv.id ? "page" : undefined}
                    >
                        <Avatar className="h-10 w-10 mr-3 border">
                        <AvatarImage src={conv.participant.profilePicture} alt={conv.participant.name || 'User'} data-ai-hint={conv.participant.dataAiHint || "person"} />
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
                        <AvatarImage src={selectedConversation.participant.profilePicture} alt={selectedConversation.participant.name || t('unknownUser')} data-ai-hint={selectedConversation.participant.dataAiHint || "person"}/>
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
                    const intentionInfo = getManualIntentionTagInfo(msg.intentionTag);
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
                                <AvatarImage src={selectedConversation.participant.profilePicture} alt={selectedConversation.participant.name || t('unknownUser')} data-ai-hint={selectedConversation.participant.dataAiHint || "person"}/>
                                <AvatarFallback>{getInitials(selectedConversation.participant.name)}</AvatarFallback>
                            </Avatar>
                            )}
                            <div
                            className={cn(
                                "rounded-lg px-3 py-2 shadow-sm relative group", 
                                isCurrentUser
                                ? "bg-primary text-primary-foreground rounded-br-none"
                                : "bg-card text-card-foreground border rounded-bl-none"
                            )}
                            >
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
                            </p>
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
                                <AvatarImage src={currentUserProfile?.profilePicture || undefined} alt={CURRENT_USER_NAME} data-ai-hint={currentUserProfile?.dataAiHint || "person"}/>
                                <AvatarFallback>{getInitials(CURRENT_USER_NAME)}</AvatarFallback>
                            </Avatar>
                            )}
                        </div>
                        );
                    })}
                    <div ref={messagesEndRef} /> 
                </ScrollArea>

                {/* Message Input Area */}
                <CardFooter className="p-4 border-t bg-card space-y-2 flex-col items-start">
                    <div className="flex w-full items-center space-x-2">
                        <div className="flex-grow relative">
                            <Input
                            type="text"
                            placeholder={t('sendMessagePlaceholder')}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={sendingMessage}
                            className="flex-grow pr-20" // Add padding for AI tag
                            aria-label={t('sendMessagePlaceholder')}
                            aria-busy={sendingMessage}
                            />
                             {isAnalyzingIntent && (
                                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                            {!isAnalyzingIntent && aiSuggestedTag && aiSuggestedTag.detectedIntention && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge variant="outline" className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center cursor-pointer text-xs" onClick={() => setSelectedIntention(aiSuggestedTag.detectedIntention)}>
                                            {getAiIntentionTagIcon(aiSuggestedTag.detectedIntention)}
                                            {aiSuggestedTag.detectedIntention} ({(aiSuggestedTag.confidenceScore * 100).toFixed(0)}%)
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t('aiSuggestedTagTooltip')}: {aiSuggestedTag.explanation || aiSuggestedTag.detectedIntention}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                        <Button aria-label={t('sendButton')} title={t('sendButton')} type="button" size="icon" onClick={handleSendMessage} disabled={sendingMessage || !newMessage.trim()}>
                        {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                    <div className="flex items-center space-x-2 w-full">
                        <Label htmlFor="intention-select" className="text-xs text-muted-foreground whitespace-nowrap">{t('intentionTagLabel')}:</Label>
                        <Select value={selectedIntention} onValueChange={setSelectedIntention} disabled={sendingMessage}>
                            <SelectTrigger id="intention-select" className="h-8 text-xs flex-grow" aria-label={t('selectIntentionPlaceholder')}>
                            <SelectValue placeholder={t('selectIntentionPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="" className="text-xs">{t('noTagOption')}</SelectItem>
                            {manualIntentionTags.map(tag => (
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
