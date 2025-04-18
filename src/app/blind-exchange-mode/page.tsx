"use client";

import {useState} from 'react';
import {generateBlindExchangeProfile} from '@/ai/flows/blind-exchange-profile';
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";

export default function BlindExchangeMode() {
  const [imageUrl1, setImageUrl1] = useState('');
  const [imageUrl2, setImageUrl2] = useState('');
  const [interests1, setInterests1] = useState('');
  const [interests2, setInterests2] = useState('');
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

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
      <h1 className="text-2xl font-bold mb-4">Blind Exchange Mode</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Image URL 1:
        </label>
        <Input
          type="text"
          placeholder="Enter image URL 1"
          value={imageUrl1}
          onChange={(e) => setImageUrl1(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Image URL 2:
        </label>
        <Input
          type="text"
          placeholder="Enter image URL 2"
          value={imageUrl2}
          onChange={(e) => setImageUrl2(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Interests 1 (comma-separated):
        </label>
        <Input
          type="text"
          placeholder="e.g., hiking, reading, movies"
          value={interests1}
          onChange={(e) => setInterests1(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Interests 2 (comma-separated):
        </label>
        <Input
          type="text"
          placeholder="e.g., cooking, travel, music"
          value={interests2}
          onChange={(e) => setInterests2(e.target.value)}
        />
      </div>
      <Button onClick={handleGenerateProfile}>Generate Profile</Button>
      {error && <div className="text-red-500 mt-4">Error: {error}</div>}
      {profile && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Generated Profile:</h2>
          <Card>
            <CardHeader>
              <CardTitle>Compatibility Profile</CardTitle>
              <CardDescription>
                {profile.profileDescription || 'No profile provided.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Compatibility Score: {profile.compatibilityScore}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
