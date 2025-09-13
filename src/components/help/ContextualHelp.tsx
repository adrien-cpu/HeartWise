"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HelpCircle, X, ExternalLink } from 'lucide-react';
import { contextHelpService, HelpContent } from '@/services/context_help_service';
import { useAuth } from '@/contexts/AuthContext';

interface ContextualHelpProps {
  feature: string;
  className?: string;
}

export function ContextualHelp({ feature, className }: ContextualHelpProps) {
  const t = useTranslations('Help');
  const { user } = useAuth();
  const [helpContent, setHelpContent] = useState<HelpContent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !isOpen) return;

    const loadHelp = async () => {
      setLoading(true);
      try {
        const userState = await contextHelpService.getUserOnboardingState(user.uid);
        const content = await contextHelpService.getContextualHelp(feature, userState.helpPreferences.difficulty);
        setHelpContent(content);
      } catch (error) {
        console.error('Error loading contextual help:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHelp();
  }, [user, feature, isOpen]);

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-8 w-8 text-muted-foreground hover:text-primary ${className}`}
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">{t('helpFor', { feature })}</h4>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            </div>
          ) : helpContent.length > 0 ? (
            <div className="space-y-3">
              {helpContent.map((content) => (
                <Card key={content.id} className="border-0 shadow-none bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{content.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground mb-2">
                      {content.description}
                    </p>
                    {content.steps.length > 0 && (
                      <ol className="text-xs space-y-1">
                        {content.steps.slice(0, 3).map((step, index) => (
                          <li key={step.id} className="flex items-start gap-2">
                            <span className="text-primary font-medium">{index + 1}.</span>
                            <span>{step.description}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="h-3 w-3 mr-2" />
                {t('viewFullGuide')}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('noHelpAvailable')}</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}