"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Lightbulb, CheckCircle } from 'lucide-react';
import { contextHelpService, HelpContent, UserOnboardingState } from '@/services/context_help_service';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingTourProps {
  currentFeature?: string;
  onComplete?: () => void;
  onDismiss?: () => void;
}

export function OnboardingTour({ currentFeature, onComplete, onDismiss }: OnboardingTourProps) {
  const t = useTranslations('Onboarding');
  const { user } = useAuth();
  
  const [isVisible, setIsVisible] = useState(false);
  const [currentHelp, setCurrentHelp] = useState<HelpContent | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userState, setUserState] = useState<UserOnboardingState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const initializeOnboarding = async () => {
      try {
        const state = await contextHelpService.getUserOnboardingState(user.uid);
        setUserState(state);
        
        const nextStep = contextHelpService.getNextOnboardingStep(state.completedSteps);
        if (nextStep && state.helpPreferences.autoShow) {
          setCurrentHelp(nextStep);
          setIsVisible(true);
        } else if (currentFeature) {
          const contextualHelp = await contextHelpService.getContextualHelp(currentFeature, state.helpPreferences.difficulty);
          if (contextualHelp.length > 0) {
            setCurrentHelp(contextualHelp[0]);
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error('Error initializing onboarding:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeOnboarding();
  }, [user, currentFeature]);

  const handleStepComplete = async () => {
    if (!user || !currentHelp || !userState) return;
    
    const currentStep = currentHelp.steps[currentStepIndex];
    await contextHelpService.markStepCompleted(user.uid, currentStep.id);
    
    if (currentStepIndex < currentHelp.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // All steps completed
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete?.();
  };

  const handleDismiss = async () => {
    if (user && userState) {
      await contextHelpService.updateHelpPreferences(user.uid, { autoShow: false });
    }
    setIsVisible(false);
    onDismiss?.();
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < (currentHelp?.steps.length || 0) - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleStepComplete();
    }
  };

  if (loading || !isVisible || !currentHelp) {
    return null;
  }

  const currentStep = currentHelp.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / currentHelp.steps.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed bottom-4 right-4 z-50 max-w-sm"
      >
        <Card className="shadow-xl border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {t('stepOf', { current: currentStepIndex + 1, total: currentHelp.steps.length })}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="text-lg">{currentStep.title}</CardTitle>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          
          <CardContent className="space-y-4">
            <CardDescription className="text-base leading-relaxed">
              {currentStep.description}
            </CardDescription>
            
            {currentStep.image && (
              <div className="rounded-lg overflow-hidden border">
                <img 
                  src={currentStep.image} 
                  alt={currentStep.title}
                  className="w-full h-32 object-cover"
                />
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2">
              <div className="flex gap-2">
                {currentStepIndex > 0 && (
                  <Button variant="outline" size="sm" onClick={handlePrevious}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('previous')}
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDismiss}>
                  {t('skip')}
                </Button>
                <Button size="sm" onClick={handleNext}>
                  {currentStepIndex === currentHelp.steps.length - 1 ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {t('complete')}
                    </>
                  ) : (
                    <>
                      {t('next')}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}