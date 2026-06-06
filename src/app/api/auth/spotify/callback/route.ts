import { NextResponse } from 'next/server';
import { musicService } from '@/services/music-service';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('access_token');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect('/games?error=spotify_auth_failed');
    }

    if (token) {
        musicService.setSpotifyToken(token);
        return NextResponse.redirect('/games?service=spotify&status=connected');
    }

    return NextResponse.redirect('/games?error=spotify_auth_failed');
} 