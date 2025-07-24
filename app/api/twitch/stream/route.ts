import { NextRequest, NextResponse } from 'next/server';
import { getTwitchStream } from '@/lib/twitch';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({
        success: false,
        error: 'Nom d\'utilisateur requis'
      }, { status: 400 });
    }

    const stream = await getTwitchStream(username);

    return NextResponse.json({
      success: true,
      data: {
        isLive: !!stream,
        stream: stream
      }
    });

  } catch (error) {
    console.error('Erreur API Twitch stream:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
} 