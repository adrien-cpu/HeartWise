"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Loader2, Send, Sparkles, Eye, RefreshCw } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from "@/types/UserProfile";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { firestore } from '@/lib/firebase';
import { calculateTraitCompatibility, generateBlindExchangeDescription } from '@/services/compatibility';
import Image from 'next/image';

interface Message {
  id: string;
  sender: 'user' | 'partner' | 'system';
  text: string;
  timestamp: Date;
}

interface RevealedInfo {
  interests: string[];
  bioSnippets: string[];
  photoUrl?: string;
}

export default function BlindExchangeModePage() {
  const t = useTranslations("BlindExchangeMode");
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [matchPartner, setMatchPartner] = useState<UserProfile | null>(null);
  const [aiDescription, setAiDescription] = useState<string>("");
  const [compatibility, setCompatibility] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [revealedInfo, setRevealedInfo] = useState<RevealedInfo>({ interests: [], bioSnippets: [], photoUrl: undefined });
  const [totalMessagesSent, setTotalMessagesSent] = useState(0);
  const [lastRevealedMilestoneIndex, setLastRevealedMilestoneIndex] = useState(-1);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // --- Data Fetching and Matching Logic ---
  const findMatch = async (profile: UserProfile) => {
    setIsLoading(true);
    try {
      const usersCollectionRef = collection(firestore, "users");
      const usersSnapshot = await getDocs(usersCollectionRef);
      const allUsers: UserProfile[] = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
        .filter(p => p.id !== profile.id && p.questionnaireAnswers); // Find other users with questionnaire data

      if (allUsers.length === 0) {
        toast({ variant: 'destructive', title: t('noMatchesTitle'), description: t('noMatchesDesc') });
        setIsLoading(false);
        return;
      }

      const randomPartner = allUsers[Math.floor(Math.random() * allUsers.length)];
      setMatchPartner(randomPartner);

      const compatScore = calculateTraitCompatibility(profile, randomPartner);
      setCompatibility(compatScore);

      const description = generateBlindExchangeDescription(profile, randomPartner);
      setAiDescription(description);
      
      resetChatAndRevealState(randomPartner.name || t('mysteryPartner'));

    } catch (error) {
      console.error("Error finding match:", error);
      toast({ variant: 'destructive', title: t('errorLoadingProfileTitle'), description: t('errorLoadingProfileDesc') });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchUserProfile = async () => {
      const userDocRef = doc(firestore, "users", user.id);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userProfileData = { id: user.id, ...userDocSnap.data() } as UserProfile;
        setCurrentUserProfile(userProfileData);
        findMatch(userProfileData);
      } else {
        setIsLoading(false);
        toast({ variant: 'destructive', title: t('errorLoadingProfileTitle') });
      }
    };

    fetchUserProfile();
  }, [user, authLoading, t, toast]);

  // --- Chat and Reveal Logic ---
  const getRevealMilestones = (partner: UserProfile) => {
      const partnerInterests = partner.interests || [];
      const partnerBio = partner.bio || "";
      // Simple bio splitting for snippets.
      const bioSnippets = partnerBio.match(/[^.!?]+[.!?]*/g)?.slice(0, 2) || [t('defaultBioSnippet')];

      return [
        { messages: 2, type: 'interest', value: partnerInterests[0], textKey: 'revealedInterest' },
        { messages: 4, type: 'bio', value: bioSnippets[0], textKey: 'revealedBioSnippet' },
        { messages: 6, type: 'interest', value: partnerInterests[1], textKey: 'revealedInterest' },
        { messages: 8, type: 'bio', value: bioSnippets[1], textKey: 'revealedBioSnippet' },
        { messages: 10, type: 'interest', value: partnerInterests[2], textKey: 'revealedInterest' },
        { messages: 12, type: 'photo', value: partner.profilePicture, textKey: 'revealedPhoto' },
      ].filter(m => m.value); // Filter out milestones with no data
  };
  
  const resetChatAndRevealState = (partnerName: string) => {
      setMessages([{
          id: 'system-init',
          sender: 'system',
          text: t('initialSystemMessage', { partnerName }),
          timestamp: new Date()
      }]);
      setRevealedInfo({ interests: [], bioSnippets: [], photoUrl: undefined });
      setTotalMessagesSent(0);
      setLastRevealedMilestoneIndex(-1);
      setUserInput('');
  }

  useEffect(() => {
    if (!matchPartner || totalMessagesSent === 0) return;

    const REVEAL_MILESTONES = getRevealMilestones(matchPartner);
    let somethingRevealed = false;
    let revealedItemsMessages: string[] = [];

    REVEAL_MILESTONES.forEach((milestone, index) => {
        if (index > lastRevealedMilestoneIndex && totalMessagesSent >= milestone.messages) {
            let newItemRevealed = false;

            setRevealedInfo(prev => {
                const newRevealed = { ...prev };
                if (milestone.type === 'interest' && !newRevealed.interests.includes(milestone.value)) {
                    newRevealed.interests = [...newRevealed.interests, milestone.value];
                    newItemRevealed = true;
                } else if (milestone.type === 'bio' && !newRevealed.bioSnippets.includes(milestone.value)) {
                    newRevealed.bioSnippets = [...newRevealed.bioSnippets, milestone.value];
                    newItemRevealed = true;
                } else if (milestone.type === 'photo' && !newRevealed.photoUrl) {
                    newRevealed.photoUrl = milestone.value;
                    newItemRevealed = true;
                }
                return newItemRevealed ? newRevealed : prev;
            });

            if (newItemRevealed) {
                somethingRevealed = true;
                setLastRevealedMilestoneIndex(index);
                const systemMessageText = t(milestone.textKey, { value: milestone.type === 'photo' ? t('photo') : milestone.value });
                revealedItemsMessages.push(systemMessageText);
            }
        }
    });

    if (somethingRevealed) {
        toast({ title: t('infoRevealedTitle'), description: t('infoRevealedDesc') });
        const systemMessages: Message[] = revealedItemsMessages.map((text, i) => ({ id: `sys-rev-${lastRevealedMilestoneIndex}-${i}`, sender: 'system', text, timestamp: new Date() }));
        setMessages(prev => [...prev, ...systemMessages]);
    }

  }, [totalMessagesSent, lastRevealedMilestoneIndex, matchPartner, toast, t]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || !matchPartner) return;
    setIsSending(true);

    const userMessage: Message = { id: `msg-user-${Date.now()}`, sender: 'user', text: userInput, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setTotalMessagesSent(prev => prev + 1);
    setUserInput('');

    // Simulate partner's reply
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
    const partnerReplies = [ t('partnerReply1'), t('partnerReply2'), t('partnerReply3'), t('partnerReply4') ];
    const partnerMessage: Message = { id: `msg-partner-${Date.now()}`, sender: 'partner', text: partnerReplies[Math.floor(Math.random() * partnerReplies.length)], timestamp: new Date() };
    setMessages(prev => [...prev, partnerMessage]);
    setTotalMessagesSent(prev => prev + 1);
    setIsSending(false);
  };
  
  const handleFindNewMatch = () => {
      if(currentUserProfile) findMatch(currentUserProfile);
  }

  const getInitials = (name?: string): string => !name ? '?' : name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const partnerAvatar = revealedInfo.photoUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Transparent pixel

  if (authLoading || !currentUserProfile) {
      return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-muted-foreground">{t("loadingUser")}</p></div>
  }

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center space-y-6">
      <h1 className="text-3xl font-bold text-center">{t("title")}</h1>

      {isLoading ? (
        <Card className="w-full max-w-2xl p-6"><div className="flex flex-col items-center space-y-3"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="text-muted-foreground">{t("loadingProfile")}</p></div></Card>
      ) : matchPartner ? (
        <>
          <Card className="w-full max-w-2xl shadow-lg border">
            <CardHeader className="items-center text-center">
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" />{t("matchedProfileTitle")}</CardTitle>
              <div className="relative w-32 h-8 mx-auto my-2"><Progress value={compatibility} className="h-full" /><span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-primary-foreground">{compatibility}% {t('compatibilityLabel')}</span></div>
              <CardDescription className="italic text-sm">&quot;{aiDescription}&quot;</CardDescription>
            </CardHeader>
             <CardFooter className="flex justify-center">
                <Button variant="outline" onClick={handleFindNewMatch}><RefreshCw className="mr-2 h-4 w-4"/> {t('findNewMatch')}</Button>
            </CardFooter>
          </Card>

          <div className="w-full max-w-2xl grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 shadow-lg border h-[60vh] flex flex-col">
                <CardHeader><CardTitle>{t('chatTitle')}</CardTitle></CardHeader>
                <ScrollArea className="flex-grow p-4 space-y-4 bg-muted/20">
                {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex items-end space-x-2 max-w-[85%]", msg.sender === 'user' ? "ml-auto justify-end" : "mr-auto justify-start", msg.sender === 'system' ? "mx-auto justify-center w-full max-w-full" : "")}>
                    {msg.sender === 'partner' && <Avatar className="h-8 w-8 border self-start mt-1 flex-shrink-0"><AvatarImage src={partnerAvatar} alt={matchPartner.name || 'Partner'} /><AvatarFallback>?</AvatarFallback></Avatar>}
                    <div className={cn("rounded-lg px-3 py-2 shadow-sm text-sm", msg.sender === 'user' ? "bg-primary text-primary-foreground rounded-br-none" : msg.sender === 'partner' ? "bg-card text-card-foreground border rounded-bl-none" : "bg-accent text-accent-foreground w-fit mx-auto italic text-xs")}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        {msg.sender !== 'system' && <p className="text-xs text-right opacity-70 mt-1">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                    </div>
                    {msg.sender === 'user' && <Avatar className="h-8 w-8 border self-start mt-1 flex-shrink-0"><AvatarImage src={currentUserProfile.profilePicture} /><AvatarFallback>{getInitials(currentUserProfile.name)}</AvatarFallback></Avatar>}
                    </div>
                ))}
                <div ref={messagesEndRef} />
                </ScrollArea>
                <CardFooter className="p-4 border-t bg-card">
                <div className="flex w-full items-center space-x-2">
                    <Input type="text" placeholder={t('sendMessagePlaceholder')} value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSendMessage()} disabled={isSending} />
                    <Button onClick={handleSendMessage} disabled={isSending || !userInput.trim()} size="icon"><Send className="h-4 w-4" /></Button>
                </div>
                </CardFooter>
            </Card>

            <Card className="md:col-span-1 shadow-lg border h-fit sticky top-8">
                <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5 text-primary"/>{t('revealedInfoTitle')}</CardTitle><CardDescription>{t('revealedInfoDesc')}</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                {revealedInfo.photoUrl && <div className="flex flex-col items-center"><h4 className="font-semibold text-sm mb-1">{t('photo')}</h4><Image src={revealedInfo.photoUrl} alt={t('partnerPhotoAlt')} width={100} height={100} className="rounded-full border shadow-md"/></div>}
                {revealedInfo.interests.length > 0 && <div><h4 className="font-semibold text-sm mb-1">{t('revealedInterests')}</h4><div className="flex flex-wrap gap-1">{revealedInfo.interests.map((interest, i) => <Badge key={i} variant="secondary">{interest}</Badge>)}</div></div>}
                {revealedInfo.bioSnippets.length > 0 && <div><h4 className="font-semibold text-sm mb-1">{t('revealedBio')}</h4><ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2">{revealedInfo.bioSnippets.map((snippet, i) => <li key={i}>{snippet}</li>)}</ul></div>}
                {!revealedInfo.photoUrl && revealedInfo.interests.length === 0 && revealedInfo.bioSnippets.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{t('nothingRevealedYet')}</p>}
                {lastRevealedMilestoneIndex < getRevealMilestones(matchPartner).length - 1 && <div className="pt-4"><h4 className="font-semibold text-xs mb-1 text-muted-foreground">{t('nextRevealProgress')}</h4><Progress value={(totalMessagesSent / (getRevealMilestones(matchPartner)[lastRevealedMilestoneIndex + 1]?.messages || totalMessagesSent + 1)) * 100} className="h-2"/></div>}
                </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="w-full max-w-2xl p-6 text-center">
            <p className="text-muted-foreground">{t('noMatchesAvailable')}</p>
            <Button className="mt-4" onClick={handleFindNewMatch}><RefreshCw className="mr-2 h-4 w-4"/> {t('tryAgain')}</Button>
        </Card>
      )}
    </div>
  );
}
