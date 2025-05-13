
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
import './globals.css'; // Global styles are imported here
import { metadata as appMetadata } from '@/app/metadata';
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
  // The `lang` attribute on the <html> tag is set here.
  // It might be dynamically updated on the client-side by ClientSideI18n if locale changes.
  // Next.js implicitly handles the <head> tag and merges metadata.
  // Ensure no whitespace or text nodes are direct children of <html>.
  return (
    <html lang="en">
      {/* The <head> is managed by Next.js metadata. Only <body> should be a direct child here. */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <SidebarProvider>
            {children} {/* This will render the content from [locale]/layout.tsx and then the page */}
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
