
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ReactNode } from 'react';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { locales } from "@/i18n"; // Import from the correct location
import { notFound } from 'next/navigation'; // Import notFound

import { SidebarProvider } from "@/components/ui/sidebar";

import './globals.css';
import { metadata as appMetadata } from './metadata'; // Import metadata

/**
 * @fileOverview Root layout for the application.
 *
 * @module RootLayout
 * @description This component defines the root layout for the entire application. It sets up the font,
 * internationalization, and sidebar provider. It's a Server Component.
 * @param {object} props - The props for the RootLayout component.
 * @param {React.ReactNode} props.children - The children to render within the layout.
 * @param {object} props.params - The route parameters.
 * @param {string} props.params.locale - The current locale.
 * @returns {JSX.Element} The rendered RootLayout component.
 */

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

export default function RootLayout({
                                     children,
                                     params: { locale }, // Destructure locale directly
                                   }: {
  children: ReactNode;
  params: { locale: string };
}) {
  // Validate locale
  if (!locales.includes(locale as any)) {
     // Using notFound() here is not allowed in root layout
     // The middleware should handle redirecting invalid locales
     // Log an error for debugging, but let the client layout handle potential issues
     console.error(`RootLayout received invalid locale: ${locale}. Middleware should have handled this.`);
     // Fallback or specific handling might be needed depending on desired UX for invalid locales
     // For now, we proceed, assuming middleware handles redirects or ClientLayout can cope.
  }

  // Fetch messages in the Server Component context if needed,
  // but typically, ClientLayout will use useMessages() hook.
  // const messages = await getMessages(locale); // Example if fetching server-side

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

/**
 * ClientLayout component.
 *
 * @component
 * @description Establishes the client boundary, sets up NextIntlClientProvider with messages,
 * and provides the Sidebar context.
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
  // useMessages hook is safe to use here within the Client Component boundary
  const messages = useMessages();

  // Validate locale again on the client side if necessary, or handle potential undefined messages
  if (!messages) {
    // Handle case where messages might not be available (e.g., error during fetch/build)
    console.error("ClientLayout: Messages not available for locale:", locale);
    // Render fallback UI or throw error
    return <div>Error loading translations.</div>;
  }
   if (!locales.includes(locale as any)) {
     // If an invalid locale somehow reaches here, redirect or show error
     // This check might be redundant if middleware handles it robustly
     console.warn("ClientLayout received potentially invalid locale:", locale);
     // notFound(); // Can potentially use notFound here if needed for client-side routing
   }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </NextIntlClientProvider>
  );
}
