"use client";

import React from 'react';
import { supabase } from '@/lib/supabase';
import { TilesLayout } from '@/components/layouts/TilesLayout';

// Initialize Supabase connection
React.useEffect(() => {
  console.log('Supabase client initialized:', supabase);
}, []);

export default function HomePage() {
  return <TilesLayout />;
}