import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * @fileOverview Configuration file for Next.js with next-intl integration.
 * @module next.config
 */

const withNextIntl = createNextIntlPlugin({
  // Provide the path to the locale files relative to the app directory.
  localesDirPath: 'locales',
  // Provide a list of locales that are supported in the application
  locales: ['en', 'fr'],
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withNextIntl(nextConfig);
