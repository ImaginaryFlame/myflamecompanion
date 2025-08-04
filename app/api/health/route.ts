import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test basique sans base de données
    return NextResponse.json({
      success: true,
      message: 'API fonctionne',
      timestamp: new Date().toISOString(),
      status: 'healthy'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}