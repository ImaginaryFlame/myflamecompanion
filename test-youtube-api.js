// Test direct de l'API YouTube
const { PrismaClient } = require('@prisma/client');

async function testYouTubeAPI() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📺 Test direct de l\'API YouTube...\n');
    
    // 1. Récupérer les chaînes YouTube
    const chainesYT = await prisma.chaine.findMany({
      where: {
        type: 'youtube',
        actif: true
      }
    });
    
    if (chainesYT.length === 0) {
      console.log('❌ Aucune chaîne YouTube trouvée !');
      return;
    }
    
    console.log(`✅ ${chainesYT.length} chaîne(s) YouTube trouvée(s):`);
    chainesYT.forEach(chaine => {
      console.log(`   - ${chaine.nom} (ID: ${chaine.channel_id})`);
    });
    
    // 2. Tester l'API YouTube pour chaque chaîne
    for (const chaine of chainesYT) {
      console.log(`\n🔍 Test pour ${chaine.nom}:`);
      
      try {
        // Test API Channel
        const channelResponse = await fetch(`http://localhost:3000/api/youtube/channel?id=${chaine.channel_id}`);
        if (channelResponse.ok) {
          const channelData = await channelResponse.json();
          console.log(`   ✅ Chaîne: ${channelData.success ? 'OK' : 'Erreur'}`);
          if (channelData.success) {
            console.log(`      Nom: ${channelData.data.title}`);
            console.log(`      Abonnés: ${channelData.data.subscriberCount}`);
            console.log(`      Vidéos: ${channelData.data.videoCount}`);
          }
        } else {
          console.log(`   ❌ Erreur chaîne: ${channelResponse.status}`);
        }
        
        // Test API Videos
        const videosResponse = await fetch(`http://localhost:3000/api/youtube/videos?channelId=${chaine.channel_id}&maxResults=5`);
        if (videosResponse.ok) {
          const videosData = await videosResponse.json();
          console.log(`   ✅ Vidéos: ${videosData.success ? 'OK' : 'Erreur'}`);
          if (videosData.success && videosData.data.length > 0) {
            console.log(`      ${videosData.data.length} vidéos trouvées:`);
            videosData.data.slice(0, 3).forEach((video, index) => {
              console.log(`        ${index + 1}. ${video.title}`);
              console.log(`           Durée: ${video.duration} - Vues: ${video.viewCount}`);
            });
          } else {
            console.log('      Aucune vidéo trouvée');
          }
        } else {
          console.log(`   ❌ Erreur vidéos: ${videosResponse.status}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Erreur test ${chaine.nom}:`, error.message);
      }
      
      // Pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 3. Test global de l'API
    console.log('\n🌐 Test API globale:');
    try {
      const globalResponse = await fetch('http://localhost:3000/api/chaines/videos?type=youtube');
      if (globalResponse.ok) {
        const globalData = await globalResponse.json();
        console.log(`   ✅ API globale: ${globalData.success ? 'OK' : 'Erreur'}`);
        console.log(`   📊 Total vidéos retournées: ${globalData.data?.length || 0}`);
      } else {
        console.log(`   ❌ Erreur API globale: ${globalResponse.status}`);
      }
    } catch (error) {
      console.log('   ❌ Erreur API globale:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testYouTubeAPI(); 