
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Send, User } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data structures
interface Message {
  id: string;
  senderId: string; // 'user1' for current user, 'user2', 'user3' etc. for others
  senderName: string;
  text: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTimestamp: Date;
  messages: Message[];
}

// Mock current user ID
const CURRENT_USER_ID = 'user1';
const CURRENT_USER_NAME = 'Me'; // Or fetch from profile

// Mock conversations data
const initialConversations: Conversation[] = [
  {
    id: 'conv1',
    participantId: 'user2',
    participantName: 'Bob',
    participantAvatar: 'https://picsum.photos/seed/bob/50/50',
    lastMessage: 'Hey, how are you?',
    lastMessageTimestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    messages: [
      { id: 'm1', senderId: 'user2', senderName: 'Bob', text: 'Hey, how are you?', timestamp: new Date(Date.now() - 5 * 60 * 1000) },
      { id: 'm2', senderId: 'user1', senderName: CURRENT_USER_NAME, text: 'Hi Bob! I\'m good, thanks. You?', timestamp: new Date(Date.now() - 4 * 60 * 1000) },
    ],
  },
   {
    id: 'conv2',
    participantId: 'user3',
    participantName: 'Charlie',
    participantAvatar: 'https://picsum.photos/seed/charlie/50/50',
    lastMessage: 'Did you see that movie?',
    lastMessageTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    messages: [
      { id: 'm3', senderId: 'user3', senderName: 'Charlie', text: 'Did you see that movie?', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    ],
  },
   {
    id: 'conv3',
    participantId: 'user4',
    participantName: 'Diana',
    participantAvatar: 'https://picsum.photos/seed/diana/50/50',
    lastMessage: 'Planning anything fun this weekend?',
    lastMessageTimestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    messages: [
       { id: 'm4', senderId: 'user1', senderName: CURRENT_USER_NAME, text: 'Hey Diana!', timestamp: new Date(Date.now() - 1.1 * 24 * 60 * 60 * 1000) },
       { id: 'm5', senderId: 'user4', senderName: 'Diana', text: 'Planning anything fun this weekend?', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
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

  // Fetch conversations (mocked)
  useEffect(() => {
    const loadChats = async () => {
      setLoadingChats(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConversations(initialConversations.sort((a,b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime())); // Sort by most recent
      if (initialConversations.length > 0) {
        setSelectedConversationId(initialConversations[0].id); // Select the first one initially
      }
      setLoadingChats(false);
    };
    loadChats();
  }, []);

  // Scroll to bottom when messages change or conversation is selected
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      <Card className="flex flex-grow overflow-hidden h-full">
        {/* Conversation List Sidebar */}
        <div className="w-1/3 border-r flex flex-col">
          <CardHeader className="p-4">
            <CardTitle>{t('title')}</CardTitle>
          </CardHeader>
          <Separator />
          <ScrollArea className="flex-grow">
            <div className="p-2 space-y-1">
              {loadingChats ? (
                 [...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-2">
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
                      "w-full justify-start h-auto py-2 px-3",
                      selectedConversationId === conv.id && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => setSelectedConversationId(conv.id)}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={conv.participantAvatar} alt={conv.participantName} />
                      <AvatarFallback>{getInitials(conv.participantName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow text-left overflow-hidden">
                      <p className="font-medium truncate">{conv.participantName}</p>
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
        <div className="w-2/3 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="p-4 border-b flex flex-row items-center space-x-3">
                 <Avatar className="h-10 w-10">
                   <AvatarImage src={selectedConversation.participantAvatar} alt={selectedConversation.participantName} />
                   <AvatarFallback>{getInitials(selectedConversation.participantName)}</AvatarFallback>
                 </Avatar>
                <CardTitle className="text-lg">{selectedConversation.participantName}</CardTitle>
                 {/* Add online status indicator if available */}
              </CardHeader>

              {/* Messages Area */}
              <ScrollArea className="flex-grow p-4 space-y-4 bg-muted/20">
                {selectedConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end space-x-2",
                      msg.senderId === CURRENT_USER_ID ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.senderId !== CURRENT_USER_ID && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedConversation.participantAvatar} alt={selectedConversation.participantName} />
                        <AvatarFallback>{getInitials(selectedConversation.participantName)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[70%] rounded-lg px-4 py-2",
                        msg.senderId === CURRENT_USER_ID
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}
                    >
                       <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                       <p className="text-xs text-right opacity-70 mt-1">
                         {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </p>
                    </div>
                     {msg.senderId === CURRENT_USER_ID && (
                       <Avatar className="h-8 w-8">
                         {/* Current user avatar - fetch from profile or use placeholder */}
                         <AvatarImage src={undefined} alt={CURRENT_USER_NAME} />
                         <AvatarFallback>{getInitials(CURRENT_USER_NAME)}</AvatarFallback>
                       </Avatar>
                     )}
                  </div>
                ))}
                 <div ref={messagesEndRef} /> {/* Element to scroll to */}
              </ScrollArea>

              {/* Message Input Area */}
              <CardFooter className="p-4 border-t">
                <div className="flex w-full items-center space-x-2">
                  <Input
                    type="text"
                    placeholder={t('sendMessagePlaceholder')}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sendingMessage}
                    className="flex-grow"
                  />
                  <Button type="button" size="icon" onClick={handleSendMessage} disabled={sendingMessage || !newMessage.trim()}>
                    {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="sr-only">{t('sendButton')}</span>
                  </Button>
                </div>
              </CardFooter>
            </>
          ) : (
            <div className="flex flex-grow items-center justify-center text-muted-foreground">
              {loadingChats ? <Loader2 className="h-8 w-8 animate-spin" /> : <p>{t('noChats')}</p> }
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
