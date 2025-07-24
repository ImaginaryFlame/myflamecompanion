import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeChannel, searchYouTubeChannel } from '@/lib/youtube';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('id');
    const query = searchParams.get('q');

    if (query) {
      // Recherche de chaînes
      const channels = await searchYouTubeChannel(query);
      return NextResponse.json({
        success: true,
        data: channels
      });
    }

    if (!channelId) {
      return NextResponse.json({
        success: false,
        error: 'ID de chaîne ou requête de recherche requis'
      }, { status: 400 });
    }

    const channel = await getYouTubeChannel(channelId);
    
    if (!channel) {
      return NextResponse.json({
        success: false,
        error: 'Chaîne non trouvée'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: channel
    });

  } catch (error) {
    console.error('Erreur API YouTube channel:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
} 