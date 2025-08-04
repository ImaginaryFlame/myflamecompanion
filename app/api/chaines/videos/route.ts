import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { mockVideos, mockChaines } from '@/lib/mock-data';

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
      // Filtre YouTube : vidéos horizontales et longues (>2.5 minutes)
      whereClause.AND = [
        { chaine: { type: 'youtube' } },
        { duree: { not: null } },        // Durée doit être renseignée
        { duree: { gte: 150 } },         // Vidéos >= 2.5 minutes (150 secondes)
        // Exclure les Shorts et formats verticaux
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
              },
              {
                titre: {
                  contains: 'vertical',
                  mode: 'insensitive'
                }
              },
              {
                titre: {
                  contains: 'tiktok',
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
      // Si pas de type spécifique, inclure toutes les vidéos longues (>2.5 minutes)
      whereClause.OR = [
        { chaine: { type: 'twitch' } }, // Toutes les vidéos Twitch
        { 
          AND: [
            { chaine: { type: 'youtube' } },
            { duree: { not: null } },    // Durée doit être renseignée
            { duree: { gte: 150 } },     // YouTube vidéos >= 2.5 minutes
            // Exclure les Shorts et formats verticaux
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
                  },
                  {
                    titre: {
                      contains: 'vertical',
                      mode: 'insensitive'
                    }
                  },
                  {
                    titre: {
                      contains: 'tiktok',
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

    let videos = [];
    
    try {
      videos = await prisma.video.findMany({
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
    } catch (dbError) {
      throw dbError; // Remonter l'erreur pour traitement global
    }

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
      error: 'Erreur de connexion à la base de données',
      data: []
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 