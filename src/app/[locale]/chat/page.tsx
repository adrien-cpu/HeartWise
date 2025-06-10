"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Send, HeartHandshake, Smile, Info, Heart, Video, Phone, AlertCircle, Bot, MessagesSquare, ShieldAlert, PhoneOff } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import AuthGuard from "@/components/auth-guard";
import { tagMessageIntent, IntentionTaggingOutput } from '@/ai/flows/intention-tagging';
import { moderateText, ModerationResult } from '@/services/moderation_service';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  sendMessage as sendChatMessage,
  getConversationsListener,
  getMessagesListener,
  markMessagesAsRead,
  type Message as ChatMessage,
  type Conversation as ChatConversation,
  type ConversationParticipant as ChatParticipant
} from '@/services/chat_service';
import { Timestamp, serverTimestamp } from 'firebase/firestore';
import { showNotification, requestNotificationPermission } from '@/lib/notifications';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { VideoCall } from '@/components/video-call';
import { WebRTCService } from '@/services/webrtc_service';

/**
 * @fileOverview Chat page component.
 * @module ChatPage
 * @description Displays the chat interface, allowing users to select conversations and send/receive messages.
 * Includes compatibility display, intention tagging, and video/audio call functionality.
 */

interface UserProfile {
  id: string;
  name: string;
  profilePicture?: string;
  dataAiHint?: string;
  bio?: string;
  interests?: string[];
}

interface ConversationParticipant extends UserProfile {
  compatibilityScore?: number;
  isOnline?: boolean;
}

type CallStatus = "idle" | "dialing" | "receiving" | "active" | "ended" | "error";

interface LocalMessage extends Omit<ChatMessage, 'timestamp'> {
  timestamp: Date;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  reactions?: Array<{
    emoji: string;
    userId: string;
    userName: string;
  }>;
  attachments?: Array<{
    url: string;
    type: 'image' | 'file' | 'audio' | 'video';
    name: string;
    size: number;
  }>;
  isEphemeral?: boolean;
  expiresAt?: Date;
}

interface LocalConversation {
  id: string;
  participants: string[];
  participant: ConversationParticipant;
  lastMessage: LocalMessage;
  unreadCount: number;
  updatedAt: Date;
  lastMessageTimestamp?: Date;
}

// Available intention tags for manual selection
const manualIntentionTags = [
  { value: 'friendly', label: 'Friendly', icon: <Smile className="h-4 w-4 mr-2" /> },
  { value: 'humor', label: 'Humor', icon: <Smile className="h-4 w-4 mr-2" /> },
  { value: 'serious', label: 'Serious', icon: <Info className="h-4 w-4 mr-2" /> },
  { value: 'tender', label: 'Tender', icon: <HeartHandshake className="h-4 w-4 mr-2" /> },
  { value: 'seduction', label: 'Flirt', icon: <Heart className="h-4 w-4 mr-2" /> },
];

const REACTION_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🙏'];

const ChatPage = (): JSX.Element => {
  const t = useTranslations("Chat");
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  // State
  const [conversations, setConversations] = useState<LocalConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<LocalConversation | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isAnalyzingIntent, setIsAnalyzingIntent] = useState(false);
  const [selectedIntention, setSelectedIntention] = useState<string>("");
  const [aiSuggestedTag, setAiSuggestedTag] = useState<IntentionTaggingOutput | null>(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [currentMessages, setCurrentMessages] = useState<LocalMessage[]>([]);
  const [otherParticipant, setOtherParticipant] = useState<ConversationParticipant | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [callTarget, setCallTarget] = useState<string | null>(null);
  const [showCallDialog, setShowCallDialog] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationsUnsubscribeRef = useRef<(() => void) | null>(null);
  const messagesUnsubscribeRef = useRef<(() => void) | null>(null);

  // Request notification permission on component mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Scroll to bottom of messages when they change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  // Set up conversation listener when user is authenticated
  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) return;

    setLoadingChats(true);
    
    const unsubscribe = getConversationsListener(currentUser.uid, (conversationsData) => {
      const localConversations: LocalConversation[] = conversationsData.map(conv => {
        // Find the other participant (not the current user)
        const otherParticipantId = conv.participantIds.find(id => id !== currentUser.uid);
        if (!otherParticipantId) return null; // Skip if no other participant found
        
        const participantDetails = conv.participants[otherParticipantId];
        if (!participantDetails) return null; // Skip if participant details not found
        
        // Convert Firestore timestamp to Date
        const lastMessageTimestamp = conv.lastMessageTimestamp instanceof Timestamp 
          ? conv.lastMessageTimestamp.toDate() 
          : undefined;
        
        const updatedAt = conv.updatedAt instanceof Timestamp 
          ? conv.updatedAt.toDate() 
          : new Date();
        
        // Get unread count for current user
        const unreadCount = conv.unreadCounts?.[currentUser.uid] || 0;
        
        // Create local conversation object
        return {
          id: conv.id,
          participants: conv.participantIds,
          participant: {
            id: otherParticipantId,
            name: participantDetails.name || 'Unknown User',
            profilePicture: participantDetails.profilePicture,
            dataAiHint: participantDetails.dataAiHint,
            interests: participantDetails.interests,
            compatibilityScore: Math.floor(Math.random() * 40) + 60, // Simulated compatibility score
            isOnline: Math.random() > 0.5 // Simulated online status
          },
          lastMessage: {
            id: 'last-msg-' + conv.id,
            text: conv.lastMessageText || 'New conversation',
            senderId: conv.lastMessageSenderId || '',
            senderName: conv.lastMessageSenderId === currentUser.uid 
              ? 'You' 
              : participantDetails.name || 'Unknown User',
            timestamp: lastMessageTimestamp || updatedAt,
            status: 'delivered'
          },
          unreadCount,
          updatedAt,
          lastMessageTimestamp
        };
      }).filter(Boolean) as LocalConversation[];
      
      // Sort conversations by last message timestamp (newest first)
      localConversations.sort((a, b) => {
        const timeA = a.lastMessageTimestamp?.getTime() || a.updatedAt.getTime();
        const timeB = b.lastMessageTimestamp?.getTime() || b.updatedAt.getTime();
        return timeB - timeA;
      });
      
      setConversations(localConversations);
      setLoadingChats(false);
      
      // If a conversation was selected, update its data
      if (selectedConversationId) {
        const updatedSelectedConversation = localConversations.find(c => c.id === selectedConversationId);
        if (updatedSelectedConversation) {
          setSelectedConversation(updatedSelectedConversation);
          setOtherParticipant(updatedSelectedConversation.participant);
        }
      }
    });
    
    conversationsUnsubscribeRef.current = unsubscribe;
    
    return () => {
      if (conversationsUnsubscribeRef.current) {
        conversationsUnsubscribeRef.current();
      }
    };
  }, [currentUser, authLoading]);

  // Set up message listener when a conversation is selected
  useEffect(() => {
    if (!currentUser || !selectedConversationId) return;
    
    setLoadingMessages(true);
    
    // Clean up previous listener if exists
    if (messagesUnsubscribeRef.current) {
      messagesUnsubscribeRef.current();
      messagesUnsubscribeRef.current = null;
    }
    
    const unsubscribe = getMessagesListener(selectedConversationId, currentUser.uid, (messagesData) => {
      const localMessages: LocalMessage[] = messagesData.map(msg => {
        // Convert Firestore timestamp to Date
        const timestamp = msg.timestamp instanceof Timestamp 
          ? msg.timestamp.toDate() 
          : new Date();
        
        // Convert expiresAt if it exists
        const expiresAt = msg.expiresAt instanceof Timestamp 
          ? msg.expiresAt.toDate() 
          : undefined;
        
        return {
          ...msg,
          timestamp,
          expiresAt
        };
      });
      
      // Sort messages by timestamp (oldest first)
      localMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      setCurrentMessages(localMessages);
      setLoadingMessages(false);
      
      // Mark messages as read
      markMessagesAsRead(selectedConversationId, currentUser.uid);
      
      // Show notification for new messages
      const lastMessage = localMessages[localMessages.length - 1];
      if (lastMessage && lastMessage.senderId !== currentUser.uid && document.hidden) {
        showNotification(
          t('newNotificationMessageTitle', { name: lastMessage.senderName }),
          { body: lastMessage.text }
        );
      }
    });
    
    messagesUnsubscribeRef.current = unsubscribe;
    
    return () => {
      if (messagesUnsubscribeRef.current) {
        messagesUnsubscribeRef.current();
        messagesUnsubscribeRef.current = null;
      }
    };
  }, [currentUser, selectedConversationId, t]);

  // Simulate partner typing
  useEffect(() => {
    if (message && selectedConversation) {
      // Randomly decide if partner should be shown as typing
      const shouldShowTyping = Math.random() > 0.7;
      
      if (shouldShowTyping) {
        const typingTimeout = setTimeout(() => {
          setIsPartnerTyping(true);
          
          // Stop "typing" after a random interval
          const stopTypingTimeout = setTimeout(() => {
            setIsPartnerTyping(false);
          }, 2000 + Math.random() * 3000);
          
          return () => clearTimeout(stopTypingTimeout);
        }, 1000);
        
        return () => clearTimeout(typingTimeout);
      }
    } else {
      setIsPartnerTyping(false);
    }
  }, [message, selectedConversation]);

  // Check for expired ephemeral messages
  useEffect(() => {
    const checkEphemeralMessages = () => {
      const now = new Date();
      const updatedMessages = currentMessages.filter(message => {
        if (message.isEphemeral && message.expiresAt) {
          return message.expiresAt > now;
        }
        return true;
      });

      if (updatedMessages.length !== currentMessages.length) {
        setCurrentMessages(updatedMessages);
      }
    };

    const interval = setInterval(checkEphemeralMessages, 1000);
    return () => clearInterval(interval);
  }, [currentMessages]);

  // Analyze message intent when typing
  useEffect(() => {
    const analyzeMessageIntent = async () => {
      if (!message || message.length < 5) {
        setAiSuggestedTag(null);
        return;
      }
      
      // Debounce the analysis to avoid too many API calls
      const debounceTimeout = setTimeout(async () => {
        setIsAnalyzingIntent(true);
        
        try {
          const result = await tagMessageIntent({
            message,
            conversationContext: currentMessages.slice(-3).map(m => `${m.senderName}: ${m.text}`).join('\n')
          });
          
          setAiSuggestedTag(result);
        } catch (error) {
          console.error('Error analyzing message intent:', error);
        } finally {
          setIsAnalyzingIntent(false);
        }
      }, 1000);
      
      return () => clearTimeout(debounceTimeout);
    };
    
    analyzeMessageIntent();
  }, [message, currentMessages]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser || !selectedConversationId) return;

    try {
      setSendingMessage(true);
      
      // Moderate the message content
      const moderationResult = await moderateText(message);
      
      if (!moderationResult.isSafe) {
        toast({
          variant: "destructive",
          title: t('moderationBlockTitle'),
          description: t('moderationBlockDesc') + moderationResult.issues?.map(issue => 
            t(`moderationCategory_${issue.category}`, { defaultValue: issue.category })
          ).join(', '),
          duration: 5000,
        });
        return;
      }
      
      // Prepare message data
      const messageData: Omit<ChatMessage, 'id' | 'timestamp'> = {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Me',
        text: message,
        status: 'sent',
        intentionTag: selectedIntention || aiSuggestedTag?.detectedIntention || undefined
      };
      
      // Send the message
      await sendChatMessage(selectedConversationId, messageData);
      
      // Clear the input and reset states
      setMessage("");
      setSelectedIntention("");
      setAiSuggestedTag(null);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('errorSendingMessage'),
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStartVideoCall = () => {
    if (!selectedConversation) return;
    setShowCallDialog(true);
  };

  const handleStartCall = () => {
    if (!selectedConversation) return;
    setCallTarget(selectedConversation.participant.id);
    setIsInCall(true);
    setShowCallDialog(false);
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setCallTarget(null);
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setSelectedConversation(conversation);
      setOtherParticipant(conversation.participant);
    }
  };

  const getInitials = (name?: string): string => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAiIntentionTagIcon = (tag: string) => {
    const tagInfo = manualIntentionTags.find(t => t.value === tag);
    return tagInfo?.icon || <Smile className="h-4 w-4 mr-2" />;
  };

  if (authLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[calc(100vh-150px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthGuard>
      <TooltipProvider>
        <div className="container mx-auto h-[calc(100vh-80px)] flex flex-col p-0 md:p-4">
          <Card className="flex flex-grow overflow-hidden h-full shadow-lg rounded-lg border">
            {/* Conversation List */}
            <div className="w-full md:w-1/3 border-r flex flex-col bg-card">
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2">
                  <MessagesSquare className="h-6 w-6 text-primary" />
                  {t('title')}
                </CardTitle>
                <CardDescription>{t('conversationListDesc')}</CardDescription>
              </CardHeader>
              
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
                        onClick={() => handleSelectConversation(conv.id)}
                      >
                        <Avatar className="h-10 w-10 mr-3 border" data-ai-hint={conv.participant.dataAiHint || "person"}>
                          <AvatarImage src={conv.participant.profilePicture} alt={conv.participant.name} />
                          <AvatarFallback>{getInitials(conv.participant.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow overflow-hidden">
                          <p className="font-medium truncate">{conv.participant.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{conv.lastMessage?.text}</p>
                        </div>
                        <div className="ml-auto pl-2 shrink-0 flex flex-col items-end space-y-1">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(conv.lastMessageTimestamp || conv.updatedAt)}
                          </span>
                          {conv.unreadCount > 0 && (
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
              {selectedConversation && otherParticipant ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="p-4 border-b flex flex-row items-center justify-between space-x-3 bg-card">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 border" data-ai-hint={otherParticipant.dataAiHint || "person"}>
                        <AvatarImage src={otherParticipant.profilePicture} alt={otherParticipant.name || t('unknownUser')} />
                        <AvatarFallback>{getInitials(otherParticipant.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{otherParticipant.name || t('unknownUser')}</CardTitle>
                        <CardDescription className={cn("text-xs", otherParticipant.isOnline ? "text-green-600" : "text-muted-foreground")}>
                          {otherParticipant.isOnline ? t('statusOnline') : t('statusOffline')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {otherParticipant.compatibilityScore !== undefined && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="secondary" className="flex items-center space-x-1 text-sm font-medium cursor-default">
                              <HeartHandshake className="h-4 w-4 text-primary" />
                              <span>{otherParticipant.compatibilityScore}%</span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('compatibilityScoreTitle')}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={handleStartVideoCall} aria-label={t('startVideoCall')}>
                            <Video className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{t('startVideoCall')}</p></TooltipContent>
                      </Tooltip>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <ScrollArea className="flex-grow p-4 space-y-4 bg-muted/20" aria-live="polite">
                    {loadingMessages ? (
                      <div className="flex items-center space-x-2 mr-auto justify-start max-w-[85%]">
                        <Avatar className="h-8 w-8 border self-start mt-1 flex-shrink-0 opacity-0">
                          <AvatarFallback>?</AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg px-3 py-2 bg-card text-card-foreground border rounded-bl-none shadow-sm">
                          <div className="flex space-x-1 animate-pulse">
                            <span className="h-2 w-2 bg-muted-foreground rounded-full"></span>
                            <span className="h-2 w-2 bg-muted-foreground rounded-full animation-delay-150"></span>
                            <span className="h-2 w-2 bg-muted-foreground rounded-full animation-delay-300"></span>
                          </div>
                        </div>
                      </div>
                    ) : currentMessages.length > 0 ? (
                      currentMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex items-end space-x-2 max-w-[85%]",
                            msg.senderId === currentUser?.uid ? "ml-auto justify-end" : "mr-auto justify-start"
                          )}
                        >
                          {msg.senderId !== currentUser?.uid && (
                            <Avatar className="h-8 w-8 border self-start mt-1 flex-shrink-0" data-ai-hint={otherParticipant?.dataAiHint || "person"}>
                              <AvatarImage src={otherParticipant.profilePicture} alt={otherParticipant?.name || t('unknownUser')} />
                              <AvatarFallback>{getInitials(otherParticipant.name || t('unknownUser'))}</AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={cn(
                              "rounded-lg px-3 py-2 shadow-sm text-sm",
                              msg.senderId === currentUser?.uid
                                ? "bg-primary text-primary-foreground rounded-br-none"
                                : "bg-card text-card-foreground border rounded-bl-none"
                            )}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            {msg.intentionTag && (
                              <div className="mt-1 flex items-center gap-1">
                                {getAiIntentionTagIcon(msg.intentionTag)}
                                <span className="text-xs opacity-70">{msg.intentionTag}</span>
                              </div>
                            )}
                            <p className="text-xs text-right opacity-70 mt-1">
                              {formatTimestamp(msg.timestamp)}
                            </p>
                          </div>
                          {msg.senderId === currentUser?.uid && (
                            <Avatar className="h-8 w-8 border self-start mt-1 flex-shrink-0">
                              <AvatarImage src={currentUser.photoURL || undefined} alt="You" />
                              <AvatarFallback>{getInitials(currentUser.displayName || "You")}</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground">{t('noMessagesYet')}</p>
                    )}
                    {isPartnerTyping && (
                      <div className="flex items-center space-x-2 mr-auto justify-start max-w-[85%]">
                        <Avatar className="h-8 w-8 border self-start mt-1 flex-shrink-0" data-ai-hint={otherParticipant?.dataAiHint || "person"}>
                          <AvatarImage src={otherParticipant?.profilePicture} alt={otherParticipant?.name || t('unknownUser')} />
                          <AvatarFallback>{getInitials(otherParticipant?.name || t('unknownUser'))}</AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg px-3 py-2 bg-card text-card-foreground border rounded-bl-none shadow-sm">
                          <div className="flex space-x-1 items-center">
                            <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></span>
                            <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse animation-delay-150"></span>
                            <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse animation-delay-300"></span>
                            <span className="text-xs text-muted-foreground ml-1">{t('typingIndicator')}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </ScrollArea>

                  {/* Message Input */}
                  <CardFooter className="p-4 border-t bg-card space-y-2 flex-col items-start">
                    <div className="flex w-full items-center space-x-2">
                      <div className="flex-grow relative">
                        <Input
                          type="text"
                          placeholder={t('sendMessagePlaceholder')}
                          value={message}
                          onChange={handleMessageChange}
                          onKeyPress={handleKeyPress}
                          disabled={sendingMessage}
                          className="flex-grow pr-20"
                          aria-label={t('sendMessagePlaceholder')}
                          aria-busy={sendingMessage}
                        />
                        {isAnalyzingIntent && (
                          <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {!isAnalyzingIntent && aiSuggestedTag && aiSuggestedTag.detectedIntention && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge 
                                variant="outline" 
                                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center cursor-pointer text-xs" 
                                onClick={() => setSelectedIntention(aiSuggestedTag.detectedIntention)}
                              >
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
                      <Button
                        aria-label={t('sendButton')}
                        title={t('sendButton')}
                        type="button"
                        size="icon"
                        onClick={handleSendMessage}
                        disabled={sendingMessage || !message.trim()}
                      >
                        {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2 w-full">
                      <Label htmlFor="intention-select" className="text-xs text-muted-foreground whitespace-nowrap">
                        {t('intentionTagLabel')}:
                      </Label>
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
                  <p>{t('selectChatPrompt')}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Video Call Dialog */}
        <AlertDialog open={showCallDialog} onOpenChange={setShowCallDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('videoAudioCallInfoTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('videoAudioCallInfoDesc')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('gotItButton')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleStartCall}>
                {t('startVideoCall')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Video Call Component */}
        {isInCall && callTarget && currentUser && (
          <VideoCall
            userId={currentUser.uid}
            targetUserId={callTarget}
            onCallEnd={handleEndCall}
          />
        )}
      </TooltipProvider>
    </AuthGuard>
  );
};

export default ChatPage;