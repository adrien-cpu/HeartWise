
"use client"; // This component MUST be a client component

import type { ReactNode } from 'react';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { AuthProvider } from '@/contexts/AuthContext'; // Import AuthProvider

/**
 * ClientSideI18n component (Client Component Boundary).
 * Handles client-side initialization for NextIntlClientProvider and AuthProvider.
 * It receives the locale and pre-loaded messages from the Server Component (RootLayout).
 *
 * @param {object} props - The props for the ClientSideI18n component.
 * @param {React.ReactNode} props.children - The children to render within the provider.
 * @param {string} props.locale - The effective locale passed from RootLayout.
 * @param {AbstractIntlMessages} props.messages - The pre-loaded messages passed from RootLayout.
 * @returns {JSX.Element} The rendered ClientSideI18n component with the providers.
 */
export function ClientSideI18n({
  children,
  locale, // Expecting the already validated/defaulted locale
  messages // Expecting pre-loaded messages from server
}: {
  children: ReactNode;
  locale: string;
  messages: AbstractIntlMessages; // Use the type from next-intl
}) {

  // Check if messages object exists and is not empty.
  // This check catches issues where RootLayout might have failed to load messages properly.
  if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
    console.error(`ClientSideI18n: Received no messages or invalid messages object for locale: ${locale}. This indicates an upstream issue in message loading (RootLayout). Rendering children without provider.`);
    // Render children directly without the provider as context is broken.
    // This prevents a hard crash but i18n functionality will be missing.
    // Consider a more robust error UI if needed.
    return (
      <AuthProvider> {/* Still provide AuthContext even if i18n fails */}
        {children}
      </AuthProvider>
    );
  }

  return (
    <NextIntlClientProvider
      locale={locale} // Use the locale passed down from the server component
      messages={messages} // Use the messages passed down from the server component
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
