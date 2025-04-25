/**
 * @fileOverview Root layout for the application.
 */
import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import {ReactNode} from 'react';
import {NextIntlClientProvider, useMessages} from 'next-intl';
import {locales} from "@/i18n/settings"; // Import from the correct location
import {notFound} from 'next/navigation'; // Import notFound

import {SidebarProvider} from "@/components/ui/sidebar";

import './globals.css';
import {metadata as appMetadata} from './metadata'; // Import metadata
import {useLocale} from 'next-intl'; // Import useLocale

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
 * RootLayout component (Server Component).
 * Sets up the basic HTML structure, fonts, and passes locale information
 * down to the ClientLayout boundary.
 *
 * @module RootLayout
 * @description This component defines the root layout for the entire application. It sets up the font,
 * internationalization provider, and sidebar provider.
 * @param {object} props - The props for the RootLayout component.
 * @param {React.ReactNode} props.children - The children to render within the layout.
 * @param {object} props.params - The route parameters.
 * @param {string} props.params.locale - The current locale.
 * @returns {JSX.Element} The rendered RootLayout component.
 */
export default function RootLayout({
                                     children,
                                     params, // Destructure params object
                                   }: {
  children: ReactNode;
  params: { locale: string };
}) {

   const locale = params.locale; // Get locale from params

   // Validate locale - Basic check. Let middleware handle redirects/defaults.
   // next-intl middleware should ensure a valid locale is passed.
   // If an invalid locale reaches here, it might indicate a config issue,
   // but we let ClientLayout handle potential message loading errors.
   if (!locales.includes(locale as any)) {
     // Log a warning instead of erroring or calling notFound here.
     // Using console.warn as console.error might be too alarming for a recoverable state
     // handled by middleware/client layout.
     console.warn(`RootLayout received potentially invalid locale: ${locale}. Middleware should ideally handle redirection or provide a default.`);
     // Proceeding, assuming ClientLayout or subsequent logic might handle it,
     // or hoping middleware corrects the route. Calling notFound() here is not allowed.
   }

  return (
    // Use the validated locale for the lang attribute, fallback to default if needed early.
    <html lang={locales.includes(locale as any) ? locale : 'en'}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Pass locale down to the client boundary */}
        <ClientLayout locale={locale}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}


/**
 * ClientLayout component (Client Component Boundary).
 * Handles client-side initialization like NextIntlClientProvider and SidebarProvider.
 *
 * @function ClientLayout
 * @description Establishes the client boundary, sets up NextIntlClientProvider with messages,
 * and provides the Sidebar context. This must be a Client Component.
 * @param {object} props - The props for the ClientLayout component.
 * @param {React.ReactNode} props.children - The children to render within the layout.
 * @param {string} props.locale - The current locale passed from RootLayout.
 * @returns {JSX.Element} The rendered ClientLayout component.
 */
"use client";
function ClientLayout({
                        children,
                        locale
                      }: {
  children: ReactNode;
  locale: string; // Expect locale to be a string, even if potentially invalid initially
}) {


  // useMessages hook is safe to use here within the Client Component boundary
  const messages = useMessages();

  // Basic check on the client side for locale validity *before* provider.
  // If middleware failed, this might catch it.
   if (!locales.includes(locale as any)) {
     // Render a client-side fallback if the locale is fundamentally wrong here.
     // This shouldn't happen if middleware is correct, but acts as a safeguard.
     console.error("ClientLayout received invalid locale:", locale, ". Displaying fallback.");
      return <div>Unsupported language: {locale || 'undefined'}. Please check the URL or contact support.</div>;
   }

  // Check if messages were loaded correctly by getRequestConfig / useMessages
  // This can fail if the JSON file is missing or corrupt for the *resolved* locale.
  if (!messages || Object.keys(messages).length === 0) {
    // Handle case where messages might not be available (e.g., error during fetch/build)
    console.error("ClientLayout: Messages not available or empty for locale:", locale);
    // Render fallback UI or throw error
    return <div>Error loading translations for locale '{locale}'. Please try again or contact support.</div>;
  }


  return (
    // Provide the potentially invalid locale to NextIntlClientProvider,
    // letting it handle message resolution based on its internal logic/fallbacks
    // if getRequestConfig didn't throw earlier.
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </NextIntlClientProvider>
  );
}