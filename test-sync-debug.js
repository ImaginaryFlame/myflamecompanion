// Test de diagnostic pour la synchronisation des chaînes
const { PrismaClient } = require('@prisma/client');

async function testSyncDebug() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Diagnostic de la synchronisation des chaînes...\n');
    
    // 1. Vérifier les chaînes en base
    console.log('1️⃣ Vérification des chaînes en base de données:');
    const chainesDb = await prisma.chaine.findMany({
      orderBy: { nom: 'asc' }
    });
    
    if (chainesDb.length === 0) {
      console.log('❌ PROBLÈME: Aucune chaîne trouvée en base de données !');
      console.log('💡 Solution: Ajoutez des chaînes via /admin/ajouter-chaine\n');
      return;
    }
    
    console.log(`✅ ${chainesDb.length} chaîne(s) trouvée(s):`);
    chainesDb.forEach(chaine => {
      console.log(`   - ${chaine.nom} (${chaine.plateforme || chaine.type}) - Actif: ${chaine.actif}`);
    });
    console.log('');
    
    // 2. Vérifier les chaînes actives
    const chainesActives = chainesDb.filter(c => c.actif);
    if (chainesActives.length === 0) {
      console.log('❌ PROBLÈME: Aucune chaîne active !');
      console.log('💡 Solution: Activez vos chaînes dans la base de données\n');
      return;
    }
    
    console.log(`2️⃣ Chaînes actives: ${chainesActives.length}/${chainesDb.length}`);
    
    // 3. Vérifier les variables d'environnement
    console.log('3️⃣ Vérification des clés API:');
    const youtubeKey = process.env.YOUTUBE_API_KEY;
    const twitchClientId = process.env.TWITCH_CLIENT_ID;
    const twitchSecret = process.env.TWITCH_CLIENT_SECRET;
    
    console.log(`   - YouTube API Key: ${youtubeKey ? '✅ Définie' : '❌ Manquante'}`);
    console.log(`   - Twitch Client ID: ${twitchClientId ? '✅ Définie' : '❌ Manquante'}`);
    console.log(`   - Twitch Secret: ${twitchSecret ? '✅ Définie' : '❌ Manquante'}`);
    console.log('');
    
    // 4. Test de l'API de synchronisation
    console.log('4️⃣ Test de l\'API de synchronisation:');
    try {
      const response = await fetch('http://localhost:3000/api/sync/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   - Status HTTP: ${response.status}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('   - Réponse:', JSON.stringify(result, null, 2));
      } else {
        const errorText = await response.text();
        console.log('   - Erreur:', errorText);
      }
    } catch (error) {
      console.log('   - ❌ Erreur de connexion:', error.message);
      console.log('   - 💡 Assurez-vous que le serveur Next.js fonctionne (npm run dev)');
    }
    
    console.log('');
    
    // 5. Vérifier les vidéos existantes
    console.log('5️⃣ Vérification des vidéos existantes:');
    const videos = await prisma.video.findMany({
      include: {
        chaine: true
      },
      orderBy: {
        date_publication: 'desc'
      },
      take: 5
    });
    
    if (videos.length === 0) {
      console.log('   - ❌ Aucune vidéo en base');
      console.log('   - 💡 La synchronisation devrait créer des vidéos');
    } else {
      console.log(`   - ✅ ${videos.length} vidéos trouvées (dernières 5):`);
      videos.forEach(video => {
        console.log(`     • ${video.titre} (${video.chaine?.nom})`);
      });
    }
    
    console.log('\n📋 RÉSUMÉ DU DIAGNOSTIC:');
    console.log('========================');
    
    if (chainesDb.length === 0) {
      console.log('🚨 CRITIQUE: Pas de chaînes en base');
    } else if (chainesActives.length === 0) {
      console.log('🚨 CRITIQUE: Pas de chaînes actives');
    } else if (!youtubeKey && !twitchClientId) {
      console.log('🚨 CRITIQUE: Pas de clés API configurées');
    } else {
      console.log('✅ Configuration de base OK');
      console.log('💡 Si la sync ne fonctionne pas, vérifiez les logs du serveur');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSyncDebug(); 