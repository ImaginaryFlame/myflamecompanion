import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getYouTubeChannel, getYouTubeVideos } from '@/lib/youtube';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channelId, forceUpdate = false } = body;

    if (!channelId) {
      return NextResponse.json({
        success: false,
        error: 'channelId est requis'
      }, { status: 400 });
    }

    console.log(`🔄 Synchronisation YouTube chaîne: ${channelId}`);

    // Récupération des données depuis l'API YouTube
    const youtubeChannel = await getYouTubeChannel(channelId);
    if (!youtubeChannel) {
      return NextResponse.json({
        success: false,
        error: 'Chaîne YouTube non trouvée'
      }, { status: 404 });
    }

    // Vérifier si la chaîne existe déjà en base
    let chaine = await prisma.chaine.findFirst({
      where: {
        channel_id: channelId,
        type: 'youtube'
      }
    });

    if (chaine) {
      // Mise à jour des données existantes
      chaine = await prisma.chaine.update({
        where: { id: chaine.id },
        data: {
          nom_affichage: youtubeChannel.title,
          description: youtubeChannel.description,
          avatar_url: youtubeChannel.thumbnails.high,
          abonnes: youtubeChannel.subscriberCount,
          videos_total: youtubeChannel.videoCount,
          vues_total: BigInt(youtubeChannel.viewCount),
          derniere_maj: new Date()
        }
      });
      console.log(`✅ Chaîne YouTube mise à jour: ${youtubeChannel.title}`);
    } else {
      // Création d'une nouvelle chaîne
      chaine = await prisma.chaine.create({
        data: {
          nom: youtubeChannel.title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
          type: 'youtube',
          channel_id: channelId,
          nom_affichage: youtubeChannel.title,
          description: youtubeChannel.description,
          avatar_url: youtubeChannel.thumbnails.high,
          url_chaine: `https://youtube.com/channel/${channelId}`,
          abonnes: youtubeChannel.subscriberCount,
          videos_total: youtubeChannel.videoCount,
          vues_total: BigInt(youtubeChannel.viewCount),
          actif: true,
          date_creation: new Date(),
          derniere_maj: new Date()
        }
      });
      console.log(`✅ Nouvelle chaîne YouTube créée: ${youtubeChannel.title}`);
    }

    // Synchronisation des vidéos si demandé
    let videosCount = 0;
    if (forceUpdate) {
      console.log(`🎥 Synchronisation des vidéos YouTube...`);
      const youtubeVideos = await getYouTubeVideos(channelId, 50, true);
      
      for (const youtubeVideo of youtubeVideos) {
        // Vérifier si la vidéo existe déjà
        const existingVideo = await prisma.video.findFirst({
          where: {
            video_id: youtubeVideo.id,
            chaine_id: chaine.id
          }
        });

        if (!existingVideo) {
          await prisma.video.create({
            data: {
              chaine_id: chaine.id,
              video_id: youtubeVideo.id,
              titre: youtubeVideo.title,
              description: youtubeVideo.description,
              miniature_url: youtubeVideo.thumbnails.high,
              duree: parseDuration(youtubeVideo.duration),
              vues: BigInt(youtubeVideo.viewCount),
              likes: youtubeVideo.likeCount,
              commentaires: youtubeVideo.commentCount,
              date_publication: new Date(youtubeVideo.publishedAt),
              date_creation: new Date(),
              categorie: 'video'
            }
          });
          videosCount++;
        }
      }
      console.log(`✅ ${videosCount} nouvelles vidéos synchronisées`);
    }

    return NextResponse.json({
      success: true,
      data: {
        chaine: {
          id: chaine.id,
          nom_affichage: chaine.nom_affichage,
          abonnes: chaine.abonnes,
          videos_total: chaine.videos_total,
          vues_total: Number(chaine.vues_total)
        },
        nouvelles_videos: videosCount
      },
      message: `Chaîne YouTube synchronisée avec succès`
    });

  } catch (error) {
    console.error('Erreur synchronisation YouTube:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la synchronisation YouTube'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Synchronise toutes les chaînes YouTube actives
export async function GET() {
  try {
    const chainesYouTube = await prisma.chaine.findMany({
      where: {
        type: 'youtube',
        actif: true
      }
    });

    let updated = 0;
    let errors = 0;

    for (const chaine of chainesYouTube) {
      try {
        const youtubeChannel = await getYouTubeChannel(chaine.channel_id);
        
        if (youtubeChannel) {
          await prisma.chaine.update({
            where: { id: chaine.id },
            data: {
              nom_affichage: youtubeChannel.title,
              description: youtubeChannel.description,
              avatar_url: youtubeChannel.thumbnails.high,
              abonnes: youtubeChannel.subscriberCount,
              videos_total: youtubeChannel.videoCount,
              vues_total: BigInt(youtubeChannel.viewCount),
              derniere_maj: new Date()
            }
          });
          updated++;
          console.log(`✅ Mis à jour: ${youtubeChannel.title}`);
        }
      } catch (error) {
        console.error(`❌ Erreur sync ${chaine.nom_affichage}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total_chaines: chainesYouTube.length,
        mises_a_jour: updated,
        erreurs: errors
      },
      message: `Synchronisation YouTube terminée: ${updated} mises à jour, ${errors} erreurs`
    });

  } catch (error) {
    console.error('Erreur synchronisation globale YouTube:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la synchronisation globale YouTube'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Convertit la durée YouTube (PT4M13S) en secondes
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}