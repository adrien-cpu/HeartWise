"use client";

import Image from 'next/image';
import { analyzeFaceData, compareFaces } from '@/services/face-analysis'; // Réécriture de l'import
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface FaceData {
  imageUrl: string;
}

interface AnalysisResult {
  age?: number;
  gender?: string;
  emotion?: string;
}

/**
 * @fileOverview Implements the Facial Analysis and Matching page.
 */

/**
 * @function FacialAnalysisMatching
 * @description A component for the Facial Analysis and Matching page, allowing users to analyze and compare faces in two images.
 * @returns {JSX.Element} The rendered FacialAnalysisMatching component.
 */
export default function FacialAnalysisMatching() {
  const [image1Url, setImage1Url] = useState('');
  const [image2Url, setImage2Url] = useState('');
  const [analysis1, setAnalysis1] = useState<AnalysisResult | null>(null);
  const [analysis2, setAnalysis2] = useState<AnalysisResult | null>(null);
  const [compatibility, setCompatibility] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('FacialAnalysisMatching');

  /**
   * @function handleImage1UrlChange
   * @description Handles the input change event for the first image URL.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event.
   */
  const handleImage1UrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImage1Url(event.target.value);
  };

  /**
   * @function handleImage2UrlChange
   * @description Handles the input change event for the second image URL.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event.
   */
  const handleImage2UrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImage2Url(event.target.value);
  };

  /**
   * @async
   * @function handleAnalysis
   * @description Handles the analysis of the faces and their comparison.
   */
  const handleAnalysis = async () => {
    try {
      setError(null);
      setAnalysis1(null);
      setAnalysis2(null);
      setCompatibility(null);

      if (!image1Url || !image2Url) {
        setError(t('errorMissingImageUrl'));
        return;
      }

      // Analyze the first face
      const faceData1: FaceData = {imageUrl: image1Url};
      const analysisResult1 = await analyzeFaceData(faceData1);
      setAnalysis1(analysisResult1);

      // Analyze the second face
      const faceData2: FaceData = {imageUrl: image2Url};
      const analysisResult2 = await analyzeFaceData(faceData2);
      setAnalysis2(analysisResult2);

      // Compare the faces if both analyses are successful
      if (analysisResult1 && analysisResult2) {
        const compatibilityScore = await compareFaces(faceData1, faceData2);
        setCompatibility(compatibilityScore);
      }
    } catch (error: any) {
      setError(t('errorAnalysisFailed', {message: error.message || t('unknownError')}));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input type="text" placeholder={t('image1UrlPlaceholder')} value={image1Url} onChange={handleImage1UrlChange}/>
        <Input type="text" placeholder={t('image2UrlPlaceholder')} value={image2Url} onChange={handleImage2UrlChange}/>
      </div>

      <Button onClick={handleAnalysis}>{t('analyzeAndCompareButton')}</Button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysis1 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('analysisResult1')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Image src={image1Url} alt="Face 1" width={200} height={200} className="rounded-md mb-2"/>
              <p>{t('age')}: {analysis1.age}</p>
              <p>{t('gender')}: {analysis1.gender}</p>
              <p>{t('emotion')}: {analysis1.emotion}</p>
            </CardContent>
          </Card>
        )}

        {analysis2 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('analysisResult2')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Image src={image2Url} alt="Face 2" width={200} height={200} className="rounded-md mb-2"/>
              <p>{t('age')}: {analysis2.age}</p>
              <p>{t('gender')}: {analysis2.gender}</p>
              <p>{t('emotion')}: {analysis2.emotion}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {compatibility !== null && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold">{t('compatibilityScore')}</h2>
          <p className="text-3xl font-bold">{compatibility.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}
