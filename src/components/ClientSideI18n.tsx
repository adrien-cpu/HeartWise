"use client"; // This component MUST be a client component

import type { ReactNode } from 'react';
import { NextIntlClientProvider, AbstractIntlMessages, useMessages } from 'next-intl';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from '@/contexts/AuthContext'; // Import AuthProvider

/**
 * @fileOverview Client-side internationalization and global providers setup.
 * @module ClientSideI18n
 * @description This component acts as a client-side boundary. It initializes
 *              NextIntlClientProvider for internationalization and AuthProvider for authentication context.
 *              It receives locale and messages from server components (e.g., RootLayout).
 */

/**
 * @interface ClientSideI18nProps
 * @description Props for the ClientSideI18n component.
 */
interface ClientSideI18nProps {
  children: ReactNode;
  locale: string; // Expecting the already validated/defaulted locale
  messages: AbstractIntlMessages; // Expecting pre-loaded messages from server
}

/**
 * ClientSideI18n component (Client Component Boundary).
 * Handles client-side initialization for NextIntlClientProvider and AuthProvider.
 * It receives the locale and pre-loaded messages from the Server Component (RootLayout).
 *
 * @param {ClientSideI18nProps} props - The props for the ClientSideI18n component.
 * @returns {JSX.Element} The rendered ClientSideI18n component with the providers.
 */
export function ClientSideI18n({
  children,
  locale,
  messages
}: ClientSideI18nProps): JSX.Element {

  // Basic check for messages, though RootLayout should ensure they are valid.
  if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
    console.error(`ClientSideI18n: Received no messages or invalid messages object for locale: ${locale}. This indicates an upstream issue in message loading (RootLayout). Rendering children without i18n provider.`);
    // Render children within AuthProvider and SidebarProvider even if i18n fails, so app structure remains.
    return (
      <AuthProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </AuthProvider>
    );
  }

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
    >
      <AuthProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
