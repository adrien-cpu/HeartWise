/**
 * @fileOverview Root layout for the application.
 * @module RootLayout
 * @description This file defines the main HTML shell for the application,
 *              including <html> and <body> tags, global CSS, and font setup.
 *              Locale-specific providers are handled by the nested `src/app/[locale]/layout.tsx`.
 */

import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css'; // Global styles
import { metadata as appMetadata } from '@/app/metadata'; // Base metadata

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = appMetadata;

// export const viewport: Viewport = {
//   themeColor: '...',
// }

// This RootLayout is the true root and provides the <html> and <body> shell.
// It does not handle locale directly; its children (which will be the output of
// `src/app/[locale]/layout.tsx`) will handle locale-specific setup.
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // The `lang` attribute on the <html> tag is important for accessibility and SEO.
  // `next-intl`'s middleware should ideally set this attribute based on the detected locale
  // when using the App Router with a `[locale]` segment.
  // If not, a default can be set here, but dynamic setting based on locale is preferred.
  // For now, we'll set a default and assume middleware or subsequent layouts might adjust it
  // or that Next.js/next-intl handles this correctly at a higher level.
  // The hydration error related to `lang` mismatch often stems from nested `<html>` tags
  // where the inner one had a different `lang`. Removing the nested `<html>` tag is the primary fix.
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
