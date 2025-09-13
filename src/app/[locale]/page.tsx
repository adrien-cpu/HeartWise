"use client";

import React from 'react';
import { useTranslations } from "next-intl";
import { TilesLayout } from '@/components/layouts/TilesLayout';

export default function Home() {
  const t = useTranslations("Home");

  return (
    <TilesLayout />
  );
}