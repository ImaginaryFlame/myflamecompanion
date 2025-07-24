import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chaineId = searchParams.get('chaine_id');
    const type = searchParams.get('type'); // 'youtube' ou 'twitch'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 1000; // Ou supprime complètement la limite

    let whereClause: any = {};

    if (chaineId) {
      whereClause.chaine_id = parseInt(chaineId);
    }

    // Construire la clause WHERE selon le type demandé
    if (type === 'youtube') {
      // Filtre YouTube : exclure les Shorts mais inclure BEAUCOUP plus de vidéos
      whereClause.AND = [
        { chaine: { type: 'youtube' } },
        { duree: { not: null } },        // Durée doit être renseignée
        { duree: { gte: 181 } },          // Vidéos >= 1.5 minutes (très inclusif)
        // Exclure seulement les vrais Shorts avec hashtags
        { 
          NOT: {
            OR: [
              {
                titre: {
                  contains: '#shorts',
                  mode: 'insensitive'
                }
              },
              {
                titre: {
                  contains: '#short',
                  mode: 'insensitive'
                }
              }
            ]
          }
        }
      ];
    } else if (type === 'twitch') {
      // Filtre Twitch : toutes les VODs
      whereClause.AND = [
        { chaine: { type: 'twitch' } }
      ];
    } else {
      // Si pas de type spécifique, inclure plus de vidéos
      whereClause.OR = [
        { chaine: { type: 'twitch' } }, // Toutes les vidéos Twitch
        { 
          AND: [
            { chaine: { type: 'youtube' } },
            { duree: { not: null } },    // Durée doit être renseignée
            { duree: { gte: 90 } },      // YouTube vidéos >= 1.5 minutes (très inclusif)
            // Exclure seulement les vrais Shorts avec hashtags
            { 
              NOT: {
                OR: [
                  {
                    titre: {
                      contains: '#shorts',
                      mode: 'insensitive'
                    }
                  },
                  {
                    titre: {
                      contains: '#short',
                      mode: 'insensitive'
                    }
                  }
                ]
              }
            }
          ]
        }
      ];
    }

    const videos = await prisma.video.findMany({
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
      orderBy: { date_publication: 'desc' },
      // take: limit
    });

    // Conversion des BigInt en Number pour la sérialisation JSON
    const videosFormatees = videos.map(video => ({
      ...video,
      vues: Number(video.vues), // Conversion BigInt -> Number
      date_publication: video.date_publication.toISOString(),
      date_creation: video.date_creation.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: videosFormatees
    });

  } catch (error) {
    console.error('Erreur récupération vidéos:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des vidéos'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 