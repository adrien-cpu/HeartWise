
import type {NextConfig} from 'next';
import nextIntl from 'next-intl/plugin'; // Import the plugin

// Wrap the config with the next-intl plugin
// The path './i18n.ts' points to the main i18n configuration file
const withNextIntl = nextIntl('./i18n.ts');

const nextConfig: NextConfig = {
    // ...other configurations
};

export default withNextIntl(nextConfig); // Export the wrapped config
