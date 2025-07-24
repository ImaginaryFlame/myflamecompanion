import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeLiveStreams } from '@/lib/youtube';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      return NextResponse.json({
        success: false,
        error: 'ID de chaîne requis'
      }, { status: 400 });
    }

    const streams = await getYouTubeLiveStreams(channelId);

    return NextResponse.json({
      success: true,
      data: streams
    });

  } catch (error) {
    console.error('Erreur API YouTube streams:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
} 