import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🕐 Cron: Synchronisation automatique des chaînes');

    // Appel de l'API de synchronisation
    const syncResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/sync/channels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const syncResult = await syncResponse.json();

    if (syncResult.success) {
      console.log('✅ Cron: Synchronisation réussie', syncResult.data.results);
      
      return NextResponse.json({
        success: true,
        message: 'Synchronisation automatique réussie',
        data: syncResult.data
      });
    } else {
      console.error('❌ Cron: Erreur synchronisation', syncResult.error);
      
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la synchronisation automatique'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Cron: Erreur critique:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur critique de synchronisation'
    }, { status: 500 });
  }
} 