"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Send, HeartHandshake, Smile, Info, Heart, Video, Phone, AlertCircle, Bot, MessagesSquare, ShieldAlert, PhoneOff, Mic, MicOff, Upload, Image as ImageIcon, File, X, Search, Clock, Quote, Reply } from 'lucide-react';
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
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { VideoCall } from '@/components/video-call';
import { videoCallService } from '@/services/videoCall';
import Image from 'next/image';

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
    participants: ['user2', 'user1'],
    participant: mockParticipants['user2'],
    lastMessage: {
      id: 'm1',
      text: 'Hey, how are you?',
      senderId: 'user2',
      senderName: 'Bob',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'read'
    } as LocalMessage,
    unreadCount: 2,
    updatedAt: new Date(),
    lastMessageTimestamp: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    id: 'conv2',
    participants: ['user3', 'user1'],
    participant: mockParticipants['user3'],
    lastMessage: {
      id: 'm3',
      text: 'Did you see that movie?',
      senderId: 'user3',
      senderName: 'Charlie',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'read'
    } as LocalMessage,
    unreadCount: 0,
    updatedAt: new Date(),
    lastMessageTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 'conv3',
    participants: ['user4', 'user1'],
    participant: mockParticipants['user4'],
    lastMessage: {
      id: 'm5',
      text: 'Let\'s go hiking this weekend!',
      senderId: 'user4',
      senderName: 'Diana',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: 'delivered'
    } as LocalMessage,
    unreadCount: 1,
    updatedAt: new Date(),
    lastMessageTimestamp: new Date(Date.now() - 30 * 60 * 1000)
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

const REACTION_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🙏'];

export default function ChatPage(): JSX.Element {
  const t = useTranslations("Chat");
  const { toast } = useToast();
  const { user: currentUser, loading: authLoading } = useAuth();
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
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocalMessage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [replyingTo, setReplyingTo] = useState<LocalMessage | null>(null);
  const [ephemeralDuration, setEphemeralDuration] = useState<number>(0);
  const [isInCall, setIsInCall] = useState(false);
  const [callTarget, setCallTarget] = useState<string | null>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `chat/${currentUser?.uid}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytes(storageRef, file);

    try {
      const snapshot = await uploadTask;
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return;
    if (!currentUser) return;

    try {
      setSendingMessage(true);
      let uploadedAttachments: Array<{
        type: 'image' | 'file' | 'audio' | 'video';
        url: string;
        name: string;
        size?: number;
      }> = [];

      if (attachments.length > 0) {
        uploadedAttachments = await Promise.all(
          attachments.map(async (file) => {
            const url = await uploadFile(file);
            const type = file.type.startsWith('image/') ? 'image' :
              file.type.startsWith('video/') ? 'video' :
                file.type.startsWith('audio/') ? 'audio' : 'file';
            return {
              url,
              type: type as 'image' | 'file' | 'audio' | 'video',
              name: file.name,
              size: file.size
            };
          })
        );
      }

      const messageData: Omit<ChatMessage, 'id' | 'timestamp'> = {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Me',
        text: message,
        status: 'sent',
        intentionTag: selectedIntention,
        attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
        replyTo: replyingTo ? {
          id: replyingTo.id,
          text: replyingTo.text,
          senderName: replyingTo.senderName
        } : undefined,
        isEphemeral: ephemeralDuration > 0,
        expiresAt: ephemeralDuration > 0 ? new Date(Date.now() + ephemeralDuration * 1000) : undefined
      };

      await sendChatMessage(selectedConversationId!, messageData);
      setMessage("");
      setAttachments([]);
      setReplyingTo(null);
      setEphemeralDuration(0);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: t('error'),
        description: t('errorSendingMessage'),
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStartCall = (targetUserId: string) => {
    setCallTarget(targetUserId);
    setIsInCall(true);
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setCallTarget(null);
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

  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!currentUser?.uid) return;

    const messageRef = doc(db, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);

    if (!messageDoc.exists()) return;

    const messageData = messageDoc.data();
    const currentReactions = messageData.reactions || {};
    const userReactions = currentReactions[currentUser.uid] || [];

    let newReactions;
    if (userReactions.includes(emoji)) {
      // Remove reaction if already exists
      newReactions = {
        ...currentReactions,
        [currentUser.uid]: userReactions.filter((r: string) => r !== emoji)
      };
    } else {
      // Add new reaction
      newReactions = {
        ...currentReactions,
        [currentUser.uid]: [...userReactions, emoji]
      };
    }

    await updateDoc(messageRef, { reactions: newReactions });
    setShowReactionPicker(null);
  };

  const renderMessageReactions = (message: LocalMessage) => {
    if (!message.reactions || message.reactions.length === 0) return null;

    const reactionsByEmoji = message.reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction);
      return acc;
    }, {} as Record<string, typeof message.reactions>);

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(reactionsByEmoji).map(([emoji, reactions]) => (
          <Tooltip key={emoji}>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs">
                <span>{emoji}</span>
                <span>{reactions.length}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{reactions.map((r: { userName: string }) => r.userName).join(', ')}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    );
  };

  const renderAttachment = (attachment: NonNullable<LocalMessage['attachments']>[number]) => {
    if (attachment.type === 'image') {
      return (
        <div className="relative group">
          <Image
            src={attachment.url}
            alt={attachment.name}
            width={200}
            height={200}
            className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
          />
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white rounded-lg transition-opacity"
          >
            <span className="text-sm">{t('viewFullSize')}</span>
          </a>
        </div>
      );
    }

    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
      >
        <File className="h-4 w-4" />
        <div className="flex flex-col">
          <span className="text-sm font-medium truncate max-w-[150px]">{attachment.name}</span>
          {attachment.size && (
            <span className="text-xs text-muted-foreground">
              {(attachment.size / 1024).toFixed(1)} KB
            </span>
          )}
        </div>
      </a>
    );
  };

  const renderMessage = (message: LocalMessage) => {
    const isCurrentUser = message.senderId === currentUser?.uid;

    return (
      <div
        key={message.id}
        id={`message-${message.id}`}
        className={cn(
          "flex flex-col max-w-[80%] group",
          isCurrentUser ? "ml-auto" : "mr-auto"
        )}
      >
        <div className="flex items-start gap-2">
          {!isCurrentUser && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={selectedConversation?.participant.profilePicture} />
              <AvatarFallback>{getInitials(selectedConversation?.participant.name)}</AvatarFallback>
            </Avatar>
          )}
          <div className={cn(
            "rounded-lg p-3 relative",
            isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
            {message.replyTo && (
              <div className="mb-2 p-2 bg-background/50 rounded-md">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Reply className="h-3 w-3" />
                  <span>{message.replyTo.senderName}</span>
                </div>
                <p className="text-sm truncate">{message.replyTo.text}</p>
              </div>
            )}
            {message.text && <p className="text-sm">{message.text}</p>}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index}>
                    {renderAttachment(attachment)}
                  </div>
                ))}
              </div>
            )}
            {message.intentionTag && (
              <div className="mt-1 flex items-center gap-1">
                {getAiIntentionTagIcon(message.intentionTag)}
                <span className="text-xs opacity-70">{message.intentionTag}</span>
              </div>
            )}
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs opacity-70">
                {formatTimestamp(message.timestamp)}
                {message.isEphemeral && (
                  <span className="ml-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {message.expiresAt && Math.ceil((message.expiresAt.getTime() - Date.now()) / 1000)}s
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setReplyingTo(message)}
                >
                  <Reply className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowReactionPicker(message.id)}
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          {isCurrentUser && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser?.photoURL || undefined} />
              <AvatarFallback>{getInitials(currentUser?.displayName || undefined)}</AvatarFallback>
            </Avatar>
          )}
        </div>
        {renderMessageReactions(message)}
        {showReactionPicker === message.id && (
          <div className="flex gap-1 mt-1 bg-background p-1 rounded-md shadow-sm">
            {REACTION_EMOJIS.map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleAddReaction(message.id, emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleSearch = useCallback((query: string) => {
    if (!query.trim() || !currentMessages) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const results = currentMessages.filter((message) => {
      const text = message.text.toLowerCase();
      const searchLower = query.toLowerCase();
      return text.includes(searchLower);
    });
    setSearchResults(results);
    setIsSearching(false);
  }, [currentMessages]);

  const debouncedSearch = useMemo(() => debounce(handleSearch, 300), [handleSearch]);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const renderSearchResults = () => {
    if (!searchQuery.trim()) return null;

    return (
      <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-50 max-h-[300px] overflow-y-auto">
        {isSearching ? (
          <div className="p-4 text-center">
            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">{t('searching')}</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="p-2">
            {searchResults.map((message) => (
              <div
                key={message.id}
                className="p-2 hover:bg-muted rounded-md cursor-pointer"
                onClick={() => {
                  // Scroll to message
                  const element = document.getElementById(`message-${message.id}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('highlight-message');
                    setTimeout(() => {
                      element.classList.remove('highlight-message');
                    }, 2000);
                  }
                }}
              >
                <p className="text-sm truncate">{message.text}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTimestamp(message.timestamp)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">{t('noResultsFound')}</p>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const checkEphemeralMessages = () => {
      const now = new Date();
      const updatedMessages = currentMessages?.filter(message => {
        if (message.isEphemeral && message.expiresAt) {
          return message.expiresAt > now;
        }
        return true;
      });

      if (updatedMessages && updatedMessages.length !== currentMessages?.length) {
        setCurrentMessages(updatedMessages);
      }
    };

    const interval = setInterval(checkEphemeralMessages, 1000);
    return () => clearInterval(interval);
  }, [currentMessages]);

  const handleHangUp = async () => {
    if (!selectedConversation) return;

    try {
      await videoCallService.endCall(selectedConversation.id);
      setIsInCall(false);
      setShowVideoCall(false);
    } catch (error) {
      console.error('Error ending call:', error);
      toast({
        title: t('error'),
        description: t('errorEndingCall'),
        variant: 'destructive',
      });
    }
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
                              <Button variant="ghost" size="icon" onClick={() => handleStartCall(selectedConversation.participant.id)} aria-label={t('startVideoCall')}>
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
                    ) : currentMessages.map(renderMessage)}
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
                          <SelectItem value="" className="text-xs">{t('noTagOption') as React.ReactNode}</SelectItem>
                          {manualIntentionTags.map(tag => (
                            <SelectItem key={tag.value} value={tag.value} className="text-xs">{tag.label as React.ReactNode}</SelectItem>
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
          <div className="p-4 border-t">
            {replyingTo && (
              <div className="mb-2 p-2 bg-muted rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Reply className="h-4 w-4" />
                  <span className="text-sm">Répondre à {replyingTo.senderName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setReplyingTo(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="relative group bg-muted rounded-lg p-2 flex items-center gap-2"
                  >
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : (
                      <File className="h-4 w-4" />
                    )}
                    <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={t('typeMessage')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Select
                value={ephemeralDuration.toString()}
                onValueChange={(value) => setEphemeralDuration(parseInt(value))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Durée" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{"Normal" as React.ReactNode}</SelectItem>
                  <SelectItem value="30">{"30 secondes" as React.ReactNode}</SelectItem>
                  <SelectItem value="60">{"1 minute" as React.ReactNode}</SelectItem>
                  <SelectItem value="300">{"5 minutes" as React.ReactNode}</SelectItem>
                  <SelectItem value="3600">{"1 heure" as React.ReactNode}</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                onChange={handleFileSelect}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4 mr-2" />
                {t('send')}
              </Button>
            </div>
          </div>
        </div>
      </TooltipProvider>
      {isInCall && callTarget && (
        <VideoCall
          userId={currentUser?.uid || ''}
          targetUserId={callTarget}
          onCallEnd={handleEndCall}
        />
      )}
    </AuthGuard>
  );
}

// Ajout des fonctions manquantes
const getInitials = (name?: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const formatTimestamp = (timestamp: Timestamp | Date): string => {
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getManualIntentionTagInfo = (tag?: string) => {
  if (!tag) return null;
  return manualIntentionTags.find(t => t.value === tag);
};

const getAiIntentionTagIcon = (tag: string) => {
  const tagInfo = manualIntentionTags.find(t => t.value === tag);
  return tagInfo?.icon || <Smile className="h-4 w-4 mr-2" />;
};

