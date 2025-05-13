/**
 * @fileOverview Root layout for the application.
 * @module RootLayout
 * @description This file defines the main HTML shell for the application,
 *              including <html> and <body> tags, global CSS, and font setup.
 *              Locale-specific providers and message loading are handled by the nested `src/app/[locale]/layout.tsx`.
 */

import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css'; // Global styles
import { metadata as appMetadata } from '@/app/metadata'; // Base metadata
import { SidebarProvider } from "@/components/ui/sidebar"; // Global provider
import { AuthProvider } from '@/contexts/AuthContext';   // Global provider

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
  // It will be set to 'en' by default here. The client-side ClientSideI18n component
  // within the [locale] layout will update it based on the actual resolved locale.
  // Next-intl middleware also plays a role in how the initial lang might be set
  // if the [locale] segment is at the very root of the URL structure handled by middleware.
  return (
    <html lang="en"> {/* Default lang, ClientSideI18n will update this on the client */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <SidebarProvider>
            {children} {/* Children will typically be src/app/[locale]/layout.tsx */}
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
