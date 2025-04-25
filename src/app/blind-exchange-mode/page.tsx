"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from "next-intl";
import { generateBlindExchangeProfile } from "@/ai/flows/blind-exchange-profile";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface User {
  id: string;
  name: string;
  image: string;
  interests: string[];
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Alice",
    image: "/images/alice.jpg",
    interests: ["Reading", "Hiking", "Photography"],
  },
  {
    id: "2",
    name: "Bob",
    image: "/images/bob.jpg",
    interests: ["Hiking", "Cooking", "Travel"],
  },
  {
    id: "3",
    name: "Charlie",
    image: "/images/charlie.jpg",
    interests: ["Photography", "Travel", "Music"],
  },
];

// Function to convert image to data URI
const getImageDataUri = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default function BlindExchangeModePage() {
  const t = useTranslations("BlindExchangeMode");
  const [matchedProfile, setMatchedProfile] = useState<{
    compatibility: number;
    description: string;
  } | null>(null);

  useEffect(() => {
    const fetchAndMatch = async () => {
      const user1 = mockUsers[0];
      const user2 = mockUsers[1];

      try {
        const faceDataUri1 = await getImageDataUri(user1.image);
        const faceDataUri2 = await getImageDataUri(user2.image);

        const profile = await generateBlindExchangeProfile({
          faceData1: { imageUrl: faceDataUri1 },
          faceData2: { imageUrl: faceDataUri2 },
          interests1: user1.interests,
          interests2: user2.interests
        });

        setMatchedProfile(profile);
      } catch (error) {
        console.error("Error in blind exchange mode:", error);
      }
    };

    fetchAndMatch();
  }, []);

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-3xl font-bold text-center mb-5">{t("title")}</h1>
      {matchedProfile ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>{t("matchedProfile")}</CardTitle>
            <CardDescription>
              {matchedProfile.profileDescription} (
              {matchedProfile.compatibilityScore.toFixed(2)}% {t("compatibility")})
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <p className="text-center">{t("loading")}</p>
      )}
    </div>
  );
}
