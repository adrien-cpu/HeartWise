/**
 * @fileOverview Root layout for the application.
 *
 * @module RootLayout
 * @description This component defines the root layout for the entire application. It sets up the font,
 * internationalization, and sidebar provider. It's primarily a Server Component, splitting client-specific
 * logic into ClientLayout.
 * @param {object} props - The props for the RootLayout component.
 * @param {React.ReactNode} props.children - The children to render within the layout.
 * @param {object} props.params - The route parameters.
 * @param {string} props.params.locale - The current locale.
 * @returns {JSX.Element} The rendered RootLayout component.
 */

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ReactNode } from 'react';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { locales } from "@/i18n/settings"; // Import from the correct location
import { notFound } from 'next/navigation'; // Import notFound

import { SidebarProvider } from "@/components/ui/sidebar";

import './globals.css';
import { metadata as appMetadata } from './metadata'; // Import metadata

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Use imported metadata
export const metadata: Metadata = appMetadata;

/**
 * RootLayout component - Server Component.
 * Sets up the basic HTML structure and passes locale to ClientLayout.
 * @param {object} props - The props.
 * @param {ReactNode} props.children - Child components.
 * @param {object} props.params - Route parameters.
 * @param {string} props.params.locale - The current locale.
 * @returns {JSX.Element} The root layout element.
 */
export default function RootLayout({
                                     children,
                                     params: { locale }, // Destructure locale directly
                                   }: {
  children: ReactNode;
  params: { locale: string };
}) {
  // Validate locale - Basic check, middleware should handle redirects/defaults
  if (!locales.includes(locale as any)) {
     // This log indicates an issue potentially upstream (middleware)
     // Avoid calling notFound() here in the root layout.
     console.error(`RootLayout received potentially invalid locale: ${locale}. This should ideally be handled by middleware.`);
     // Render a basic fallback or let ClientLayout handle it further if appropriate
     // For now, we proceed, but this indicates a potential config or routing issue.
  }

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Pass locale down to the client boundary */}
        <ClientLayout locale={locale}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

// Separating Client-Side Logic into its own component marked with "use client"
/**
 * ClientLayout component - Client Component.
 *
 * @component
 * @description Establishes the client boundary, sets up NextIntlClientProvider with messages,
 * and provides the Sidebar context. This must be a Client Component.
 * @param {object} props - The props for the ClientLayout component.
 * @param {React.ReactNode} props.children - The children to render within the layout.
 * @param {string} props.locale - The current locale passed from RootLayout.
 * @returns {JSX.Element} The rendered ClientLayout component.
 */
function ClientLayout({
                        children,
                        locale
                      }: {
  children: ReactNode;
  locale: string;
}) {
  "use client"; // Directive must be at the top

  // useMessages hook is safe to use here within the Client Component boundary
  const messages = useMessages();

  // Further validation or fallback on the client side
   if (!locales.includes(locale as any)) {
     // If an invalid locale somehow reaches the client, show an error or redirect
     console.warn("ClientLayout received invalid locale:", locale, ". Displaying fallback.");
      // Render a simple fallback on the client side.
      return <div>Unsupported language: {locale}. Please check the URL or contact support.</div>;
   }

  if (!messages) {
    // Handle case where messages might not be available (e.g., error during fetch/build)
    console.error("ClientLayout: Messages not available for locale:", locale);
    // Render fallback UI or throw error
    return <div>Error loading translations for locale '{locale}'. Please try again or contact support.</div>;
  }


  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </NextIntlClientProvider>
  );
}
