"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Send, HeartHandshake, Smile, Info, Heart, Video, Phone, AlertCircle, Bot, MessagesSquare, ShieldAlert, PhoneOff, Mic, MicOff } from 'lucide-react';
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
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  sendMessage as sendChatMessage,
  getConversationsListener,
  getMessagesListener,
  markMessagesAsRead,
} from '@/services/chat_service';
import type { Message as ChatMessage, Conversation as ChatConversation, ConversationParticipant as ChatParticipant } from '@/services/chat_service';
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
import {
  RTCConnection,
  initializePeerConnection,
  getLocalStream,
  addLocalStreamToPeerConnection,
  createOfferSdp,
  createAnswerSdp,
  setRemoteSdp,
  addIceCandidate,
  sendSignalingMessageViaFirestore,
  listenForSignalingMessagesFromFirestore,
  closeWebRTCConnection,
  getSignalingChannelId,
  initializeSignalingChannel,
  OfferMessage,
  AnswerMessage,
  IceCandidateMessage,
  HangupMessage,
  SignalingMessage,
} from '@/services/webrtc_service';
import { debounce } from 'lodash';

/**
 * @fileOverview Chat page component.
 * @module ChatPage
 * @description Displays the chat interface, allowing users to select conversations and send/receive messages. Includes mock compatibility display, manual intention tag selection, and AI-suggested intention tagging. Simulates video/audio call initiation and typing indicator.
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

interface LocalMessage {
  id: string;
  content: string;
  senderId: string;
  timestamp: Timestamp | Date;
  intentionTag?: string;
  status?: 'sent' | 'delivered' | 'read' | 'error' | 'moderated';
  text?: string;
  likes?: number;
}

interface LocalConversation {
  id: string;
  participant: ConversationParticipant;
  lastMessage?: LocalMessage;
  unreadCount: number;
  updatedAt: Date;
  lastMessageTimestamp?: Date;
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
const initialConversations: LocalConversation[] = [
  {
    id: 'conv1',
    participant: mockParticipants['user2'],
    lastMessage: {
      id: 'm1',
      content: 'Hey, how are you?',
      senderId: 'user2',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'read'
    },
    lastMessageTimestamp: new Date(Date.now() - 5 * 60 * 1000),
    unreadCount: 2,
    updatedAt: new Date()
  },
  {
    id: 'conv2',
    participant: mockParticipants['user3'],
    lastMessage: {
      id: 'm3',
      content: 'Did you see that movie?',
      senderId: 'user3',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'read'
    },
    lastMessageTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unreadCount: 0,
    updatedAt: new Date()
  },
  {
    id: 'conv3',
    participant: mockParticipants['user4'],
    lastMessage: {
      id: 'm5',
      content: 'Planning anything fun this weekend?',
      senderId: 'user4',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'delivered'
    },
    lastMessageTimestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    unreadCount: 1,
    updatedAt: new Date()
  }
];

// Available intention tags for manual selection
const manualIntentionTags = [
  { value: 'friendly', label: 'Friendly', icon: <Smile className="h-4 w-4 mr-2" /> },
  { value: 'humor', label: 'Humor', icon: <Smile className="h-4 w-4 mr-2" /> },
  { value: 'serious', label: 'Serious', icon: <Info className="h-4 w-4 mr-2" /> },
  { value: 'flirt', label: 'Flirt', icon: <Heart className="h-4 w-4 mr-2" /> },
  { value: 'tender', label: 'Tender', icon: <HeartHandshake className="h-4 w-4 mr-2" /> },
];

const ChatPage = (): JSX.Element => {
  const t = useTranslations("Chat");
  const { toast } = useToast();
  const { user: currentUser, loading: authLoading } = useAuthContext();
  const router = useRouter();

  // State
  const [conversations, setConversations] = useState<LocalConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<LocalConversation | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isAnalyzingIntent, setIsAnalyzingIntent] = useState(false);
  const [selectedIntention, setSelectedIntention] = useState<string>("");
  const [aiSuggestedTag, setAiSuggestedTag] = useState<IntentionTaggingOutput | null>(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [currentMessages, setCurrentMessages] = useState<LocalMessage[]>([]);
  const [otherParticipant, setOtherParticipant] = useState<ConversationParticipant | null>(null);
  const [rtcConnection, setRtcConnection] = useState<RTCConnection | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Handlers
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
    if (!message.trim() || !selectedConversation || !currentUser) return;
    setSendingMessage(true);
    try {
      // Implementation here
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('errorSendingMessage')
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStartCall = async (withVideo: boolean) => {
    if (!selectedConversation || !currentUser) return;
    setIsCallActive(true);
    setCallStatus('dialing');
    try {
      const stream = await getLocalStream({ video: withVideo, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      const connection: RTCConnection = {
        peerConnection: null,
        localStream: stream,
        remoteStream: null,
        signalingChannelId: null,
        callStatus: 'dialing',
        isInitiator: true,
        onRemoteStreamReady: (stream: MediaStream) => {
          setRemoteStream(stream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        },
        onCallEnded: () => {
          setCallStatus('idle');
          setLocalStream(null);
          setRemoteStream(null);
          if (localVideoRef.current) localVideoRef.current.srcObject = null;
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        }
      };
      setRtcConnection(connection);
    } catch (error) {
      console.error("Failed to start call:", error);
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('errorStartingCall')
      });
      setIsCallActive(false);
      setCallStatus('idle');
    }
  };

  const handleHangUp = async () => {
    setIsCallActive(false);
    // Implementation here
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // Implementation here
  };

  // Initialize RTC connection
  useEffect(() => {
    if (!currentUser) return;

    const initRTC = async () => {
      try {
        const connection: RTCConnection = {
          peerConnection: null,
          localStream: null,
          remoteStream: null,
          signalingChannelId: null,
          callStatus: "idle",
          isInitiator: false,
          onRemoteStreamReady: (stream) => {
            setRemoteStream(stream);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = stream;
            }
          },
          onCallEnded: () => {
            setCallStatus("idle");
            setLocalStream(null);
            setRemoteStream(null);
            if (localVideoRef.current) localVideoRef.current.srcObject = null;
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
          }
        };

        setRtcConnection(connection);
      } catch (error) {
        console.error("Failed to initialize RTC connection:", error);
        toast({
          variant: "destructive",
          title: t('error'),
          description: t('errorInitializingRTC')
        });
      }
    };

    initRTC();
  }, [currentUser, toast, t]);

  // Handle signaling messages
  useEffect(() => {
    if (!rtcConnection || !currentUser) return;

    const handleMessage = async (message: SignalingMessage) => {
      try {
        if (!rtcConnection.peerConnection) {
          console.warn("WebRTC: PeerConnection not initialized, cannot process message:", message);
          return;
        }

        switch (message.type) {
          case 'offer':
            if (rtcConnection.callStatus === 'idle' || rtcConnection.callStatus === 'receiving') {
              setCallStatus('receiving');
              if (!rtcConnection.localStream) {
                const stream = await getLocalStream({ video: false, audio: true });
                setLocalStream(stream);
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                addLocalStreamToPeerConnection(rtcConnection.peerConnection, stream);
              }
              const answer = await createAnswerSdp(rtcConnection.peerConnection, message.sdp);
              await sendSignalingMessageViaFirestore(
                rtcConnection.signalingChannelId!,
                currentUser.uid,
                {
                  type: 'answer',
                  sdp: answer,
                  senderId: currentUser.uid,
                  timestamp: serverTimestamp()
                }
              );
              setCallStatus('active');
            }
            break;
          case 'answer':
            if (rtcConnection.callStatus === 'dialing') {
              await setRemoteSdp(rtcConnection.peerConnection, message.sdp);
              setCallStatus('active');
            }
            break;
          case 'candidate':
            if (message.candidate) {
              await addIceCandidate(rtcConnection.peerConnection, message.candidate);
            }
            break;
          case 'hangup':
            if (rtcConnection.onCallEnded) rtcConnection.onCallEnded();
            break;
        }
      } catch (error) {
        console.error("Failed to handle signaling message:", error);
        toast({
          variant: "destructive",
          title: t('error'),
          description: t('errorHandlingSignal')
        });
      }
    };

    // Subscribe to signaling channel
    const unsubscribe = listenForSignalingMessagesFromFirestore(
      rtcConnection.signalingChannelId!,
      currentUser.uid,
      handleMessage
    );

    return () => unsubscribe();
  }, [rtcConnection, currentUser, toast, t]);

  const handleCallStatusChange = (status: CallStatus) => {
    setCallStatus(status);
  };

  return (
    <AuthGuard>
      <TooltipProvider>
        <div className="container mx-auto h-[calc(100vh-80px)] flex flex-col p-0 md:p-4">
          <Card className="flex flex-grow overflow-hidden h-full shadow-lg rounded-lg border">
            <div className="w-full md:w-1/3 border-r flex flex-col bg-card">
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2"><MessagesSquare className="h-6 w-6 text-primary" />{t('title')}</CardTitle>
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
                    conversations.map(conv => {
                      const participantDetail = conv.participant;
                      const displayName = participantDetail?.name || t('unknownUser');
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
                          onClick={() => {
                            setSelectedConversationId(conv.id);
                            if (rtcConnection && rtcConnection.callStatus !== 'idle') {
                              handleHangUp();
                            }
                            const targetUser = conv.participant;
                            const connection: RTCConnection = {
                              peerConnection: null,
                              localStream: null,
                              remoteStream: null,
                              signalingChannelId: null,
                              callStatus: 'idle',
                              isInitiator: false,
                              onRemoteStreamReady: (stream: MediaStream) => {
                                setRemoteStream(stream);
                                if (remoteVideoRef.current) {
                                  remoteVideoRef.current.srcObject = stream;
                                }
                              },
                              onCallEnded: () => {
                                setCallStatus('idle');
                                setLocalStream(null);
                                setRemoteStream(null);
                                if (localVideoRef.current) localVideoRef.current.srcObject = null;
                                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
                              }
                            };
                            setRtcConnection(connection);
                          }}
                          aria-current={selectedConversationId === conv.id ? "page" : undefined}
                        >
                          <Avatar className="h-10 w-10 mr-3 border" data-ai-hint={dataAiHint}>
                            <AvatarImage src={displayPicture} alt={displayName} />
                            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-grow overflow-hidden">
                            <p className="font-medium truncate">{displayName}</p>
                            <p className="text-xs text-muted-foreground truncate">{conv.lastMessage?.content}</p>
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
                      {isCallActive ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="destructive" size="icon" onClick={handleHangUp} aria-label={t('hangUpButton')}>
                              <PhoneOff className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>{t('hangUpButton')}</p></TooltipContent>
                        </Tooltip>
                      ) : (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleStartCall(false)} aria-label={t('startAudioCall')}>
                                <Phone className="h-5 w-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('startAudioCall')}</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleStartCall(true)} aria-label={t('startVideoCall')}>
                                <Video className="h-5 w-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('startVideoCall')}</p></TooltipContent>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </CardHeader>

                  <ScrollArea className="flex-grow p-4 space-y-4 bg-muted/20" aria-live="polite" onScroll={handleScroll}>
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
                            <Avatar className="h-8 w-8 border self-start mt-1 flex-shrink-0" data-ai-hint={otherParticipant.dataAiHint || "person"}>
                              <AvatarImage src={otherParticipant.profilePicture} alt={otherParticipant.name || t('unknownUser')} />
                              <AvatarFallback>{getInitials(otherParticipant.name || t('unknownUser'))}</AvatarFallback>
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
                              {msg.timestamp && typeof (msg.timestamp as any).toDate === 'function'
                                ? (msg.timestamp as Timestamp).toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : msg.timestamp instanceof Date
                                  ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : msg.timestamp
                                    ? (msg.timestamp as Timestamp).toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : ''}
                            </p>

                            {typeof msg.likes === 'number' && msg.likes > 0 && (
                              <Badge variant="secondary" className="absolute -right-3 -bottom-2 h-5 px-1.5 text-xs">
                                {msg.likes}
                              </Badge>
                            )}

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
                          {isCurrentUserMsg && currentUser && (
                            <Avatar className="h-8 w-8 border self-start mt-1 flex-shrink-0" data-ai-hint={currentUser.dataAiHint || "user profile"}>
                              <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser?.displayName || 'You'} />
                              <AvatarFallback>{getInitials(currentUser?.displayName || 'You')}</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      );
                    })}
                    {isPartnerTyping && (
                      <div className="flex items-center space-x-2 mr-auto justify-start max-w-[85%]">
                        <Avatar className="h-8 w-8 border self-start mt-1 flex-shrink-0" data-ai-hint={otherParticipant?.dataAiHint || "person"}>
                          <AvatarImage src={otherParticipant.profilePicture} alt={otherParticipant?.name || t('unknownUser')} />
                          <AvatarFallback>{getInitials(otherParticipant.name || t('unknownUser'))}</AvatarFallback>
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
                  </ScrollArea>

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
                      <Label htmlFor="intention-select" className="text-xs text-muted-foreground whitespace-nowrap">{t('intentionTagLabel')}:</Label>
                      <Select value={selectedIntention} onValueChange={setSelectedIntention} disabled={sendingMessage || isCallActive}>
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
                  {loadingConversations ? <Loader2 className="h-8 w-8 animate-spin" /> : <p>{t('selectChatPrompt')}</p>}
                </div>
              )}
            </div>
          </Card>
        </div>
      </TooltipProvider>
    </AuthGuard>
  );
}

// Ajout des fonctions manquantes
const getInitials = (name?: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const formatTimestamp = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
};

const getManualIntentionTagInfo = (tag?: string) => {
  if (!tag) return null;
  return manualIntentionTags.find(t => t.value === tag);
};

const getAiIntentionTagIcon = (tag: string) => {
  const tagInfo = manualIntentionTags.find(t => t.value === tag);
  return tagInfo?.icon || <Smile className="h-4 w-4 mr-2" />;
};

