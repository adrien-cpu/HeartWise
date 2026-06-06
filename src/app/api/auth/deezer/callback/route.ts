import { NextResponse } from 'next/server';
import { musicService } from '@/services/music-service';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error_reason');

    if (error) {
        return NextResponse.redirect('/games?error=deezer_auth_failed');
    }

    if (code) {
        try {
            const response = await fetch('https://connect.deezer.com/oauth/access_token.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    app_id: process.env.NEXT_PUBLIC_DEEZER_APP_ID!,
                    secret: process.env.DEEZER_APP_SECRET!,
                    code: code,
                    output: 'json'
                })
            });

            const data = await response.json();
            if (data.access_token) {
                musicService.setDeezerToken(data.access_token);
                return NextResponse.redirect('/games?service=deezer&status=connected');
            }
        } catch (error) {
            console.error('Deezer token exchange error:', error);
        }
    }

    return NextResponse.redirect('/games?error=deezer_auth_failed');
} 