const nextIntl = require('next-intl/plugin');

// Wrap the config with the next-intl plugin
// The path now points to the consolidated i18n configuration file.
const withNextIntl = nextIntl('./src/i18n/settings.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        // Handle MediaPipe and TensorFlow.js modules
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            path: false,
            os: false,
        };

        // Add specific rules for MediaPipe and TensorFlow.js
        config.module.rules.push({
            test: /\.wasm$/,
            type: 'asset/resource',
        });

        // Handle Firebase and its dependencies
        config.module.rules.push({
            test: /\.js$/,
            include: [
                /node_modules\/@firebase/,
                /node_modules\/firebase/,
                /node_modules\/undici/
            ],
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                    plugins: [
                        ['@babel/plugin-transform-private-methods', { loose: true }],
                        ['@babel/plugin-transform-class-properties', { loose: true }],
                        ['@babel/plugin-transform-private-property-in-object', { loose: true }]
                    ]
                }
            }
        });

        // Ignore specific modules that cause issues
        config.ignoreWarnings = [
            { module: /node_modules\/undici/ },
            { message: /Failed to parse source map/ }
        ];

        return config;
    },
    // Add transpilePackages for MediaPipe and TensorFlow.js
    transpilePackages: [
        '@mediapipe/face_detection',
        '@mediapipe/face_mesh',
        '@mediapipe/camera_utils',
        '@mediapipe/drawing_utils',
        '@tensorflow/tfjs',
        '@tensorflow-models/face-landmarks-detection',
        '@tensorflow-models/face-detection',
        'undici',
        '@firebase',
        'firebase'
    ],
    // Ignore TypeScript errors during build
    typescript: {
        ignoreBuildErrors: true,
    },
    // Ignore ESLint errors during build
    eslint: {
        ignoreDuringBuilds: true,
    }
};

module.exports = withNextIntl(nextConfig); 