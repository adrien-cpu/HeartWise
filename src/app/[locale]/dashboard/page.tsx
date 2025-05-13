"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; // Keep some basic UI for structure

/**
 * @fileOverview Implements a simplified User Dashboard page for testing routing.
 * @module DashboardPage
 * @description Displays a minimal dashboard page.
 */

/**
 * Simplified DashboardPage component.
 *
 * @component
 * @returns {JSX.Element} The rendered Dashboard page.
 */
export default function DashboardPage() {
  const t = useTranslations('DashboardPage'); // Keep translations to ensure i18n context is working

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto shadow-lg border">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            {/* Use a known simple translation key */}
            {t('quickStatsTitle')} 
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            This is a simplified dashboard page. If you see this, the route to /dashboard is working.
          </p>
          <p className="text-center mt-4">
            The original dashboard page content might have an issue if this page loads successfully.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
