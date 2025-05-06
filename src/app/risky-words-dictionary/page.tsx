'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { analyzeTextForRiskyWords, RiskyWordAnalysis } from '@/ai/flows/risky-words-dictionary';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';

/**
 * @fileOverview Implements the Risky Words Dictionary page component.
 * Allows users to input text and receive analysis on potentially risky or ambiguous phrases.
 */

/**
 * RiskyWordsDictionaryPage component.
 *
 * @component
 * @description Displays an interface for analyzing text using the Risky Words Dictionary AI flow.
 * @returns {JSX.Element} The rendered RiskyWordsDictionaryPage component.
 */
export default function RiskyWordsDictionaryPage() {
  const t = useTranslations('RiskyWordsDictionary');
  const { toast } = useToast();
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<RiskyWordAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles the analysis request when the button is clicked.
   * @async
   */
  const handleAnalyzeText = async () => {
    if (!inputText.trim()) {
      toast({
        variant: 'destructive',
        title: t('errorTitle'),
        description: t('emptyInputError'),
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult([]); // Clear previous results

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
      console.error("Error analyzing text:", err);
      setError(t('analysisError'));
      toast({
        variant: 'destructive',
        title: t('errorTitle'),
        description: t('analysisError'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">{t('title')}</h1>
      <p className="text-center text-muted-foreground mb-6">{t('description')}</p>

      <Card className="max-w-2xl mx-auto">
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
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAnalyzeText} disabled={isLoading || !inputText.trim()}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? t('analyzingButton') : t('analyzeButton')}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <p className="mt-4 text-center text-destructive">{error}</p>
      )}

      {analysisResult.length > 0 && (
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>{t('analysisResultsTitle')}</CardTitle>
             <CardDescription>{t('analysisResultsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {analysisResult.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      &quot;{item.word}&quot;
                    </span>
                   </AccordionTrigger>
                  <AccordionContent className="space-y-3 pl-6">
                    <div>
                        <h4 className="font-semibold mb-1">{t('possibleInterpretations')}</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {item.possibleInterpretations.map((interp, i) => (
                            <li key={i}>{interp}</li>
                          ))}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-1">{t('clarificationSuggestion')}</h4>
                        <p className="text-sm text-muted-foreground italic">&quot;{item.clarificationSuggestion}&quot;</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
       { !isLoading && analysisResult.length === 0 && inputText && !error && (
           <p className="mt-4 text-center text-muted-foreground">{t('noRiskyWordsFound')}</p>
       )}
    </div>
  );
}
