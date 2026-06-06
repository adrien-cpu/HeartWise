import { useState } from 'react';
import { getConversationAdvice } from '@/ai/flows/conversation-coach';
import { getStyleSuggestions, StyleSuggestion, StyleSuggestionsInput } from '@/ai/flows/style-suggestions-flow'; // StyleSuggestion is now correctly imported as a type

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
    setIsLoadingAdvice: (loading: boolean) => void;
    setIsLoadingStyles: (loading: boolean) => void;
    getAdvice: () => Promise<void>;
    getStyleSuggestions: (input?: Partial<StyleSuggestionsInput>) => Promise<void>;
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
            console.error("Missing required input for getting advice.");
            setAdvice("Error: Missing required fields to get advice."); // Provide feedback
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
            setAdvice("Error: Could not generate advice at this time."); // Provide feedback
        } finally {
            setIsLoadingAdvice(false);
        }
    };

    const handleGetStyleSuggestions = async (input?: Partial<StyleSuggestionsInput>) => {
        const finalInput: StyleSuggestionsInput = {
            userProfile: input?.userProfile || user1Profile,
            partnerProfile: input?.partnerProfile || user2Profile,
            conversationContext: input?.conversationContext || conversationHistory,
            userComfortLevel: input?.userComfortLevel || userComfortLevel,
        };

        if (!finalInput.userProfile || !finalInput.partnerProfile) {
            console.error("Missing required input for getting style suggestions (userProfile or partnerProfile).");
            setStyleSuggestions([{ styleName: "Error", description: "Missing profile information.", examples: [] }]); // Provide feedback
            return;
        }
        setIsLoadingStyles(true);
        setStyleSuggestions([]);
        try {
            const result = await getStyleSuggestions(finalInput);
            setStyleSuggestions(result.suggestions);
        } catch (error) {
            console.error("Error generating style suggestions:", error);
            setStyleSuggestions([{ styleName: "Error", description: "Could not generate style suggestions.", examples: [] }]); // Provide feedback
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
        setIsLoadingAdvice,
        setIsLoadingStyles,
        getAdvice,
        getStyleSuggestions: handleGetStyleSuggestions, // Assign the new handler
    };
};
