"use client";

import {useState} from 'react';
import {FaceData, getPsychologicalTraits} from '@/services/face-analysis';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

export default function FacialAnalysisMatching() {
  const [imageUrl, setImageUrl] = useState('');
  const [traits, setTraits] = useState(null);
  const [error, setError] = useState(null);

  const handleImageUrlChange = (event) => {
    setImageUrl(event.target.value);
  };

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
      <h1 className="text-2xl font-bold mb-4">Facial Analysis & Matching</h1>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Enter image URL"
          value={imageUrl}
          onChange={handleImageUrlChange}
        />
      </div>
      <Button onClick={handleAnalysis}>Analyze Image</Button>
      {error && <div className="text-red-500 mt-4">Error: {error}</div>}
      {traits && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">
            Psychological Traits:
          </h2>
          <p>Extroversion: {traits.extroversion}</p>
          <p>Agreeableness: {traits.agreeableness}</p>
        </div>
      )}
    </div>
  );
}
