import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getYouTubeChannel, getYouTubeVideos, getYouTubeLiveStreams } from '@/lib/youtube';
import { getTwitchChannel, getTwitchStream, getTwitchVideos } from '@/lib/twitch';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Début de la synchronisation des chaînes...');

    // Récupération de toutes les chaînes actives
    const chainesDb = await prisma.chaine.findMany({
      where: { actif: true }
    });

    const results = {
      youtube: { updated: 0, errors: 0 },
      twitch: { updated: 0, errors: 0 },
      videos: { created: 0, errors: 0 },
      lives: { created: 0, errors: 0 }
    };

    for (const chaine of chainesDb) {
      try {
        console.log(`📡 Synchronisation: ${chaine.nom} (${chaine.type})`);

        if (chaine.type === 'youtube') {
          await syncYouTubeChannel(chaine, results);
        } else if (chaine.type === 'twitch') {
          await syncTwitchChannel(chaine, results);
        }

        // Petite pause pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Erreur sync ${chaine.nom}:`, error);
        if (chaine.type === 'youtube') {
          results.youtube.errors++;
        } else {
          results.twitch.errors++;
        }
      }
    }

    console.log('✅ Synchronisation terminée:', results);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Synchronisation terminée',
        results
      }
    });

  } catch (error) {
    console.error('❌ Erreur synchronisation globale:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la synchronisation'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

async function syncYouTubeChannel(chaine: any, results: any) {
  // Synchronisation des données de la chaîne
  const channelData = await getYouTubeChannel(chaine.channel_id);
  if (channelData) {
    await prisma.chaine.update({
      where: { id: chaine.id },
      data: {
        nom_affichage: channelData.title,
        description: channelData.description,
        avatar_url: channelData.thumbnails.high,
        abonnes: channelData.subscriberCount,
        videos_total: channelData.videoCount,
        vues_total: channelData.viewCount,
        derniere_maj: new Date()
      }
    });
    results.youtube.updated++;
    console.log(`✅ Chaîne YouTube mise à jour: ${channelData.title}`);
  }

  // Synchronisation des vidéos récentes
  const videos = await getYouTubeVideos(chaine.channel_id, 5);
  for (const video of videos) {
    try {
      // Vérifier si la vidéo existe déjà
      const existingVideo = await prisma.video.findFirst({
        where: {
          video_id: video.id,
          chaine_id: chaine.id
        }
      });

      if (!existingVideo) {
        await prisma.video.create({
          data: {
            video_id: video.id,
            titre: video.title,
            description: video.description,
            miniature_url: video.thumbnails.high,
            duree: parseDuration(video.duration),
            vues: video.viewCount,
            likes: video.likeCount,
            commentaires: video.commentCount,
            date_publication: new Date(video.publishedAt),
            chaine_id: chaine.id
          }
        });
        results.videos.created++;
        console.log(`📹 Nouvelle vidéo: ${video.title}`);
      }
    } catch (error) {
      console.error(`❌ Erreur création vidéo ${video.title}:`, error);
      results.videos.errors++;
    }
  }

  // Synchronisation des lives
  const streams = await getYouTubeLiveStreams(chaine.channel_id);
  for (const stream of streams) {
    try {
      const existingLive = await prisma.live.findFirst({
        where: {
          live_id: stream.id,
          chaine_id: chaine.id
        }
      });

      if (!existingLive) {
        const statut = stream.actualStartTime ? 
          (stream.actualEndTime ? 'termine' : 'en_cours') : 'programme';

        await prisma.live.create({
          data: {
            live_id: stream.id,
            titre: stream.title,
            description: stream.description,
            statut: statut as any,
            date_debut_prevue: stream.scheduledStartTime ? new Date(stream.scheduledStartTime) : null,
            spectateurs_actuel: stream.concurrentViewers || 0,
            url_live: `https://www.youtube.com/watch?v=${stream.id}`,
            chaine_id: chaine.id
          }
        });
        results.lives.created++;
        console.log(`🔴 Nouveau live: ${stream.title}`);
      }
    } catch (error) {
      console.error(`❌ Erreur création live ${stream.title}:`, error);
      results.lives.errors++;
    }
  }
}

async function syncTwitchChannel(chaine: any, results: any) {
  // Synchronisation des données de la chaîne
  const channelData = await getTwitchChannel(chaine.nom);
  if (channelData) {
    await prisma.chaine.update({
      where: { id: chaine.id },
      data: {
        nom_affichage: channelData.display_name,
        description: channelData.description,
        avatar_url: channelData.profile_image_url,
        abonnes: channelData.follower_count,
        vues_total: channelData.view_count,
        derniere_maj: new Date()
      }
    });
    results.twitch.updated++;
    console.log(`✅ Chaîne Twitch mise à jour: ${channelData.display_name}`);
  }

  // Vérification du stream en cours
  const stream = await getTwitchStream(chaine.nom);
  if (stream) {
    const existingLive = await prisma.live.findFirst({
      where: {
        live_id: stream.id,
        chaine_id: chaine.id
      }
    });

    if (!existingLive) {
      await prisma.live.create({
        data: {
          live_id: stream.id,
          titre: stream.title,
          description: `Jeu: ${stream.game_name}`,
          statut: 'en_cours',
          date_debut_prevue: new Date(stream.started_at),
          spectateurs_actuel: stream.viewer_count,
          url_live: `https://www.twitch.tv/${stream.user_login}`,
          chaine_id: chaine.id
        }
      });
      results.lives.created++;
      console.log(`🔴 Nouveau live Twitch: ${stream.title}`);
    } else {
      // Mise à jour des spectateurs
      await prisma.live.update({
        where: { id: existingLive.id },
        data: {
          spectateurs_actuel: stream.viewer_count
        }
      });
    }
  }

  // Synchronisation des vidéos récentes
  const videos = await getTwitchVideos(chaine.nom, 5);
  let videosCreated = 0;
  
  for (const video of videos) {
    try {
      const existingVideo = await prisma.video.findFirst({
        where: {
          video_id: video.id,
          chaine_id: chaine.id
        }
      });

      if (!existingVideo) {
        await prisma.video.create({
          data: {
            video_id: video.id,
            titre: video.title,
            description: video.description,
            miniature_url: video.thumbnail_url,
            duree: parseTwitchDuration(video.duration),
            vues: video.view_count,
            likes: 0, // Twitch ne fournit pas les likes
            commentaires: 0,
            date_publication: new Date(video.published_at),
            chaine_id: chaine.id
          }
        });
        results.videos.created++;
        videosCreated++;
        console.log(`📹 Nouvelle vidéo Twitch: ${video.title}`);
      }
    } catch (error) {
      console.error(`❌ Erreur création vidéo Twitch ${video.title}:`, error);
      results.videos.errors++;
    }
  }

  // Mettre à jour le nombre total de vidéos en base pour cette chaîne
  if (channelData || videosCreated > 0) {
    const totalVideos = await prisma.video.count({
      where: { chaine_id: chaine.id }
    });
    
    await prisma.chaine.update({
      where: { id: chaine.id },
      data: {
        videos_total: totalVideos,
        derniere_maj: new Date()
      }
    });
    
    console.log(`📊 Nombre total de vidéos mis à jour: ${totalVideos}`);
  }
}

// Utilitaire pour parser la durée YouTube (format ISO 8601)
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}

// Utilitaire pour parser la durée Twitch (format "1h2m3s")
function parseTwitchDuration(duration: string): number {
  const match = duration.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
} 