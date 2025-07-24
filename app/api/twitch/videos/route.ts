import { NextRequest, NextResponse } from 'next/server';
import { getTwitchVideos } from '@/lib/twitch';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const maxResults = parseInt(searchParams.get('maxResults') || '10');

    if (!username) {
      return NextResponse.json({
        success: false,
        error: 'Nom d\'utilisateur requis'
      }, { status: 400 });
    }

    const videos = await getTwitchVideos(username, maxResults);

    return NextResponse.json({
      success: true,
      data: videos
    });

  } catch (error) {
    console.error('Erreur API Twitch videos:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
} 