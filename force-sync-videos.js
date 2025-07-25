// Script pour forcer la synchronisation des vidéos
const { PrismaClient } = require('@prisma/client');

async function forceSyncVideos() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Forçage de la synchronisation des vidéos...\n');
    
    // 1. Vérifier l'état actuel
    const totalVideos = await prisma.video.count();
    console.log(`📊 Vidéos actuelles en base: ${totalVideos}`);
    
    // 2. Optionnel : Supprimer les anciennes vidéos (décommenter si nécessaire)
    console.log('\n🗑️ Suppression des anciennes vidéos...');
    const deletedVideos = await prisma.video.deleteMany({});
    console.log(`✅ ${deletedVideos.count} vidéos supprimées`);
    
    // 3. Forcer la synchronisation
    console.log('\n🔄 Lancement de la synchronisation forcée...');
    
    const response = await fetch('http://localhost:3000/api/sync/channels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('\n✅ Synchronisation terminée !');
      console.log('📊 Résultats:', JSON.stringify(result.data.results, null, 2));
      
      // 4. Vérifier les nouvelles vidéos
      const nouvellesVideos = await prisma.video.count();
      console.log(`\n📹 Nouvelles vidéos créées: ${nouvellesVideos}`);
      
      if (nouvellesVideos > 0) {
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
          take: 3
        });
        
        console.log('\n🎬 Dernières vidéos créées:');
        dernieresVideos.forEach((video, index) => {
          console.log(`   ${index + 1}. "${video.titre}"`);
          console.log(`      Chaîne: ${video.chaine.nom} (${video.chaine.type})`);
          console.log(`      Vues: ${video.vues} - Durée: ${video.duree}s`);
          console.log('');
        });
      } else {
        console.log('\n❌ Aucune vidéo n\'a été créée !');
        console.log('💡 Causes possibles:');
        console.log('   - Problème avec les APIs YouTube/Twitch');
        console.log('   - Les chaînes n\'ont pas de vidéos récentes');
        console.log('   - Erreur dans la fonction de création des vidéos');
      }
      
    } else {
      console.log('❌ Erreur lors de la synchronisation:', response.status);
      const errorText = await response.text();
      console.log('Détails:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forceSyncVideos(); 