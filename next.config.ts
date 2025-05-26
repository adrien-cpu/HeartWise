
import type {NextConfig} from 'next';
import nextIntl from 'next-intl/plugin'; // Import the plugin

// Wrap the config with the next-intl plugin
// The path now points to the consolidated i18n configuration file.
const withNextIntl = nextIntl('./src/i18n/settings.ts');

const nextConfig: NextConfig = {
    // ...other configurations
};

export default withNextIntl(nextConfig); // Export the wrapped config
