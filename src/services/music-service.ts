import { SPOTIFY_CONFIG, DEEZER_CONFIG, YOUTUBE_CONFIG } from '@/config/music-services';

interface MusicServiceResponse {
    success: boolean;
    data?: any;
    error?: string;
}

class MusicService {
    private static instance: MusicService;
    private spotifyToken: string | null = null;
    private deezerToken: string | null = null;
    private youtubeToken: string | null = null;

    private constructor() { }

    static getInstance(): MusicService {
        if (!MusicService.instance) {
            MusicService.instance = new MusicService();
        }
        return MusicService.instance;
    }

    // Spotify
    async connectSpotify(): Promise<MusicServiceResponse> {
        try {
            const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CONFIG.clientId
                }&redirect_uri=${encodeURIComponent(
                    SPOTIFY_CONFIG.redirectUri!
                )}&scope=${encodeURIComponent(
                    SPOTIFY_CONFIG.scopes.join(' ')
                )}&response_type=token&show_dialog=true`;

            window.location.href = authUrl;
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Erreur de connexion à Spotify' };
        }
    }

    async searchSpotify(query: string, type: 'artist' | 'track' | 'playlist'): Promise<MusicServiceResponse> {
        try {
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.spotifyToken}`
                    }
                }
            );
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: 'Erreur de recherche Spotify' };
        }
    }

    // Deezer
    async connectDeezer(): Promise<MusicServiceResponse> {
        try {
            const authUrl = `https://connect.deezer.com/oauth/auth.php?app_id=${DEEZER_CONFIG.appId
                }&redirect_uri=${encodeURIComponent(
                    DEEZER_CONFIG.redirectUri!
                )}&perms=${encodeURIComponent(
                    DEEZER_CONFIG.scopes.join(',')
                )}`;

            window.location.href = authUrl;
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Erreur de connexion à Deezer' };
        }
    }

    async searchDeezer(query: string, type: 'artist' | 'track' | 'playlist'): Promise<MusicServiceResponse> {
        try {
            const response = await fetch(
                `https://api.deezer.com/search/${type}?q=${encodeURIComponent(query)}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.deezerToken}`
                    }
                }
            );
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: 'Erreur de recherche Deezer' };
        }
    }

    // YouTube
    async connectYouTube(): Promise<MusicServiceResponse> {
        try {
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${YOUTUBE_CONFIG.clientId
                }&redirect_uri=${encodeURIComponent(
                    YOUTUBE_CONFIG.redirectUri!
                )}&scope=${encodeURIComponent(
                    YOUTUBE_CONFIG.scopes.join(' ')
                )}&response_type=token&access_type=offline&prompt=consent`;

            window.location.href = authUrl;
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Erreur de connexion à YouTube' };
        }
    }

    async searchYouTube(query: string): Promise<MusicServiceResponse> {
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
                    query
                )}&type=video&key=${YOUTUBE_CONFIG.apiKey}`
            );
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: 'Erreur de recherche YouTube' };
        }
    }

    // Gestion des tokens
    setSpotifyToken(token: string) {
        this.spotifyToken = token;
    }

    setDeezerToken(token: string) {
        this.deezerToken = token;
    }

    setYouTubeToken(token: string) {
        this.youtubeToken = token;
    }

    // Vérification de l'état de connexion
    isSpotifyConnected(): boolean {
        return !!this.spotifyToken;
    }

    isDeezerConnected(): boolean {
        return !!this.deezerToken;
    }

    isYouTubeConnected(): boolean {
        return !!this.youtubeToken;
    }
}

export const musicService = MusicService.getInstance(); 