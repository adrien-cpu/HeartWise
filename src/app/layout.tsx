import './globals.css';
import {Geist, Geist_Mono} from 'next/font/google';
import type {Metadata} from 'next';
import {SidebarProvider} from "@/components/ui/sidebar";
import {notFound} from 'next/navigation';
import {locales, config, handleI18n} from "@/i18n/settings";
import {NextIntlClientProvider} from 'next-intl';
import { useLocale } from 'next-intl';

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
 * @fileOverview Root layout for the application.
 *
 * @module RootLayout
 * @description This component defines the root layout for the entire application. It sets up the font,
 * internationalization, and sidebar provider.
 * @param {object} props - The props for the RootLayout component.
 * @param {React.ReactNode} props.children - The children to render within the layout.
 * @param {object} props.params - The route parameters.
 * @returns {JSX.Element} The rendered RootLayout component.
 */
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {

  const i18n = await handleI18n();

  const locale = params.locale;

  if (!locales.includes(locale as any)) {
    console.log("locale not found", locale);
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
