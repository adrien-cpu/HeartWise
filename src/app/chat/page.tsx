"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added CardDescription
import { Separator } from "@/components/ui/separator";
import { Loader2, Send, User, HeartHandshake } from 'lucide-react'; // Added HeartHandshake
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { UserProfile, get_user } from '@/services/user_profile'; // Import user profile service

/**
 * @fileOverview Chat page component.
 * @module ChatPage
 * @description Displays the chat interface, allowing users to select conversations and send/receive messages. Includes mock compatibility display.
 */


// Mock data structures
interface Message {
  id: string;
  senderId: string; // 'user1' for current user, 'user2', 'user3' etc. for others
  senderName: string;
  text: string;
  timestamp: Date;
}

interface ConversationParticipant extends UserProfile {
  // Inherits UserProfile fields like id, name, profilePicture, bio, interests etc.
  compatibilityScore?: number; // Mock compatibility score (0-100)
}

interface Conversation {
  id: string;
  participant: ConversationParticipant; // Use the extended participant type
  lastMessage: string;
  lastMessageTimestamp: Date;
  messages: Message[];
}

// Mock current user ID
const CURRENT_USER_ID = 'user1';
const CURRENT_USER_NAME = 'Me'; // Or fetch from profile

// Mock participants with compatibility
const mockParticipants: { [key: string]: ConversationParticipant } = {
  'user2': {
    id: 'user2',
    name: 'Bob',
    profilePicture: 'https://picsum.photos/seed/bob/50/50',
    bio: 'Loves cooking and travel.',
    interests: ['Cooking', 'Travel'],
    compatibilityScore: 75,
  },
  'user3': {
    id: 'user3',
    name: 'Charlie',
    profilePicture: 'https://picsum.photos/seed/charlie/50/50',
    bio: 'Tech enthusiast and bookworm.',
    interests: ['Tech', 'Books'],
    compatibilityScore: 60,
  },
  'user4': {
    id: 'user4',
    name: 'Diana',
    profilePicture: 'https://picsum.photos/seed/diana/50/50',
    bio: 'Outdoor adventurer and music lover.',
    interests: ['Hiking', 'Music', 'Travel'],
    compatibilityScore: 88,
  },
};


// Mock conversations data using participants
const initialConversations: Conversation[] = [
  {
    id: 'conv1',
    participant: mockParticipants['user2'],
    lastMessage: 'Hey, how are you?',
    lastMessageTimestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    messages: [
      { id: 'm1', senderId: 'user2', senderName: mockParticipants['user2'].name || 'Bob', text: 'Hey, how are you?', timestamp: new Date(Date.now() - 5 * 60 * 1000) },
      { id: 'm2', senderId: 'user1', senderName: CURRENT_USER_NAME, text: 'Hi Bob! I\'m good, thanks. You?', timestamp: new Date(Date.now() - 4 * 60 * 1000) },
    ],
  },
   {
    id: 'conv2',
    participant: mockParticipants['user3'],
    lastMessage: 'Did you see that movie?',
    lastMessageTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    messages: [
      { id: 'm3', senderId: 'user3', senderName: mockParticipants['user3'].name || 'Charlie', text: 'Did you see that movie?', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    ],
  },
   {
    id: 'conv3',
    participant: mockParticipants['user4'],
    lastMessage: 'Planning anything fun this weekend?',
    lastMessageTimestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    messages: [
       { id: 'm4', senderId: 'user1', senderName: CURRENT_USER_NAME, text: 'Hey Diana!', timestamp: new Date(Date.now() - 1.1 * 24 * 60 * 60 * 1000) },
       { id: 'm5', senderId: 'user4', senderName: mockParticipants['user4'].name || 'Diana', text: 'Planning anything fun this weekend?', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ],
  },
];

/**
 * ChatPage component.
 *
 * @component
 * @description Displays the chat interface, allowing users to select conversations and send/receive messages.
 * @returns {JSX.Element} The rendered Chat page.
 */
export default function ChatPage() {
  const t = useTranslations('Chat');
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

  // Fetch current user profile
  useEffect(() => {
    get_user(CURRENT_USER_ID)
      .then(profile => setCurrentUserProfile(profile))
      .catch(err => console.error("Failed to fetch current user profile:", err));
  }, []);


  // Fetch conversations (mocked)
  useEffect(() => {
    const loadChats = async () => {
      setLoadingChats(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const sortedConversations = [...initialConversations].sort((a,b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime());
      setConversations(sortedConversations);
      if (sortedConversations.length > 0) {
        setSelectedConversationId(sortedConversations[0].id); // Select the first one initially
      }
      setLoadingChats(false);
    };
    loadChats();
  }, []);

  // Scroll to bottom when messages change or conversation is selected
  useEffect(() => {
    // Added a slight delay to ensure DOM updates before scrolling
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedConversationId, conversations]); // Rerun when conversation or messages change

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  /**
   * Handles sending a new message.
   * @async
   */
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId || !selectedConversation) return;

    setSendingMessage(true);
    const messageToSend: Message = {
      id: `msg-${Date.now()}`, // Temporary ID
      senderId: CURRENT_USER_ID,
      senderName: CURRENT_USER_NAME,
      text: newMessage.trim(),
      timestamp: new Date(),
    };

    try {
      // Simulate API call to send message
      await new Promise(resolve => setTimeout(resolve, 500));
      // console.log("Sending message:", messageToSend, "to conversation:", selectedConversationId);

      // Update local state optimistically
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversationId
            ? {
                ...conv,
                messages: [...conv.messages, messageToSend],
                lastMessage: messageToSend.text, // Update last message preview
                lastMessageTimestamp: messageToSend.timestamp, // Update timestamp
              }
            : conv
        ).sort((a,b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime()) // Re-sort after update
      );
      setNewMessage('');

      // Ensure scroll happens after state update and potential re-render
      requestAnimationFrame(() => {
         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
       });

    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        variant: 'destructive',
        title: t('errorSendingMessage'),
      });
      // Optionally revert optimistic update here
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


  return (
    <div className="container mx-auto h-[calc(100vh-80px)] flex flex-col p-0 md:p-4"> {/* Adjust height based on header/footer */}
      <Card className="flex flex-grow overflow-hidden h-full shadow-lg rounded-lg border">
        {/* Conversation List Sidebar */}
        <div className="w-full md:w-1/3 border-r flex flex-col bg-card">
          <CardHeader className="p-4">
            <CardTitle>{t('title')}</CardTitle>
          </CardHeader>
          <Separator />
          <ScrollArea className="flex-grow">
            <div className="p-2 space-y-1">
              {loadingChats ? (
                 [...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
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
                      "w-full justify-start h-auto py-3 px-3 text-left rounded-md transition-colors",
                      selectedConversationId === conv.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedConversationId(conv.id)}
                  >
                    <Avatar className="h-10 w-10 mr-3 border">
                      <AvatarImage src={conv.participant.profilePicture} alt={conv.participant.name || 'User'} />
                      <AvatarFallback>{getInitials(conv.participant.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow overflow-hidden">
                      <p className="font-medium truncate">{conv.participant.name || 'Unknown User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                     <span className="text-xs text-muted-foreground ml-auto pl-2 shrink-0">
                      {conv.lastMessageTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
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
                     <AvatarImage src={selectedConversation.participant.profilePicture} alt={selectedConversation.participant.name || 'User'} />
                     <AvatarFallback>{getInitials(selectedConversation.participant.name)}</AvatarFallback>
                   </Avatar>
                    <div>
                      <CardTitle className="text-lg">{selectedConversation.participant.name || 'Unknown User'}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">{t('onlineStatusPlaceholder')}</CardDescription> {/* Placeholder */}
                    </div>
                 </div>
                 {/* Mock Compatibility Score Display */}
                 {selectedConversation.participant.compatibilityScore !== undefined && (
                    <div className="flex items-center space-x-1 text-sm text-primary font-medium" title={t('compatibilityScoreTitle')}>
                        <HeartHandshake className="h-4 w-4" />
                        <span>{selectedConversation.participant.compatibilityScore}%</span>
                    </div>
                 )}
              </CardHeader>

              {/* Messages Area */}
              <ScrollArea className="flex-grow p-4 space-y-4 bg-muted/20">
                {selectedConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end space-x-2 max-w-[85%]",
                      msg.senderId === CURRENT_USER_ID ? "ml-auto justify-end" : "mr-auto justify-start"
                    )}
                  >
                    {msg.senderId !== CURRENT_USER_ID && (
                      <Avatar className="h-8 w-8 border self-start mt-1">
                        <AvatarImage src={selectedConversation.participant.profilePicture} alt={selectedConversation.participant.name || 'User'} />
                        <AvatarFallback>{getInitials(selectedConversation.participant.name)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "rounded-lg px-4 py-2 shadow-sm",
                        msg.senderId === CURRENT_USER_ID
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-card text-card-foreground border rounded-bl-none"
                      )}
                    >
                       <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                       <p className="text-xs text-right opacity-70 mt-1">
                         {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </p>
                    </div>
                     {msg.senderId === CURRENT_USER_ID && (
                       <Avatar className="h-8 w-8 border self-start mt-1">
                         {/* Current user avatar - fetch from profile or use placeholder */}
                         <AvatarImage src={currentUserProfile?.profilePicture || undefined} alt={CURRENT_USER_NAME} />
                         <AvatarFallback>{getInitials(CURRENT_USER_NAME)}</AvatarFallback>
                       </Avatar>
                     )}
                  </div>
                ))}
                 <div ref={messagesEndRef} /> {/* Element to scroll to */}
              </ScrollArea>

              {/* Message Input Area */}
              <CardFooter className="p-4 border-t bg-card">
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
                  />
                  <Button aria-label={t('sendButton')} type="button" size="icon" onClick={handleSendMessage} disabled={sendingMessage || !newMessage.trim()}>
                    {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </CardFooter>
            </>
          ) : (
            <div className="flex flex-grow items-center justify-center text-muted-foreground">
              {loadingChats ? <Loader2 className="h-8 w-8 animate-spin" /> : <p>{t('selectChatPrompt')}</p> }
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
