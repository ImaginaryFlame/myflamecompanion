import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Vérifier l'autorisation (optionnel - pour sécuriser le cron)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'default-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.log('⚠️ Tentative d\'accès non autorisée au cron job');
      // En développement, on laisse passer, en production on bloque
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
      }
    }

    console.log('⏰ Déclenchement du cron job de vérification automatique à 1h du matin...');

    // Appeler notre API de vérification automatique
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/auto-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Cron job terminé avec succès:', data);
      
      return NextResponse.json({
        success: true,
        message: 'Cron job exécuté avec succès',
        timestamp: new Date().toISOString(),
        resultats: data
      });
    } else {
      const error = await response.text();
      console.error('❌ Erreur dans le cron job:', error);
      
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'exécution du cron job',
        details: error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Erreur fatale cron job:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur fatale lors du cron job',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

// Supporter aussi POST pour plus de flexibilité
export async function POST(request: Request) {
  return GET(request);
} 