
"use client";

import React, { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { getPsychologicalTraits, compareFaces } from '@/services/face-analysis';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ScanFace, Users, Percent, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * @typedef {object} AnalysisResult
 * @property {number} [extroversion] - Estimated extroversion score.
 * @property {number} [agreeableness] - Estimated agreeableness score.
 */
interface AnalysisResult {
  extroversion?: number;
  agreeableness?: number;
}

/**
 * @fileOverview Implements the Facial Analysis and Matching page.
 * @module FacialAnalysisMatching
 * @description A component for the Facial Analysis and Matching page, allowing users to upload or provide URLs for two images,
 *              analyzes them (simulated), and displays mock psychological traits and a compatibility score.
 *              **Requires Backend:** Real face analysis API integration.
 */
export default function FacialAnalysisMatching() {
  const t = useTranslations('FacialAnalysisMatching');
  const { toast } = useToast();

  const [image1Url, setImage1Url] = useState('');
  const [image2Url, setImage2Url] = useState('');
  const [analysis1, setAnalysis1] = useState<AnalysisResult | null>(null);
  const [analysis2, setAnalysis2] = useState<AnalysisResult | null>(null);
  const [compatibility, setCompatibility] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles the input change event for image URLs.
   * @param {ChangeEvent<HTMLInputElement>} event - The change event.
   * @param {1 | 2} imageNumber - Indicates which image URL is being changed.
   */
  const handleImageUrlChange = (event: ChangeEvent<HTMLInputElement>, imageNumber: 1 | 2) => {
    const value = event.target.value;
    if (imageNumber === 1) {
      setImage1Url(value);
    } else {
      setImage2Url(value);
    }
    // Clear results when URL changes
    setAnalysis1(null);
    setAnalysis2(null);
    setCompatibility(null);
    setError(null);
  };

  /**
   * Handles the analysis and comparison of the faces.
   * @async
   */
  const handleAnalysis = async () => {
    setError(null);
    setAnalysis1(null);
    setAnalysis2(null);
    setCompatibility(null);
    setIsLoading(true);

    if (!image1Url || !image2Url) {
      setError(t('errorMissingImageUrl'));
      toast({ variant: "destructive", title: t('errorTitle'), description: t('errorMissingImageUrl') });
      setIsLoading(false);
      return;
    }

    try {
      // --- Simulate API calls ---
      // In a real app, replace these with actual API calls to a face analysis service.
      // These promises simulate the asynchronous nature of API requests.

      const [result1, result2] = await Promise.all([
        getPsychologicalTraits({ imageUrl: image1Url }), // Analyze face 1
        getPsychologicalTraits({ imageUrl: image2Url })  // Analyze face 2
      ]);

      setAnalysis1(result1);
      setAnalysis2(result2);

      // Compare faces only if both analyses were successful
      if (result1 && result2) {
        const compatibilityScore = await compareFaces({ imageUrl: image1Url }, { imageUrl: image2Url });
        setCompatibility(compatibilityScore);
        toast({ title: t('analysisSuccessTitle'), description: t('analysisSuccessDesc') });
      } else {
        // Handle cases where one or both analyses might fail partially in a real API
         throw new Error(t('partialFailureError'));
      }

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : t('unknownError');
      console.error("Analysis failed:", err);
      setError(t('errorAnalysisFailed', { message: errorMessage }));
      toast({ variant: "destructive", title: t('errorTitle'), description: t('errorAnalysisFailed', { message: errorMessage }) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto shadow-lg border">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
                <ScanFace className="h-8 w-8 text-primary" />
                {t('title')}
            </CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             {error && (
                 <Alert variant="destructive">
                   <AlertCircle className="h-4 w-4" />
                   <AlertTitle>{t('errorTitle')}</AlertTitle>
                   <AlertDescription>{error}</AlertDescription>
                 </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Image 1 Input & Display */}
                <Card className="border-dashed border-2 p-4 flex flex-col items-center space-y-3 min-h-[300px] justify-center">
                    <Input
                    type="url" // Use type="url" for better semantics
                    placeholder={t('image1UrlPlaceholder')}
                    value={image1Url}
                    onChange={(e) => handleImageUrlChange(e, 1)}
                    disabled={isLoading}
                    aria-label={t('image1UrlPlaceholder')}
                    className="w-full"
                    />
                    {image1Url && (
                        <Image
                        src={image1Url}
                        alt={t('imageAlt', { number: 1 })}
                        width={200}
                        height={200}
                        className="rounded-md object-cover aspect-square"
                        data-ai-hint="person portrait" // Generic hint
                        onError={() => setError(t('imageLoadError', { number: 1 }))} // Basic error handling
                        />
                    )}
                    {!image1Url && <div className="text-muted-foreground text-sm">{t('enterUrlPrompt')}</div>}
                </Card>

                 {/* Image 2 Input & Display */}
                <Card className="border-dashed border-2 p-4 flex flex-col items-center space-y-3 min-h-[300px] justify-center">
                    <Input
                    type="url"
                    placeholder={t('image2UrlPlaceholder')}
                    value={image2Url}
                    onChange={(e) => handleImageUrlChange(e, 2)}
                    disabled={isLoading}
                    aria-label={t('image2UrlPlaceholder')}
                    className="w-full"
                    />
                     {image2Url && (
                        <Image
                        src={image2Url}
                        alt={t('imageAlt', { number: 2 })}
                        width={200}
                        height={200}
                        className="rounded-md object-cover aspect-square"
                         data-ai-hint="person smiling" // Generic hint
                        onError={() => setError(t('imageLoadError', { number: 2 }))}
                        />
                    )}
                    {!image2Url && <div className="text-muted-foreground text-sm">{t('enterUrlPrompt')}</div>}
                </Card>
            </div>

             <div className="text-center mt-6">
                <Button onClick={handleAnalysis} disabled={isLoading || !image1Url || !image2Url} size="lg">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
                  {isLoading ? t('analyzingButton') : t('analyzeAndCompareButton')}
                </Button>
             </div>

            {/* Results Section */}
            {(isLoading || analysis1 || analysis2 || compatibility !== null) && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Analysis 1 Card */}
                <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{t('analysisResult1')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {isLoading && !analysis1 ? (
                    <>
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </>
                    ) : analysis1 ? (
                    <>
                        <p className="text-sm">{t('extroversion')}: <span className="font-medium">{(analysis1.extroversion ?? 0 * 100).toFixed(0)}%</span></p>
                        <p className="text-sm">{t('agreeableness')}: <span className="font-medium">{(analysis1.agreeableness ?? 0 * 100).toFixed(0)}%</span></p>
                    </>
                    ) : (
                         <p className="text-sm text-muted-foreground">{t('noResults')}</p>
                    )}
                </CardContent>
                </Card>

                 {/* Analysis 2 Card */}
                <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{t('analysisResult2')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                     {isLoading && !analysis2 ? (
                    <>
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </>
                    ) : analysis2 ? (
                    <>
                        <p className="text-sm">{t('extroversion')}: <span className="font-medium">{(analysis2.extroversion ?? 0 * 100).toFixed(0)}%</span></p>
                        <p className="text-sm">{t('agreeableness')}: <span className="font-medium">{(analysis2.agreeableness ?? 0 * 100).toFixed(0)}%</span></p>
                    </>
                     ) : (
                         <p className="text-sm text-muted-foreground">{t('noResults')}</p>
                    )}
                </CardContent>
                </Card>

                 {/* Compatibility Card */}
                <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Percent className="h-5 w-5 text-primary"/>{t('compatibilityScore')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    {isLoading && compatibility === null ? (
                         <Skeleton className="h-10 w-1/2 mx-auto" />
                    ) : compatibility !== null ? (
                         <p className="text-4xl font-bold">{compatibility.toFixed(0)}<span className="text-xl">%</span></p>
                    ) : (
                        <p className="text-sm text-muted-foreground">{t('noResults')}</p>
                    )}
                </CardContent>
                </Card>
            </div>
            )}

          </CardContent>
      </Card>
    </div>
  );
}
