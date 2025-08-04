import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getYouTubeChannel } from '@/lib/youtube';
import { getTwitchChannel } from '@/lib/twitch';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { includeVideos = false } = body;

    console.log('🔄 Synchronisation globale de toutes les chaînes...');

    const results = {
      youtube: { success: false, data: null, error: null },
      twitch: { success: false, data: null, error: null }
    };

    // Synchronisation YouTube
    try {
      console.log('🔄 Début synchronisation YouTube...');
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
            console.log(`✅ YouTube mis à jour: ${youtubeChannel.title}`);
          }
        } catch (error) {
          console.error(`❌ Erreur sync YouTube ${chaine.nom_affichage}:`, error);
          errors++;
        }
      }

      results.youtube = {
        success: true,
        data: {
          total_chaines: chainesYouTube.length,
          mises_a_jour: updated,
          erreurs: errors
        },
        error: null
      };
      console.log('✅ Synchronisation YouTube terminée');
    } catch (error) {
      results.youtube.error = `Erreur synchronisation YouTube: ${error}`;
      console.error('❌ Erreur synchronisation YouTube:', error);
    }

    // Synchronisation Twitch
    try {
      console.log('🔄 Début synchronisation Twitch...');
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
          const twitchChannel = await getTwitchChannel(chaine.channel_id || chaine.nom);
          
          if (twitchChannel) {
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
            console.log(`✅ Twitch mis à jour: ${twitchChannel.display_name}`);
          }
        } catch (error) {
          console.error(`❌ Erreur sync Twitch ${chaine.nom_affichage}:`, error);
          errors++;
        }
      }

      results.twitch = {
        success: true,
        data: {
          total_chaines: chainesTwitch.length,
          mises_a_jour: updated,
          lives_actifs: liveStreams,
          erreurs: errors
        },
        error: null
      };
      console.log('✅ Synchronisation Twitch terminée');
    } catch (error) {
      results.twitch.error = `Erreur synchronisation Twitch: ${error}`;
      console.error('❌ Erreur synchronisation Twitch:', error);
    }

    const totalSuccess = (results.youtube.success ? 1 : 0) + (results.twitch.success ? 1 : 0);
    const totalErrors = (results.youtube.error ? 1 : 0) + (results.twitch.error ? 1 : 0);

    return NextResponse.json({
      success: totalSuccess > 0,
      data: {
        youtube: results.youtube,
        twitch: results.twitch,
        summary: {
          total_services: 2,
          services_reussis: totalSuccess,
          services_en_erreur: totalErrors,
          total_chaines_youtube: results.youtube.data?.total_chaines || 0,
          total_chaines_twitch: results.twitch.data?.total_chaines || 0,
          mises_a_jour_youtube: results.youtube.data?.mises_a_jour || 0,
          mises_a_jour_twitch: results.twitch.data?.mises_a_jour || 0,
          lives_twitch_actifs: results.twitch.data?.lives_actifs || 0
        }
      },
      message: `Synchronisation globale terminée: ${totalSuccess}/${2} services réussis`
    });

  } catch (error) {
    console.error('Erreur synchronisation globale:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la synchronisation globale'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Endpoint GET pour synchronisation manuelle rapide
export async function GET() {
  try {
    const fakeRequest = new NextRequest('http://localhost/api/sync/all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ includeVideos: false })
    });
    return await POST(fakeRequest);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la synchronisation GET'
    }, { status: 500 });
  }
}