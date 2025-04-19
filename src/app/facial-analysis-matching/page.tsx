"use client";

import {useState} from 'react';
import {FaceData, getPsychologicalTraits} from '@/services/face-analysis';
import {analyzeFaces} from '@/services/face-analysis';
import {Input} from "@/components/ui/input";
import {useTranslations} from 'next-intl';

/**
 * @fileOverview Facial Analysis & Matching page component.
 *
 * @module FacialAnalysisMatching
 * @description This component provides an interface for users to input an image URL,
 * then analyzes the image to determine psychological traits.  It uses the
 * `getPsychologicalTraits` function from the face-analysis service.
 */

/**
 * FacialAnalysisMatching component.
 * This component allows users to analyze facial similarities between a given image and a set of mock faces.
 *
 * @component
 * @description A client component that analyzes facial images and determines psychological traits.
 * @returns {JSX.Element} The rendered Facial Analysis & Matching page.
 */
export default function FacialAnalysisMatching() {
  const [imageUrl, setImageUrl] = useState('');
  const [traits, setTraits] = useState(null);
  const [error, setError] = useState(null);
  const [similarFaces, setSimilarFaces] = useState([]);
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

  /**
   * Analyzes facial similarities with mock data.
   * @async
   * @function handleSimilarityAnalysis
   * @description Creates mock face data, analyzes similarities, and updates the state with the results.
   * @returns {Promise<void>}
   */
  const handleSimilarityAnalysis = async () => {
    try {
      const mockFaces = [
        { id: '1', imageUrl: imageUrl },
        { id: '2', imageUrl: 'https://picsum.photos/50/50' },
        { id: '3', imageUrl: 'https://picsum.photos/50/50' },
        { id: '4', imageUrl: 'https://picsum.photos/50/50' },
        { id: '5', imageUrl: 'https://picsum.photos/50/50' },
      ];

      const analysisResults = await analyzeFaces(mockFaces);
      setSimilarFaces(analysisResults);
      setError(null);
    } catch (error: any) {
      setSimilarFaces([]);
      setError(error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <div className="mb-4">
        <Input type="text" placeholder={t('imageUrlPlaceholder')} value={imageUrl} onChange={handleImageUrlChange} />
      </div>

      <button onClick={handleSimilarityAnalysis} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        {t('analyzeSimilarityButton')}
      </button>

      {error && <div className="text-red-500 mt-4">Error: {error}</div>}

      {similarFaces.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">{t('similarFacesTitle')}</h2>
            <ul>
              {similarFaces.map((face, index) => (
                  <li key={face.id} className="mb-2"><img src={face.imageUrl} alt={`Face ${index + 1}`} className="w-20 h-20 object-cover rounded-full inline-block mr-4" /> Similarity: {face.similarity.toFixed(2)}</li>
              ))}
            </ul>
          </div>
      )}
    </div>
  );
}
