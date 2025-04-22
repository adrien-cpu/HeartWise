'use server';

/**
 * @fileOverview Root layout for the application.
 *
 * @module app/layout
 *
 * @description This module defines the root layout for the application, including global styles,
 * font configuration, and internationalization setup.  It uses the NextIntlClientProvider
 * to provide internationalization support to client components.
 */

import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import {SidebarProvider} from "@/components/ui/sidebar";
import { NextIntlClientProvider} from 'next-intl';
import i18n from '@/i18n/settings';
import {notFound} from "next/navigation";
import {Locales} from "@/i18n/settings";

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
 * @async
 * @function RootLayout
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The children to render.
 * @param {object} props.params - The parameters passed from Next.js routing.
 * @param {string} props.params.locale - The locale of the current route.
 * @returns {JSX.Element} The rendered RootLayout component.
 */
export async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale?: string };
}>) {
  const locale = params.locale || i18n.defaultLocale;
  if (!Locales.includes(locale as any)) {
    notFound();
  }

  let messages;

  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load translation file for locale: ${locale}`);
    notFound();
  }

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// export default RootLayout;
