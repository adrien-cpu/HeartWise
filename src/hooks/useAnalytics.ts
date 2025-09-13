"use client";

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { analyticsService } from '@/services/analytics_service';

export function useAnalytics() {
  const { user } = useAuth();
  const pathname = usePathname();
  const sessionId = useRef<string>();

  // Generate session ID on mount
  useEffect(() => {
    sessionId.current = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }, []);

  // Track page views
  useEffect(() => {
    if (user && sessionId.current) {
      const pageName = pathname.split('/').slice(-1)[0] || 'home';
      analyticsService.trackPageView(user.uid, pageName, sessionId.current);
    }
  }, [user, pathname]);

  const trackFeatureUse = (featureName: string, action: string, metadata?: Record<string, any>) => {
    if (user) {
      analyticsService.trackFeatureUse(user.uid, featureName, action, metadata);
    }
  };

  const trackConversion = (conversionType: string, value?: number) => {
    if (user) {
      analyticsService.trackConversion(user.uid, conversionType, value);
    }
  };

  const trackError = (errorType: string, errorMessage: string, context?: Record<string, any>) => {
    if (user) {
      analyticsService.trackError(user.uid, errorType, errorMessage, context);
    }
  };

  return {
    trackFeatureUse,
    trackConversion,
    trackError,
    sessionId: sessionId.current
  };
}