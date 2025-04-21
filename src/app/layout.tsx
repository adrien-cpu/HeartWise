"use client";

import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import {SidebarProvider} from "@/components/ui/sidebar";
import { NextIntlClientProvider } from 'next-intl';
import {Locales} from "@/i18n/settings";
import {DefaultLocale} from "@/i18n/settings";
import i18n from '@/i18n/i18n';
import {metadata} from './metadata';

/**
 * @fileOverview Root layout for the application.
 *
 * @module RootLayout
 *
 * @description This module defines the root layout for the HeartWise application,
 * including font configuration, metadata, and sidebar.
 */

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/**
 * ClientLayout component.
 *
 * @param {object} props - The component props.
 * @param {string} props.locale - The locale of the app
 * @param {React.ReactNode} props.children - The children to render.
 * @returns {JSX.Element} The rendered RootLayout component.
 */
function ClientLayout({
                        children,
                        messages,
                        locale,
                      }: {
  children: React.ReactNode;
  messages: any;
  locale: string;
}) {

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </NextIntlClientProvider>
  );
}

/**
 * RootLayout component.
 *
 * @component
 * @description The root layout for the application, providing font styles and sidebar.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The children to render.
 * @returns {JSX.Element} The rendered RootLayout component.
 */
export default async function RootLayout({
                                     children,
                                     params,
                                   }: Readonly<{
  children: React.ReactNode;
  params: { locale?: string };
}>) {

  // Validate that the current locale is supported.
  let locale = params?.locale || DefaultLocale;

  if (!Locales.includes(locale as any)) {
    locale = DefaultLocale;
  }

  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load translation file for locale: ${locale}`);
    messages = (await import(`../messages/${DefaultLocale}.json`)).default;
  }

  return (
    <html lang={locale}>
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
    <ClientLayout messages={messages} locale={locale}>{children}</ClientLayout>
    </body>
    </html>
  );
}
