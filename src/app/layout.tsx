/**
 * @fileOverview Root layout for the application.
 * @module RootLayout
 * @description This file defines the main HTML shell for the application,
 *              including <html> and <body> tags, global CSS, and font setup.
 *              Locale-specific providers and message loading are handled by the nested `src/app/[locale]/layout.tsx`.
 */

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css'; // Global styles
import { metadata as appMetadata } from '@/app/metadata'; // Base metadata
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from '@/contexts/AuthContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = appMetadata;

/**
 * RootLayout component (Server Component).
 * This is the primary layout that wraps the entire application.
 * It sets up global providers like AuthProvider and SidebarProvider.
 * Internationalization (i18n) specific logic (like NextIntlClientProvider)
 * is handled in the nested `[locale]/layout.tsx`.
 *
 * @param {object} props - The props for the RootLayout component.
 * @param {React.ReactNode} props.children - The children to render within the layout.
 * @returns {JSX.Element} The rendered RootLayout component.
 */
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // The `lang` attribute on the <html> tag is important for accessibility and SEO.
  // It's set to 'en' by default here. The ClientSideI18n component
  // (or similar logic in [locale]/layout.tsx) will update it based on the actual resolved locale.
  // Next.js implicitly handles the <head> tag and merges metadata.
  return (
    <html lang="en">
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
