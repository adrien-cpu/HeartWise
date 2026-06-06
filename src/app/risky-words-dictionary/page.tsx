"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { analyzeTextForRiskyWords, RiskyWordAnalysis } from '@/ai/flows/risky-words-dictionary';
import { submitRiskyWordFeedback, reportMissedRiskyWord } from '@/services/feedback_service';
import { useAuthContext } from '@/contexts/AuthContext';
import { Loader2, AlertTriangle, Check, Send, ShieldAlert } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { moderateText, ModerationResult } from '@/services/moderation_service';

/**
 * @fileOverview Implements the Risky Words Dictionary page component.
 * Allows users to input text, receive analysis on potentially risky phrases,
 * provide feedback on flagged items, and report words/phrases missed by the AI.
 * Includes content moderation check before analysis and requires authentication for feedback.
 */

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
  const { user: currentUser } = useAuthContext();

  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<RiskyWordAnalysis[]>([]);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [submittingFeedbackId, setSubmittingFeedbackId] = useState<string | null>(null);
  const [submittedFeedbackItems, setSubmittedFeedbackItems] = useState<{ [itemId: string]: 'accurate' | 'not_risky' }>({});

  const [missedWordReport, setMissedWordReport] = useState('');
  const [missedWordReason, setMissedWordReason] = useState('');
  const [isSubmittingMissedWord, setIsSubmittingMissedWord] = useState(false);


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

  const handleFeedbackSubmit = async (item: RiskyWordAnalysis, feedbackType: 'accurate' | 'not_risky') => {
    if (!currentUser) {
      toast({ variant: 'destructive', title: t('errorTitle'), description: t('authRequiredError') });
      return;
    }
    if (submittedFeedbackItems[item.id]) {
      toast({ variant: 'default', title: t('feedbackAlreadySubmittedTitle'), description: t('feedbackAlreadySubmittedDesc') });
      return;
    }

    setSubmittingFeedbackId(item.id);
    try {
      await submitRiskyWordFeedback({
        userId: currentUser.uid,
        originalText: inputText,
        flaggedWord: item.word,
        feedbackType: feedbackType,
        analysisItemId: item.id,
      });
      setSubmittedFeedbackItems(prev => ({ ...prev, [item.id]: feedbackType }));
      toast({ title: t('feedbackThanksTitle'), description: t('feedbackThanksDesc') });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({ variant: 'destructive', title: t('errorTitle'), description: t('feedbackSubmitError') });
    } finally {
      setSubmittingFeedbackId(null);
    }
  };

  const handleReportMissedWord = async () => {
    if (!currentUser) {
      toast({ variant: 'destructive', title: t('errorTitle'), description: t('authRequiredError') });
      return;
    }
    if (!missedWordReport.trim()) {
      toast({ variant: 'destructive', title: t('errorTitle'), description: t('missedWordEmptyError') });
      return;
    }
    setIsSubmittingMissedWord(true);
    try {
      await reportMissedRiskyWord({
        userId: currentUser.uid,
        originalText: inputText,
        missedWord: missedWordReport,
        reason: missedWordReason,
      });
      toast({ title: t('reportSubmittedTitle'), description: t('reportSubmittedDesc') });
      setMissedWordReport('');
      setMissedWordReason('');
    } catch (error) {
      console.error('Error reporting missed word:', error);
      toast({ variant: 'destructive', title: t('errorTitle'), description: t('reportSubmitError') });
    } finally {
      setIsSubmittingMissedWord(false);
    }
  };


  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">{t('title')}</h1>
      <p className="text-center text-muted-foreground mb-6">{t('description')}</p>

      <Card className="max-w-2xl mx-auto shadow-lg border">
        <CardHeader>
          <CardTitle>{t('inputTextTitle')}</CardTitle>
          <CardDescription>{t('inputTextDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="message">{t('messageLabel')}</Label>
            <Textarea
              id="message"
              placeholder={t('placeholder')}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={5}
              disabled={isLoadingAnalysis}
              aria-describedby="message-description"
            />
            <p id="message-description" className="text-xs text-muted-foreground">{t('messageHelperText')}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAnalyzeText} disabled={isLoadingAnalysis || !inputText.trim()}>
            {isLoadingAnalysis && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoadingAnalysis ? t('analyzingButton') : t('analyzeButton')}
          </Button>
        </CardFooter>
      </Card>

      {analysisError && (
        <Alert variant="destructive" className="max-w-2xl mx-auto mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('errorTitle')}</AlertTitle>
          <AlertDescription>{analysisError}</AlertDescription>
        </Alert>
      )}

      {analysisResult.length > 0 && (
        <Card className="max-w-2xl mx-auto mt-8 shadow-lg border">
          <CardHeader>
            <CardTitle>{t('analysisResultsTitle')}</CardTitle>
            <CardDescription>{t('analysisResultsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {analysisResult.map((item) => (
                <AccordionItem value={item.id} key={item.id}>
                  <AccordionTrigger>
                    <span className="flex items-center gap-2 text-left">
                      <ShieldAlert className="h-4 w-4 text-destructive flex-shrink-0" />
                      &quot;{item.word}&quot;
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pl-6">
                    <div>
                      <h4 className="font-semibold mb-1 text-sm">{t('possibleInterpretations')}</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {item.possibleInterpretations.map((interp, i) => (
                          <li key={i}>{interp}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 text-sm">{t('clarificationSuggestion')}</h4>
                      <p className="text-sm text-muted-foreground italic">&quot;{item.clarificationSuggestion}&quot;</p>
                    </div>
                    {currentUser ? (
                      <div>
                        <h4 className="font-semibold text-sm mt-4 mb-2">{t('feedbackTitle')}</h4>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant={submittedFeedbackItems[item.id] === 'accurate' ? 'default' : 'outline'}
                            onClick={() => handleFeedbackSubmit(item, 'accurate')}
                            disabled={submittingFeedbackId === item.id || !!submittedFeedbackItems[item.id]}
                            aria-live="polite"
                          >
                            {submittingFeedbackId === item.id && submittedFeedbackItems[item.id] !== 'accurate' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {submittedFeedbackItems[item.id] === 'accurate' && <Check className="mr-2 h-4 w-4" />}
                            {t('feedbackAccurate')}
                          </Button>
                          <Button
                            size="sm"
                            variant={submittedFeedbackItems[item.id] === 'not_risky' ? 'default' : 'outline'}
                            onClick={() => handleFeedbackSubmit(item, 'not_risky')}
                            disabled={submittingFeedbackId === item.id || !!submittedFeedbackItems[item.id]}
                            aria-live="polite"
                          >
                            {submittingFeedbackId === item.id && submittedFeedbackItems[item.id] !== 'not_risky' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {submittedFeedbackItems[item.id] === 'not_risky' && <Check className="mr-2 h-4 w-4" />}
                            {t('feedbackNotRisky')}
                          </Button>
                        </div>
                        {submittedFeedbackItems[item.id] && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {t('feedbackThanks')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-3">{t('loginForFeedback')}</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
      {!isLoadingAnalysis && analysisResult.length === 0 && inputText && !analysisError && (
        <p className="mt-6 text-center text-muted-foreground">{t('noRiskyWordsFound')}</p>
      )}

      {currentUser && (
        <Card className="max-w-2xl mx-auto mt-8 shadow-lg border">
          <CardHeader>
            <CardTitle>{t('reportMissedTitle')}</CardTitle>
            <CardDescription>{t('reportMissedDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="missedWordInput">{t('missedWordLabel')}</Label>
              <Input
                id="missedWordInput"
                placeholder={t('missedWordPlaceholder')}
                value={missedWordReport}
                onChange={(e) => setMissedWordReport(e.target.value)}
                disabled={isSubmittingMissedWord}
                aria-describedby="missedWordInput-description"
              />
              <p id="missedWordInput-description" className="text-xs text-muted-foreground">{t('missedWordHelperText')}</p>
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="missedWordReason">{t('missedWordReasonLabel')}</Label>
              <Textarea
                id="missedWordReason"
                placeholder={t('missedWordReasonPlaceholder')}
                value={missedWordReason}
                onChange={(e) => setMissedWordReason(e.target.value)}
                rows={2}
                disabled={isSubmittingMissedWord}
                aria-describedby="missedWordReason-description"
              />
              <p id="missedWordReason-description" className="text-xs text-muted-foreground">{t('missedWordReasonHelperText')}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleReportMissedWord}
              disabled={isSubmittingMissedWord || !missedWordReport.trim()}
            >
              {isSubmittingMissedWord && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" />
              {t('submitReportButton')}
            </Button>
          </CardFooter>
        </Card>
      )}
      {!currentUser && (
        <p className="max-w-2xl mx-auto text-center text-muted-foreground">{t('loginForFeedback')}</p>
      )}
    </div>
  );
};

export default RiskyWordsDictionaryPage;