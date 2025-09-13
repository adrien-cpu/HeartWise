"use client";

import React from 'react';
import { FeatureCalendar } from '@/components/calendar/FeatureCalendar';
import AuthGuard from '@/components/auth-guard';

export default function CalendarPage() {
  return (
    <AuthGuard>
      <FeatureCalendar />
    </AuthGuard>
  );
}