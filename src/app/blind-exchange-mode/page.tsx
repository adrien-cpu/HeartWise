"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from "next-intl";
import { analyzeFaceData } from "@/services/face-analysis";
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

      const faceData1 = await analyzeFaceData(user1.image);
      const faceData2 = await analyzeFaceData(user2.image);

      if (faceData1 && faceData2) {
        const profile = await generateBlindExchangeProfile(
          faceData1,
          faceData2,
          user1.interests,
          user2.interests
        );
        setMatchedProfile(profile);
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
              {matchedProfile.description} (
              {matchedProfile.compatibility.toFixed(2)}% {t("compatibility")})
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <p className="text-center">{t("loading")}</p>
      )}
    </div>
  );
}

