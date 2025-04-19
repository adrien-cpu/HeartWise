const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin(
    './src/i18n/i18n.ts',
    {
        // Whether to expose the locale in the default layout
        locales: ['en', 'fr'],
        defaultLocale: 'en'
    }
);

module.exports = withNextIntl({
    // Other Next.js configuration ...
});
