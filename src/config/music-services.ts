export const SPOTIFY_CONFIG = {
    clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
    scopes: [
        'user-read-private',
        'user-read-email',
        'user-library-read',
        'playlist-read-private',
        'playlist-read-collaborative'
    ]
};

export const DEEZER_CONFIG = {
    appId: process.env.NEXT_PUBLIC_DEEZER_APP_ID,
    redirectUri: process.env.NEXT_PUBLIC_DEEZER_REDIRECT_URI,
    scopes: [
        'basic_access',
        'email',
        'offline_access',
        'manage_library',
        'manage_community',
        'delete_library',
        'listening_history'
    ]
};

export const YOUTUBE_CONFIG = {
    apiKey: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
    clientId: process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    redirectUri: process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI,
    scopes: [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/youtube.force-ssl'
    ]
}; 