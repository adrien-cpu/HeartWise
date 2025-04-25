import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server'; // Import getMessages and getLocale
import { locales, defaultLocale, isValidLocale } from '@/i18n/settings';
import { metadata as appMetadata } from '@/app/metadata';
import { ClientSideI18n } from '@/components/ClientSideI18n'; // Client boundary
import { SidebarProvider } from '@/components/ui/sidebar';
import './globals.css';

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
 * Sets up the basic HTML structure, fonts, fetches i18n messages,
 * and passes locale and messages to the ClientSideI18n boundary
 * for client-side context setup.
 *
 * @param {object} props - The props for the RootLayout component.
 * @param {React.ReactNode} props.children - The children to render within the layout.
 * @param {object} props.params - The route parameters.
 * @param {string} props.params.locale - The current locale.
 * @returns {Promise<JSX.Element>} The rendered RootLayout component.
 */
export default async function RootLayout({
  children,
  params: { locale }, // Receive locale from params
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  // Validate locale or use default. Middleware should ideally handle this.
  const effectiveLocale = isValidLocale(locale) ? locale : defaultLocale;
  if (!isValidLocale(locale)) {
    console.warn(
      `RootLayout received potentially invalid locale: ${locale}. Using default: ${effectiveLocale}. Middleware should handle redirection.`
    );
  }

  // Fetch messages for the effective locale on the server.
  let messages;
  try {
    messages = await getMessages({ locale: effectiveLocale });
  } catch (error) {
    console.error("Failed to load messages in RootLayout:", error);
    // Decide on fallback behavior - maybe load default locale messages?
    // For now, log the error and potentially render without messages or with minimal defaults.
    // Loading default messages as a fallback:
    try {
      console.warn(`Attempting to load messages for default locale: ${defaultLocale}`);
      messages = await getMessages({ locale: defaultLocale });
    } catch (fallbackError) {
      console.error(`Failed to load messages for default locale (${defaultLocale}) as well:`, fallbackError);
      // Critical error, i18n won't work. Render children without provider or show error boundary.
      // Returning children wrapped only in basic HTML structure:
      return (
        <html lang={effectiveLocale}>
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            {/* Potentially render an error message component here */}
            Error loading internationalization.
            {children}
          </body>
        </html>
      );
    }
  }

  // Check if messages were successfully loaded (even fallback)
  if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
      console.error(`Critical error: Messages object for locale ${effectiveLocale} (or fallback ${defaultLocale}) is empty or invalid after loading.`);
       return (
        <html lang={effectiveLocale}>
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            Error: Invalid internationalization configuration.
            {children}
          </body>
        </html>
      );
  }


  return (
    <html lang={effectiveLocale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/*
          Pass locale and server-loaded messages to the Client Boundary Component.
          ClientSideI18n will use these to set up the NextIntlClientProvider.
        */}
        <ClientSideI18n locale={effectiveLocale} messages={messages}>
          <SidebarProvider>{children}</SidebarProvider>
        </ClientSideI18n>
      </body>
    </html>
  );
}
