import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeVideos } from '@/lib/youtube';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    const maxResults = parseInt(searchParams.get('maxResults') || '10');

    if (!channelId) {
      return NextResponse.json({
        success: false,
        error: 'ID de chaîne requis'
      }, { status: 400 });
    }

    const videos = await getYouTubeVideos(channelId, maxResults);

    return NextResponse.json({
      success: true,
      data: videos
    });

  } catch (error) {
    console.error('Erreur API YouTube videos:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
} 