import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import {SidebarProvider} from "@/components/ui/sidebar";
import {NextIntlClientProvider, useLocale} from 'next-intl';
import {notFound} from 'next/navigation';

/**
 * @fileOverview Root layout for the application.
 *
 * @module RootLayout
 *
 * @description This module defines the root layout for the HeartWise application,
 * including font configuration, metadata, and internationalization support.
 */

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'HeartWise App',
  description: 'A heart health and social app using GenAI',
};

/**
 * RootLayout component.
 *
 * @component
 * @description The root layout for the application, providing font styles, sidebar, and internationalization.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The children to render.
 * @returns {JSX.Element} The rendered RootLayout component.
 */
export default function RootLayout({
  children,
  params: {locale},
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  // Validate that the current locale is supported.
  const localeFn = useLocale();
  if (localeFn && locale !== localeFn) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages[locale]}>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

/**
 * Generate static params for i18n routes
 */
export async function generateStaticParams() {
  return [{locale: 'en'}, {locale: 'fr'}];
}

import { getMessages } from 'next-intl/server';

const messages = {
  en: () => import('../locales/en.json').then(m => m.default),
  fr: () => import('../locales/fr.json').then(m => m.default)
};
