import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import {SidebarProvider} from "@/components/ui/sidebar";
import { NextIntlClientProvider, useLocale } from 'next-intl';
import i18n from '@/i18n/settings';
import {metadata} from './metadata';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// export async function generateStaticParams() {
//   return i18n.Locales.map((locale) => ({locale}))
// }

export {metadata};

async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale?: string };
}>) {
  let messages;
  try {
    messages = (await import(`../messages/${params.locale || i18n.DefaultLocale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load translation file for locale: ${params.locale || i18n.DefaultLocale}`);
    messages = (await import(`../messages/${i18n.DefaultLocale}.json`)).default;
  }


  return (
    <html lang={params.locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={params.locale} messages={messages}>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export default RootLayout;
