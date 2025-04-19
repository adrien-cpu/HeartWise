
import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import {SidebarProvider} from "@/components/ui/sidebar";
import { useLocale, NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import {Locales} from "@/i18n/settings";

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

export const metadata: Metadata = {
  title: 'HeartWise App',
  description: 'A heart health and social app using GenAI',
};

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
                      }: {
  children: React.ReactNode;
  messages: any;
}) {

  return (
    <NextIntlClientProvider locale={useLocale()} messages={messages}>
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
  params: { locale: string };
}>) {

  const locale = params.locale as Locales;

  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  // Validate that the current locale is supported.
  if (!Locales.includes(locale)) {
    return notFound();
  }

  return (
    <html lang={locale}>
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
    <ClientLayout messages={messages}>{children}</ClientLayout>
    </body>
    </html>
  );
}
