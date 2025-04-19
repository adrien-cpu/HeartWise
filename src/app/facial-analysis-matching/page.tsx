;"use client";

import {useState} from 'react';
import {FaceData, getPsychologicalTraits} from '@/services/face-analysis';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useTranslations} from 'next-intl';

/**
 * @fileOverview Facial Analysis & Matching page component.
 *
 * @module FacialAnalysisMatching
 *
 * @description This component provides an interface for users to input an image URL,
 * then analyzes the image to determine psychological traits.  It uses the
 * `getPsychologicalTraits` function from the face-analysis service.
 */

/**
 * FacialAnalysisMatching component.
 *
 * @component
 * @description A client component that analyzes facial images and determines psychological traits.
 * @returns {JSX.Element} The rendered Facial Analysis & Matching page.
 */
export default function FacialAnalysisMatching() {
  const [imageUrl, setImageUrl] = useState('');
  const [traits, setTraits] = useState(null);
  const [error, setError] = useState(null);
  const t = useTranslations('FacialAnalysisMatching');

  /**
   * Handles the change of the image URL input.
   * @function handleImageUrlChange
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event.
   * @returns {void}
   */
  const handleImageUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(event.target.value);
  };

  /**
   * Handles the analysis of the image.
   * @async
   * @function handleAnalysis
   * @returns {Promise<void>}
   */
  const handleAnalysis = async () => {
    try {
      const faceData: FaceData = {imageUrl: imageUrl};
      const psychologicalTraits = await getPsychologicalTraits(faceData);
      setTraits(psychologicalTraits);
      setError(null);
    } catch (error: any) {
      setTraits(null);
      setError(error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <div className="mb-4">
        <Input
          type="text"
          placeholder={t('imageUrlPlaceholder')}
          value={imageUrl}
          onChange={handleImageUrlChange}
        />
      </div>
      <Button onClick={handleAnalysis}>{t('analyzeButton')}</Button>
      {error && <div className="text-red-500 mt-4">Error: {error}</div>}
      {traits && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">
            {t('psychologicalTraitsTitle')}:
          </h2>
          <p>{t('extroversionLabel')}: {traits.extroversion}</p>
          <p>{t('agreeablenessLabel')}: {traits.agreeableness}</p>
        </div>
      )}
    </div>
  );
}
