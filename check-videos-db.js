// Vérification des vidéos en base de données
const { PrismaClient } = require('@prisma/client');

async function checkVideosDb() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🎥 Vérification des vidéos en base de données...\n');
    
    // 1. Compter toutes les vidéos
    const totalVideos = await prisma.video.count();
    console.log(`📊 Total vidéos en base: ${totalVideos}`);
    
    if (totalVideos === 0) {
      console.log('❌ Aucune vidéo trouvée en base !');
      console.log('💡 Causes possibles:');
      console.log('   - Les vidéos ne sont pas récupérées par l\'API YouTube/Twitch');
      console.log('   - Problème dans la fonction de création des vidéos');
      console.log('   - Les vidéos existent mais sont filtrées\n');
    } else {
      // 2. Vidéos par chaîne
      const videosByChaine = await prisma.video.groupBy({
        by: ['chaine_id'],
        _count: {
          id: true
        },
        include: {
          chaine: {
            select: {
              nom: true,
              type: true
            }
          }
        }
      });
      
      console.log('\n📊 Répartition par chaîne:');
      for (const group of videosByChaine) {
        const chaine = await prisma.chaine.findUnique({
          where: { id: group.chaine_id },
          select: { nom: true, type: true }
        });
        console.log(`   - ${chaine?.nom} (${chaine?.type}): ${group._count.id} vidéos`);
      }
    }
    
    // 3. Dernières vidéos
    const dernieresVideos = await prisma.video.findMany({
      include: {
        chaine: {
          select: {
            nom: true,
            type: true
          }
        }
      },
      orderBy: {
        date_publication: 'desc'
      },
      take: 5
    });
    
    if (dernieresVideos.length > 0) {
      console.log('\n🎬 Dernières vidéos:');
      dernieresVideos.forEach((video, index) => {
        console.log(`   ${index + 1}. "${video.titre}"`);
        console.log(`      Chaîne: ${video.chaine.nom} (${video.chaine.type})`);
        console.log(`      Publié: ${video.date_publication.toLocaleDateString()}`);
        console.log(`      Durée: ${video.duree}s - Vues: ${video.vues}`);
        console.log('');
      });
    }
    
    // 4. Vérifier les chaînes
    const chainesAvecVideos = await prisma.chaine.findMany({
      include: {
        _count: {
          select: {
            videos: true
          }
        }
      }
    });
    
    console.log('📺 État des chaînes:');
    chainesAvecVideos.forEach(chaine => {
      console.log(`   - ${chaine.nom} (${chaine.type || chaine.plateforme}): ${chaine._count.videos} vidéos`);
      console.log(`     Channel ID: ${chaine.channel_id || 'N/A'}`);
      console.log(`     Actif: ${chaine.actif ? '✅' : '❌'}`);
      console.log('');
    });
    
    // 5. Test de l'API vidéos
    console.log('🔍 Test des APIs vidéos:');
    try {
      // Test YouTube
      const ytResponse = await fetch('http://localhost:3000/api/chaines/videos?type=youtube');
      if (ytResponse.ok) {
        const ytData = await ytResponse.json();
        console.log(`   - API YouTube: ${ytData.success ? '✅' : '❌'} - ${ytData.data?.length || 0} vidéos`);
      } else {
        console.log(`   - API YouTube: ❌ Status ${ytResponse.status}`);
      }
      
      // Test Twitch
      const twitchResponse = await fetch('http://localhost:3000/api/chaines/videos?type=twitch');
      if (twitchResponse.ok) {
        const twitchData = await twitchResponse.json();
        console.log(`   - API Twitch: ${twitchData.success ? '✅' : '❌'} - ${twitchData.data?.length || 0} vidéos`);
      } else {
        console.log(`   - API Twitch: ❌ Status ${twitchResponse.status}`);
      }
    } catch (error) {
      console.log('   - ❌ Erreur test APIs:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVideosDb(); 