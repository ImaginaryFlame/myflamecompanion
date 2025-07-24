import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chaineId = searchParams.get('chaineId');
    const statut = searchParams.get('statut'); // 'en_cours', 'programme', 'termine'

    let whereClause: any = {};
    
    if (chaineId) {
      whereClause.chaine_id = parseInt(chaineId);
    }

    if (statut) {
      whereClause.statut = statut;
    } else {
      // Par défaut, récupérer SEULEMENT les lives en cours (actifs)
      whereClause.statut = 'en_cours';
    }

    const lives = await prisma.live.findMany({
      where: whereClause,
      include: {
        chaine: {
          select: {
            id: true,
            nom: true,
            type: true,
            nom_affichage: true,
            avatar_url: true
          }
        }
      },
      orderBy: [
        { statut: 'asc' }, // en_cours en premier
        { date_debut_prevue: 'asc' }
      ]
    });

    // Conversion des dates en ISO string pour la sérialisation JSON
    const livesFormatees = lives.map(live => ({
      ...live,
      date_debut_prevue: live.date_debut_prevue?.toISOString() || null,
      date_debut_reelle: live.date_debut_reelle?.toISOString() || null,
      date_fin: live.date_fin?.toISOString() || null,
      date_creation: live.date_creation.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: livesFormatees
    });

  } catch (error) {
    console.error('Erreur récupération lives:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des lives'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 