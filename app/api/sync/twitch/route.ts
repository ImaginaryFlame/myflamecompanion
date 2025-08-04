import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTwitchChannel, getTwitchVideos, getTwitchStream } from '@/lib/twitch';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, forceUpdate = false } = body;

    if (!username) {
      return NextResponse.json({
        success: false,
        error: 'username est requis'
      }, { status: 400 });
    }

    console.log(`🔄 Synchronisation Twitch chaîne: ${username}`);

    // Récupération des données depuis l'API Twitch
    const twitchChannel = await getTwitchChannel(username);
    if (!twitchChannel) {
      return NextResponse.json({
        success: false,
        error: 'Chaîne Twitch non trouvée'
      }, { status: 404 });
    }

    // Vérifier si la chaîne existe déjà en base
    let chaine = await prisma.chaine.findFirst({
      where: {
        channel_id: twitchChannel.id,
        type: 'twitch'
      }
    });

    if (chaine) {
      // Mise à jour des données existantes
      chaine = await prisma.chaine.update({
        where: { id: chaine.id },
        data: {
          nom: twitchChannel.login,
          nom_affichage: twitchChannel.display_name,
          description: twitchChannel.description,
          avatar_url: twitchChannel.profile_image_url,
          banniere_url: twitchChannel.offline_image_url,
          abonnes: twitchChannel.follower_count,
          vues_total: BigInt(twitchChannel.view_count),
          derniere_maj: new Date()
        }
      });
      console.log(`✅ Chaîne Twitch mise à jour: ${twitchChannel.display_name}`);
    } else {
      // Création d'une nouvelle chaîne
      chaine = await prisma.chaine.create({
        data: {
          nom: twitchChannel.login,
          type: 'twitch',
          channel_id: twitchChannel.id,
          nom_affichage: twitchChannel.display_name,
          description: twitchChannel.description,
          avatar_url: twitchChannel.profile_image_url,
          banniere_url: twitchChannel.offline_image_url,
          url_chaine: `https://twitch.tv/${twitchChannel.login}`,
          abonnes: twitchChannel.follower_count,
          videos_total: 0, // Sera mis à jour lors de la sync vidéos
          vues_total: BigInt(twitchChannel.view_count),
          actif: true,
          date_creation: new Date(),
          derniere_maj: new Date()
        }
      });
      console.log(`✅ Nouvelle chaîne Twitch créée: ${twitchChannel.display_name}`);
    }

    // Vérification du stream en cours
    let streamInfo = null;
    try {
      const currentStream = await getTwitchStream(username);
      if (currentStream) {
        streamInfo = {
          is_live: true,
          title: currentStream.title,
          game: currentStream.game_name,
          viewers: currentStream.viewer_count,
          started_at: currentStream.started_at
        };
      }
    } catch (error) {
      console.log('⚠️ Impossible de vérifier le stream en cours');
    }

    // Synchronisation des vidéos si demandé
    let videosCount = 0;
    if (forceUpdate) {
      console.log(`🎥 Synchronisation des vidéos Twitch...`);
      const twitchVideos = await getTwitchVideos(username, 50);
      
      for (const twitchVideo of twitchVideos) {
        // Vérifier si la vidéo existe déjà
        const existingVideo = await prisma.video.findFirst({
          where: {
            video_id: twitchVideo.id,
            chaine_id: chaine.id
          }
        });

        if (!existingVideo) {
          await prisma.video.create({
            data: {
              chaine_id: chaine.id,
              video_id: twitchVideo.id,
              titre: twitchVideo.title,
              description: twitchVideo.description,
              miniature_url: twitchVideo.thumbnail_url.replace('{width}', '320').replace('{height}', '180'),
              duree: parseTwitchDuration(twitchVideo.duration),
              vues: BigInt(twitchVideo.view_count),
              likes: 0, // Twitch ne fournit pas les likes
              commentaires: 0, // Twitch ne fournit pas les commentaires
              date_publication: new Date(twitchVideo.published_at),
              date_creation: new Date(),
              categorie: twitchVideo.type // 'upload', 'archive', 'highlight'
            }
          });
          videosCount++;
        }
      }

      // Mettre à jour le nombre total de vidéos
      await prisma.chaine.update({
        where: { id: chaine.id },
        data: {
          videos_total: await prisma.video.count({
            where: { chaine_id: chaine.id }
          })
        }
      });

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
        stream: streamInfo,
        nouvelles_videos: videosCount
      },
      message: `Chaîne Twitch synchronisée avec succès`
    });

  } catch (error) {
    console.error('Erreur synchronisation Twitch:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la synchronisation Twitch'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Synchronise toutes les chaînes Twitch actives
export async function GET() {
  try {
    const chainesTwitch = await prisma.chaine.findMany({
      where: {
        type: 'twitch',
        actif: true
      }
    });

    let updated = 0;
    let errors = 0;
    let liveStreams = 0;

    for (const chaine of chainesTwitch) {
      try {
        const twitchChannel = await getTwitchChannel(chaine.nom);
        
        if (twitchChannel) {
          // Vérifier si en live
          let isLive = false;
          try {
            const stream = await getTwitchStream(chaine.nom);
            isLive = !!stream;
            if (stream) liveStreams++;
          } catch (error) {
            console.log(`⚠️ Impossible de vérifier le stream pour ${chaine.nom_affichage}`);
          }

          await prisma.chaine.update({
            where: { id: chaine.id },
            data: {
              nom_affichage: twitchChannel.display_name,
              description: twitchChannel.description,
              avatar_url: twitchChannel.profile_image_url,
              banniere_url: twitchChannel.offline_image_url,
              abonnes: twitchChannel.follower_count,
              vues_total: BigInt(twitchChannel.view_count),
              derniere_maj: new Date()
            }
          });
          updated++;
          console.log(`✅ Mis à jour: ${twitchChannel.display_name}${isLive ? ' 🔴 LIVE' : ''}`);
        }
      } catch (error) {
        console.error(`❌ Erreur sync ${chaine.nom_affichage}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total_chaines: chainesTwitch.length,
        mises_a_jour: updated,
        lives_actifs: liveStreams,
        erreurs: errors
      },
      message: `Synchronisation Twitch terminée: ${updated} mises à jour, ${liveStreams} lives, ${errors} erreurs`
    });

  } catch (error) {
    console.error('Erreur synchronisation globale Twitch:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la synchronisation globale Twitch'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Convertit la durée Twitch (1h2m30s) en secondes
function parseTwitchDuration(duration: string): number {
  let totalSeconds = 0;
  
  // Recherche des heures
  const hoursMatch = duration.match(/(\d+)h/);
  if (hoursMatch) {
    totalSeconds += parseInt(hoursMatch[1]) * 3600;
  }
  
  // Recherche des minutes
  const minutesMatch = duration.match(/(\d+)m/);
  if (minutesMatch) {
    totalSeconds += parseInt(minutesMatch[1]) * 60;
  }
  
  // Recherche des secondes
  const secondsMatch = duration.match(/(\d+)s/);
  if (secondsMatch) {
    totalSeconds += parseInt(secondsMatch[1]);
  }
  
  return totalSeconds;
}