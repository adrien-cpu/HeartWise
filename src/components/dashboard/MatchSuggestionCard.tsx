"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Sparkles } from 'lucide-react';
import { Link } from 'next-intl'; // Corrected import

interface MockMatch {
  id: string;
  name: string;
  profilePicture: string;
  dataAiHint?: string;
  interests: string[];
  compatibility: number;
}

// In a real app, this would come from a service or props.
const mockMatchSuggestion: MockMatch = {
  id: 'match789',
  name: 'Sophia',
  profilePicture: 'https://picsum.photos/seed/sophia/100',
  dataAiHint: 'woman smiling',
  interests: ['Art', 'Yoga', 'Travel'],
  compatibility: 82,
};

const getInitials = (name?: string | null): string => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

interface MatchSuggestionCardProps {
  loading: boolean;
}

export const MatchSuggestionCard: React.FC<MatchSuggestionCardProps> = ({ loading }) => {
  const t = useTranslations('DashboardPage');

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Search className="h-6 w-6 text-primary" />
          {t('matchSuggestionTitle')}
        </CardTitle>
        <CardDescription>{t('matchSuggestionDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 flex-grow">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center space-x-4 p-4 border rounded-lg bg-primary/5">
            <Avatar className="h-20 w-20 border-2 border-primary/50" data-ai-hint={mockMatchSuggestion.dataAiHint || "person"}>
              <AvatarImage src={mockMatchSuggestion.profilePicture} alt={mockMatchSuggestion.name} />
              <AvatarFallback className="text-3xl">{getInitials(mockMatchSuggestion.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow text-center sm:text-left mt-4 sm:mt-0">
              <h3 className="text-xl font-semibold">{mockMatchSuggestion.name}</h3>
              <div className="flex flex-wrap gap-1.5 my-2 justify-center sm:justify-start">
                {mockMatchSuggestion.interests.map(interest => (
                  <Badge key={interest} variant="secondary">{interest}</Badge>
                ))}
              </div>
              <p className="text-lg text-green-600 font-medium flex items-center justify-center sm:justify-start gap-1">
                <Sparkles className="h-4 w-4" />
                {t('compatibility', { score: mockMatchSuggestion.compatibility })}
              </p>
            </div>
            <Link href={`/profile/${mockMatchSuggestion.id}`} passHref>
                <Button variant="default" size="sm" className="mt-4 sm:mt-0 shrink-0">
                    {t('viewProfileButton')}
                </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
