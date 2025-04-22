import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import {SidebarProvider} from "@/components/ui/sidebar";
import { NextIntlClientProvider} from 'next-intl';
import {notFound} from "next/navigation";
import {Locales} from "@/i18n/settings";
// import { useLocale } from 'next-intl'; // Cannot be used in async component

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
 * @param {object} props.params - The parameters passed from Next.js routing. (Kept for locale)
 * @param {string} props.params.locale - The locale of the current route.
 * @returns {JSX.Element} The rendered RootLayout component.
 */
export default async function RootLayout({
  children,
  params, // Keep params for locale extraction
}: Readonly<{
  children: React.ReactNode;
  params: { locale?: string }; // Type params explicitly
}>) {
  // Attempt to get locale from params BEFORE the async function uses hooks
  const locale = params.locale; // Directly access locale from params

  // Validate that the current locale is supported.
  // Use type assertion carefully. Ensure Locales array matches possible locale types.
  if (!locale || !Locales.includes(locale as any)) { // Reverted unknown to any for simplicity, review Locales type if possible
    notFound();
  }

  let messages;

  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch /* Removed unused 'error' variable */ {
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
