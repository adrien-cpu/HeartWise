"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { analyzeTextForRiskyWords, RiskyWordAnalysis } from '@/ai/flows/risky-words-dictionary';
import { submitRiskyWordFeedback, reportMissedRiskyWord } from '@/services/feedback_service';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertTriangle, Check, Send, ShieldAlert, Trash2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { moderateText, ModerationResult } from '@/services/moderation_service';
import { firestore } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * RiskyWordsDictionaryPage component.
 *
 * @component
 * @description Displays an interface for analyzing text using the Risky Words Dictionary AI flow.
 * @returns {JSX.Element} The rendered RiskyWordsDictionaryPage component.
 */
const RiskyWordsDictionaryPage = () => {
  const t = useTranslations('RiskyWordsDictionary');
  const tChat = useTranslations('Chat'); // For moderation messages
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<RiskyWordAnalysis[]>([]);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [submittingFeedbackId, setSubmittingFeedbackId] = useState<string | null>(null);
  const [submittedFeedbackItems, setSubmittedFeedbackItems] = useState<{ [itemId: string]: 'accurate' | 'not_risky' }>({});

  const [missedWordReport, setMissedWordReport] = useState('');
  const [missedWordReason, setMissedWordReason] = useState('');
  const [isSubmittingMissedWord, setIsSubmittingMissedWord] = useState(false);

  const [riskyWords, setRiskyWords] = useState<any[]>([]);
  const [newWord, setNewWord] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) {
        // If you want to show a message or redirect, you can do that here.
        // For now, we just won't fetch the data.
        setLoading(false);
        return;
    }

    const q = query(collection(firestore, "riskyWords"), where("userId", "==", currentUser.uid));
    
    setLoading(true);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const words: any[] = [];
      querySnapshot.forEach((doc) => {
        words.push({ id: doc.id, ...doc.data() });
      });
      setRiskyWords(words);
      setLoading(false);
    }, (err) => {
        console.error("Error fetching risky words: ", err);
        setError("Failed to fetch your risky words dictionary. Please try again later.");
        setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
        await addDoc(collection(firestore, "riskyWords"), {
          word: newWord.toLowerCase().trim(),
          userId: currentUser.uid,
        });
        setNewWord("");
    } catch (err) {
        console.error("Error adding word: ", err);
        setError("Failed to add the word. Please try again.")
    } finally {
        setIsSubmitting(false);
    }
  };

  const deleteWord = async (wordId: string) => {
    try {
        await deleteDoc(doc(firestore, "riskyWords", wordId));
    } catch (err) {
        console.error("Error deleting word: ", err);
        setError("Failed to delete the word. Please try again.");
    }
  };

  const handleAnalyzeText = async () => {
    if (!inputText.trim()) {
      toast({
        variant: 'destructive',
        title: t('errorTitle'),
        description: t('emptyInputError'),
      });
      return;
    }

    setIsLoadingAnalysis(true);
    setAnalysisError(null);
    setAnalysisResult([]);
    setSubmittedFeedbackItems({});

    // First, moderate the input text
    const moderationResult: ModerationResult = await moderateText(inputText.trim());
    if (!moderationResult.isSafe) {
      toast({
        variant: 'destructive',
        title: tChat('moderationBlockTitle'),
        description: `${t('moderationFailedBeforeAnalysis')} ${moderationResult.issues?.map(issue => issue.category).join(', ')}`,
        duration: 7000,
      });
      setIsLoadingAnalysis(false);
      return;
    }

    try {
      const result = await analyzeTextForRiskyWords({ textToAnalyze: inputText });
      setAnalysisResult(result.analysis);
      if (result.analysis.length === 0) {
        toast({
          title: t('analysisComplete'),
          description: t('noRiskyWordsFound'),
        });
      } else {
        toast({
          title: t('analysisComplete'),
          description: t('riskyWordsFound', { count: result.analysis.length }),
        });
      }
    } catch (err: any) {
      console.error("Error analyzing text for risky words:", err);
      setAnalysisError(t('analysisError'));
      toast({
        variant: 'destructive',
        title: t('errorTitle'),
        description: t('analysisError'),
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };
  
  if (!currentUser) {
    return (
        <div className="container mx-auto p-4 flex justify-center">
             <Alert variant="destructive" className="max-w-lg">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>You must be logged in to manage your risky words dictionary.</AlertDescription>
            </Alert>
        </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>My Risky Words Dictionary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600">
            Add words to this dictionary to get alerts in your chats. This can help you avoid topics you find sensitive or uncomfortable.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>An Error Occurred</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={addWord} className="flex items-center space-x-2 mb-4">
            <Input 
                value={newWord} 
                onChange={e => setNewWord(e.target.value)} 
                placeholder="Add a new word..." 
                disabled={isSubmitting}
            />
            <Button type="submit" disabled={isSubmitting || !newWord.trim()}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </Button>
          </form>

          <h3 className="font-semibold mb-2">Your Words:</h3>
          {loading ? (
            <Loader2 className="mx-auto my-4 h-8 w-8 animate-spin" />
          ) : riskyWords.length > 0 ? (
            <ScrollArea className="h-60 w-full rounded-md border">
              <div className="p-4">
                {riskyWords.map(word => (
                  <div key={word.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                    <span className="text-gray-800">{word.word}</span>
                    <Button variant="ghost" size="icon" onClick={() => deleteWord(word.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-center text-gray-500 py-4">Your dictionary is empty.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default RiskyWordsDictionaryPage;
