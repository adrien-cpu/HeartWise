
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
import { defaultLocale } from '@/i18n/settings'; // Import defaultLocale

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
  // The `lang` attribute on the <html> tag is set here to the default.
  // The `[locale]/layout.tsx` and `ClientSideI18n` will handle updating it
  // for specific locales.
  return (
    <html lang={defaultLocale}>
      {/* Head content is implicitly managed by Next.js via the Metadata API and <Head> components if used in pages/app segments. */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <SidebarProvider>
            {children} {/* This will render the content from [locale]/layout.tsx */}
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
