import { NextResponse } from 'next/server';
import { musicService } from '@/services/music-service';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect('/games?error=youtube_auth_failed');
    }

    if (code) {
        try {
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    code,
                    client_id: process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID!,
                    client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
                    redirect_uri: process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI!,
                    grant_type: 'authorization_code'
                })
            });

            const data = await response.json();
            if (data.access_token) {
                musicService.setYouTubeToken(data.access_token);
                return NextResponse.redirect('/games?service=youtube&status=connected');
            }
        } catch (error) {
            console.error('YouTube token exchange error:', error);
        }
    }

    return NextResponse.redirect('/games?error=youtube_auth_failed');
} 