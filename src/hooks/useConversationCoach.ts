import { useState } from 'react';
import { getConversationAdvice } from '@/ai/flows/conversation-coach';
import { getStyleSuggestions, StyleSuggestion } from '@/ai/flows/style-suggestions-flow';

interface ConversationCoachHook {
    conversationHistory: string;
    setConversationHistory: (history: string) => void;
    user1Profile: string;
    setUser1Profile: (profile: string) => void;
    user2Profile: string;
    setUser2Profile: (profile: string) => void;
    userComfortLevel: string;
    setUserComfortLevel: (level: string) => void;
    advice: string;
    styleSuggestions: StyleSuggestion[];
    isLoadingAdvice: boolean;
    isLoadingStyles: boolean;
    getAdvice: () => Promise<void>;
    getStyleSuggestions: () => Promise<void>;
}

export const useConversationCoach = (): ConversationCoachHook => {
    const [conversationHistory, setConversationHistory] = useState('');
    const [advice, setAdvice] = useState('');
    const [user1Profile, setUser1Profile] = useState('');
    const [user2Profile, setUser2Profile] = useState('');
    const [userComfortLevel, setUserComfortLevel] = useState('');
    const [styleSuggestions, setStyleSuggestions] = useState<StyleSuggestion[]>([]);
    const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
    const [isLoadingStyles, setIsLoadingStyles] = useState(false);

    const getAdvice = async () => {
        if (!conversationHistory || !user1Profile || !user2Profile) {
            // Handle error, e.g., show a toast. This should ideally be handled in the UI component
            // that uses the hook, but for now, we'll keep the logic here for migration.
            console.error("Missing required input for getting advice.");
            return;
        }
        setIsLoadingAdvice(true);
        setAdvice('');
        try {
            const result = await getConversationAdvice({
                conversationHistory: conversationHistory,
                user1Profile: user1Profile,
                user2Profile: user2Profile,
            });
            setAdvice(result.advice);
        } catch (error) {
            console.error("Error generating advice:", error);
            // Handle error, e.g., show a toast.
        } finally {
            setIsLoadingAdvice(false);
        }
    };

    const getStyleSuggestions = async () => {
         if (!user1Profile || !user2Profile) {
            // Handle error, e.g., show a toast.
             console.error("Missing required input for getting style suggestions.");
             return;
         }
        setIsLoadingStyles(true);
        setStyleSuggestions([]);
        try {
            const result = await getStyleSuggestions({
                userProfile: user1Profile,
                partnerProfile: user2Profile,
                conversationContext: conversationHistory,
                userComfortLevel: userComfortLevel,
            });
            setStyleSuggestions(result.suggestions);
        } catch (error) {
            console.error("Error generating style suggestions:", error);
            // Handle error, e.g., show a toast.
        } finally {
            setIsLoadingStyles(false);
        }
    };

    return {
        conversationHistory,
        setConversationHistory,
        user1Profile,
        setUser1Profile,
        user2Profile,
        setUser2Profile,
        userComfortLevel,
        setUserComfortLevel,
        advice,
        styleSuggestions,
        isLoadingAdvice,
        isLoadingStyles,
        getAdvice,
        getStyleSuggestions,
    };
};
