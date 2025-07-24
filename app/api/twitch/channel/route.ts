import { NextRequest, NextResponse } from 'next/server';
import { getTwitchChannel, searchTwitchChannels } from '@/lib/twitch';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const query = searchParams.get('q');

    if (query) {
      // Recherche de chaînes
      const channels = await searchTwitchChannels(query);
      return NextResponse.json({
        success: true,
        data: channels
      });
    }

    if (!username) {
      return NextResponse.json({
        success: false,
        error: 'Nom d\'utilisateur ou requête de recherche requis'
      }, { status: 400 });
    }

    const channel = await getTwitchChannel(username);
    
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
    console.error('Erreur API Twitch channel:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
} 