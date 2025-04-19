;"use client";

import {useState} from 'react';
import {generateBlindExchangeProfile} from '@/ai/flows/blind-exchange-profile';
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {useTranslations} from 'next-intl';

/**
 * @fileOverview Blind Exchange Mode page component.
 *
 * @module BlindExchangeMode
 *
 * @description This component provides an interface for users to input image URLs and interests,
 * then generates a blind exchange profile using AI.  It uses the `generateBlindExchangeProfile`
 * flow from the AI module.
 */

/**
 * BlindExchangeMode component.
 *
 * @component
 * @description A client component that generates a blind exchange profile based on user inputs.
 * @returns {JSX.Element} The rendered Blind Exchange Mode page.
 */
export default function BlindExchangeMode() {
  const [imageUrl1, setImageUrl1] = useState('');
  const [imageUrl2, setImageUrl2] = useState('');
  const [interests1, setInterests1] = useState('');
  const [interests2, setInterests2] = useState('');
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const t = useTranslations('BlindExchangeMode');

  /**
   * Handles the generation of the blind exchange profile.
   * @async
   * @function handleGenerateProfile
   * @returns {Promise<void>}
   */
  const handleGenerateProfile = async () => {
    try {
      const result = await generateBlindExchangeProfile({
        faceData1: {imageUrl: imageUrl1},
        faceData2: {imageUrl: imageUrl2},
        interests1: interests1.split(',').map((item) => item.trim()),
        interests2: interests2.split(',').map((item) => item.trim()),
      });
      setProfile(result);
      setError(null);
    } catch (error: any) {
      setProfile(null);
      setError(error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          {t('imageUrl1Label')}:
        </label>
        <Input
          type="text"
          placeholder={t('imageUrl1Placeholder')}
          value={imageUrl1}
          onChange={(e) => setImageUrl1(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          {t('imageUrl2Label')}:
        </label>
        <Input
          type="text"
          placeholder={t('imageUrl2Placeholder')}
          value={imageUrl2}
          onChange={(e) => setImageUrl2(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          {t('interests1Label')} ({t('commaSeparated')}):
        </label>
        <Input
          type="text"
          placeholder={t('interests1Placeholder')}
          value={interests1}
          onChange={(e) => setInterests1(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          {t('interests2Label')} ({t('commaSeparated')}):
        </label>
        <Input
          type="text"
          placeholder={t('interests2Placeholder')}
          value={interests2}
          onChange={(e) => setInterests2(e.target.value)}
        />
      </div>
      <Button onClick={handleGenerateProfile}>{t('generateProfileButton')}</Button>
      {error && <div className="text-red-500 mt-4">Error: {error}</div>}
      {profile && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">{t('generatedProfileTitle')}:</h2>
          <Card>
            <CardHeader>
              <CardTitle>{t('compatibilityProfileTitle')}</CardTitle>
              <CardDescription>
                {profile.profileDescription || t('noProfileProvided')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                {t('compatibilityScoreLabel')}: {profile.compatibilityScore}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
