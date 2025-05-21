"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Send, HeartHandshake, Smile, Info, Heart, Video, Phone, AlertCircle, Bot, MessagesSquare, ShieldAlert, UserX } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { tagMessageIntent, IntentionTaggingOutput } from '@/ai/flows/intention-tagging'; 
import { moderateText, ModerationResult } from '@/services/moderation_service';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Message, 
  Conversation, 
  ConversationParticipant,
  sendMessage as sendChatMessage,
  getConversationsListener,
  getMessagesListener,
  createConversation as createNewConversation
} from '@/services/chat_service';
import type { UserProfile } from '@/services/user_profile';
import { Timestamp } from 'firebase/firestore';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * @fileOverview Chat page component with real-time Firestore integration.
 * @module ChatPage
 * @description Displays the chat interface, allowing users to select conversations and send/receive messages.
 *              Features AI-suggested intention tagging and content moderation.
 *              Requires Firebase for backend. Video/Audio call buttons are placeholders.
 */

const manualIntentionTags = [
  { value: 'friendly', label: 'Friendly', icon: <Smile className="h-4 w-4 mr-2"/> },
  { value: 'humor', label: 'Humor', icon: <Smile className="h-4 w-4 mr-2"/> },
  { value: 'serious', label: 'Serious', icon: <Info className="h-4 w-4 mr-2"/> },
  { value: 'flirt', label: 'Flirt', icon: <Heart className="h-4 w-4 mr-2"/> },
  { value: 'tender', label: 'Tender', icon: <HeartHandshake className="h-4 w-4 mr-2"/> },
];

export default function ChatPage() {
  const t = useTranslations('Chat');
  const tGlobal = useTranslations('Home'); // For common terms like "unknownUser"
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedIntention, setSelectedIntention] = useState<string>('');
  
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  const [aiSuggestedTag, setAiSuggestedTag] = useState<IntentionTaggingOutput | null>(null);
  const [isAnalyzingIntent, setIsAnalyzingIntent] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isPartnerTyping, setIsPartnerTyping] = useState(false); 
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showCallFeatureInfo, setShowCallFeatureInfo] = useState(false);

  useEffect(() => {
    requestNotificationPermission(); 
  }, []);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [authLoading, currentUser, router]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      setLoadingConversations(false);
      return;
    }

    setLoadingConversations(true);
    const unsubscribe = getConversationsListener(currentUser.uid, (loadedConversations) => {
      setConversations(loadedConversations);
      if (loadedConversations.length > 0 && !selectedConversationId) {
        setSelectedConversationId(loadedConversations[0].id);
      } else if (loadedConversations.length === 0) {
        setSelectedConversationId(null); // No conversations, clear selection
      }
      setLoadingConversations(false);
    });

    return () => unsubscribe();
  }, [currentUser, selectedConversationId]); // Keep selectedConversationId to potentially re-select if list changes

  useEffect(() => {
    if (!selectedConversationId) {
      setCurrentMessages([]);
      return;
    }

    setLoadingMessages(true);
    const unsubscribe = getMessagesListener(selectedConversationId, (loadedMessages) => {
      const oldMessagesCount = currentMessages.length;
      setCurrentMessages(loadedMessages);
      
      if (loadedMessages.length > oldMessagesCount && currentUser) {
        const lastMessage = loadedMessages[loadedMessages.length - 1];
        if (lastMessage.senderId !== currentUser.uid && document.hidden) {
          showNotification(t('newNotificationMessageTitle', { name: lastMessage.senderName || tGlobal('unknownUser') }), {
            body: lastMessage.text.substring(0, 100) + (lastMessage.text.length > 100 ? '...' : ''),
            icon: '/logo.png' 
          });
        }
      }
      setLoadingMessages(false);
       requestAnimationFrame(() => {
         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
       });
    });
    
    return () => unsubscribe();
  }, [selectedConversationId, currentUser, t, currentMessages.length, tGlobal]);

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100); 
    return () => clearTimeout(timer);
  }, [currentMessages]);


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
      setAiSuggestedTag(null); 
    } finally {
      setIsAnalyzingIntent(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (newMessage.trim()) {
      const currentConversationHistory = currentMessages.slice(-5).map(m => `${m.senderName}: ${m.text}`).join('\n') || '';
      debounceTimeoutRef.current = setTimeout(() => {
        analyzeIntent(newMessage, currentConversationHistory);
      }, 750); 
    } else {
      setAiSuggestedTag(null); 
      setIsAnalyzingIntent(false);
    }
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [newMessage, analyzeIntent, currentMessages]);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const otherParticipant = selectedConversation && currentUser ? 
    Object.values(selectedConversation.participants).find(p => p.id !== currentUser.uid)
    : null;


  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId || !currentUser || !currentUser.displayName || !selectedConversation) return;

    setSendingMessage(true);

    const moderationResult: ModerationResult = await moderateText(newMessage.trim());
    if (!moderationResult.isSafe) {
      toast({
        variant: 'destructive',
        title: t('moderationBlockTitle'),
        description: `${t('moderationBlockDesc')} ${moderationResult.issues?.map(issue => t(`moderationCategory_${issue.category}`, {}, {fallback: issue.category})).join(', ')}`,
        duration: 7000,
      });
      setSendingMessage(false);
      return;
    }

    const messageData: Omit<Message, 'id' | 'timestamp'> = {
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      text: newMessage.trim(),
      intentionTag: selectedIntention || aiSuggestedTag?.detectedIntention || undefined,
      status: 'sent',
    };

    try {
      await sendChatMessage(selectedConversationId, messageData);
      setNewMessage('');
      setSelectedIntention('');
      setAiSuggestedTag(null);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({ variant: 'destructive', title: t('errorSendingMessage') });
    } finally {
      setSendingMessage(false);
    }
  };
  
  const simulatePartnerResponse = useCallback(async (convId: string, userMessageText: string) => {
    if (!selectedConversation || !otherParticipant) return;

    setIsPartnerTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
    setIsPartnerTyping(false);

    const partnerMessageData: Omit<Message, 'id' | 'timestamp'> = {
      senderId: otherParticipant.id,
      senderName: otherParticipant.name || tGlobal('unknownUser'),
      text: `Reply to: "${userMessageText.substring(0, 15)}..." (simulated)`,
      status: 'delivered',
    };
    console.log("Simulated partner response would be sent for:", partnerMessageData);
  }, [selectedConversation, otherParticipant, tGlobal]);


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

  const handleCallFeatureClick = () => {
    setShowCallFeatureInfo(true);
  };


  if (authLoading) {
    return (
      <div className="container mx-auto h-[calc(100vh-80px)] flex items-center justify-center p-0 md:p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto h-[calc(100vh-80px)] flex items-center justify-center p-0 md:p-4">
          <p>{t('redirectingToLogin')}</p> <Loader2 className="h-8 w-8 animate-spin text-primary ml-2"/>
      </div>
    );
  }


  return (
    <TooltipProvider>
        <div className="container mx-auto h-[calc(100vh-80px)] flex flex-col p-0 md:p-4">
        <Card className="flex flex-grow overflow-hidden h-full shadow-lg rounded-lg border">
            <div className="w-full md:w-1/3 border-r flex flex-col bg-card">
            <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2"><MessagesSquare className="h-6 w-6 text-primary"/>{t('title')}</CardTitle>
                <CardDescription>{t('conversationListDesc')}</CardDescription>
            </CardHeader>
            <Separator />
            <ScrollArea className="flex-grow">
                <div className="p-2 space-y-1">
                {loadingConversations ? (
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
                    conversations.map(conv => {
                      const participantDetail = conv.participants && currentUser ? Object.values(conv.participants).find(p => p.id !== currentUser.uid) : null;
                      const displayName = participantDetail?.name || tGlobal('unknownUser');
                      const displayPicture = participantDetail?.profilePicture;
                      const dataAiHint = participantDetail?.dataAiHint || "person";

                      return (
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
                            <AvatarImage src={displayPicture} alt={displayName} data-ai-hint={dataAiHint} />
                            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow overflow-hidden">
                            <p className="font-medium truncate">{displayName}</p>
                            <p className="text-xs text-muted-foreground truncate">{conv.lastMessageText || t('noMessagesYet')}</p>
                            </div>
                            <div className="ml-auto pl-2 shrink-0 flex flex-col items-end space-y-1">
                                <span className="text-xs text-muted-foreground">
                                    {conv.lastMessageTimestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}
                                </span>
                                {conv.unreadCounts && conv.unreadCounts[currentUser.uid] > 0 && (
                                    <Badge variant="destructive" className="h-5 px-1.5 text-xs">{conv.unreadCounts[currentUser.uid]}</Badge>
                                )}
                            </div>
                        </Button>
                      );
                    })
                ) : (
                    <p className="p-4 text-center text-muted-foreground">{t('noChats')}</p>
                )}
                </div>
            </ScrollArea>
            </div>

            <div className="w-full md:w-2/3 flex flex-col bg-muted/10">
            {selectedConversation && otherParticipant ? (
                <>
                <CardHeader className="p-4 border-b flex flex-row items-center justify-between space-x-3 bg-card">
                    <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={otherParticipant.profilePicture} alt={otherParticipant.name || tGlobal('unknownUser')} data-ai-hint={otherParticipant.dataAiHint || "person"}/>
                        <AvatarFallback>{getInitials(otherParticipant.name)}</AvatarFallback>
                    </Avatar>
                        <div>
                        <CardTitle className="text-lg">{otherParticipant.name || tGlobal('unknownUser')}</CardTitle>
                         <CardDescription className={cn("text-xs", otherParticipant.isOnline ? "text-green-600" : "text-muted-foreground")}>
                            {otherParticipant.isOnline ? t('statusOnline') : t('statusOffline')}
                         </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
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
                                <Button variant="ghost" size="icon" onClick={handleCallFeatureClick} aria-label={t('startAudioCall')}>
                                    <Phone className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('startAudioCall')}</p>
                            </TooltipContent>
                         </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={handleCallFeatureClick} aria-label={t('startVideoCall')}>
                                    <Video className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('startVideoCall')}</p>
                            </TooltipContent>
                        </Tooltip>
                         <AlertDialog open={showCallFeatureInfo} onOpenChange={setShowCallFeatureInfo}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>{t('videoAudioCallInfoTitle')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t('videoAudioCallInfoDesc', { name: otherParticipant.name || tGlobal('unknownUser') })}
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogAction onClick={() => setShowCallFeatureInfo(false)}>{t('gotItButton')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>

                <ScrollArea className="flex-grow p-4 space-y-4 bg-muted/20" aria-live="polite">
                    {loadingMessages ? (
                         [...Array(8)].map((_, i) => (
                            <div key={i} className={`flex items-end space-x-2 ${i % 2 === 0 ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
                                {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                                <Skeleton className={`h-10 rounded-lg ${i % 2 === 0 ? 'w-3/5' : 'w-2/5'}`} />
                                {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                            </div>
                        ))
                    ) : currentMessages.map((msg) => {
                    const intentionInfo = getManualIntentionTagInfo(msg.intentionTag);
                    const isCurrentUserMsg = msg.senderId === currentUser.uid;
                    return (
                        <div
                            key={msg.id}
                            className={cn(
                            "flex items-end space-x-2 max-w-[85%]",
                            isCurrentUserMsg ? "ml-auto justify-end" : "mr-auto justify-start"
                            )}
                        >
                            {!isCurrentUserMsg && (
                            <Avatar className="h-8 w-8 border self-start mt-1 flex-shrink-0">
                                <AvatarImage src={otherParticipant.profilePicture} alt={otherParticipant.name || tGlobal('unknownUser')} data-ai-hint={otherParticipant.dataAiHint || "person"}/>
                                <AvatarFallback>{getInitials(otherParticipant.name)}</AvatarFallback>
                            </Avatar>
                            )}
                            <div
                            className={cn(
                                "rounded-lg px-3 py-2 shadow-sm relative group",
                                isCurrentUserMsg
                                ? "bg-primary text-primary-foreground rounded-br-none"
                                : "bg-card text-card-foreground border rounded-bl-none",
                                msg.status === 'moderated' ? "bg-yellow-100 border-yellow-400 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700" : ""
                            )}
                            >
                            {intentionInfo && msg.status !== 'moderated' && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center text-xs opacity-80 mb-1 cursor-default" >
                                            {React.cloneElement(intentionInfo.icon, { className: "h-3 w-3 mr-1" })}
                                            <span>{intentionInfo.label}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" align={isCurrentUserMsg ? "end" : "start"}>
                                         <p>{`${t('intentionTagTitle')}: ${intentionInfo.label}`}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{msg.status === 'moderated' ? t('messageModerated') : msg.text}</p>
                            <p className="text-xs text-right opacity-70 mt-1">
                                {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '...'}
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
                             {msg.status === 'moderated' && (
                                 <Tooltip>
                                    <TooltipTrigger asChild>
                                        <ShieldAlert className="absolute -left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-500" />
                                    </TooltipTrigger>
                                     <TooltipContent side="left">
                                        <p>{t('messageBlockedByModeration')}</p>
                                     </TooltipContent>
                                </Tooltip>
                            )}
                            </div>
                            {isCurrentUserMsg && (
                            <Avatar className="h-8 w-8 border self-start mt-1 flex-shrink-0">
                                <AvatarImage src={currentUser?.photoURL || undefined} alt={currentUser?.displayName || 'You'} data-ai-hint={"user profile"}/>
                                <AvatarFallback>{getInitials(currentUser?.displayName || 'You')}</AvatarFallback>
                            </Avatar>
                            )}
                        </div>
                        );
                    })}
                     {isPartnerTyping && (
                         <div className="flex items-center space-x-2 mr-auto justify-start max-w-[85%]">
                            <Avatar className="h-8 w-8 border self-start mt-1 flex-shrink-0">
                                <AvatarImage src={otherParticipant?.profilePicture} alt={otherParticipant?.name || tGlobal('unknownUser')} data-ai-hint={otherParticipant?.dataAiHint || "person"}/>
                                <AvatarFallback>{getInitials(otherParticipant?.name)}</AvatarFallback>
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
                {loadingConversations || authLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <p>{t('selectChatPrompt')}</p> }
                </div>
            )}
            </div>
        </Card>
        </div>
    </TooltipProvider>
  );
}
