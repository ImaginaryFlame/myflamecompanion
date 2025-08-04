'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalHistoires: number;
  totalChapitres: number;
  nouvellesNotifications: number;
  abonnesYouTube: number;
  abonnesTwitch: number;
  vuesYouTube: number;
  vuesTwitch: number;
  totalVideos: number;
}


export default function CentreControlePage() {
  const [stats, setStats] = useState<Stats>({
    totalHistoires: 0,
    totalChapitres: 0,
    nouvellesNotifications: 0,
    abonnesYouTube: 0,
    abonnesTwitch: 0,
    vuesYouTube: 0,
    vuesTwitch: 0,
    totalVideos: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [scrapingLoading, setScrapingLoading] = useState(false);
  const [autoCheckLoading, setAutoCheckLoading] = useState(false);

  useEffect(() => {
    chargerStats();
  }, []);

  const chargerStats = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Début du chargement des stats...');

      // Charger les histoires
      console.log('🔍 Chargement des histoires...');
      const histoireResponse = await fetch('/api/histoire');
      if (!histoireResponse.ok) {
        console.error('❌ Erreur histoire:', histoireResponse.status, histoireResponse.statusText);
      }
      const histoireResult = histoireResponse.ok ? await histoireResponse.json() : { success: false };
      const histoireData = histoireResult.success ? histoireResult.data : [];
      console.log('✅ Histoires chargées:', Array.isArray(histoireData) ? histoireData.length : 'N/A');

      // Charger les chapitres
      console.log('🔍 Chargement des chapitres...');
      const chapitreResponse = await fetch('/api/chapitre');
      if (!chapitreResponse.ok) {
        console.error('❌ Erreur chapitres:', chapitreResponse.status, chapitreResponse.statusText);
      }
      const chapitreResult = chapitreResponse.ok ? await chapitreResponse.json() : { success: false };
      const chapitreData = chapitreResult.success ? chapitreResult.data : [];
      console.log('✅ Chapitres chargés:', Array.isArray(chapitreData) ? chapitreData.length : 'N/A');

      // Charger les notifications
      console.log('🔍 Chargement des notifications...');
      const notifResponse = await fetch('/api/notification');
      if (!notifResponse.ok) {
        console.error('❌ Erreur notifications:', notifResponse.status, notifResponse.statusText);
      }
      const notifResult = notifResponse.ok ? await notifResponse.json() : { success: false };
      const notifData = notifResult.success ? notifResult.data : [];
      console.log('✅ Notifications chargées:', Array.isArray(notifData) ? notifData.length : 'N/A');

      // Charger les chaînes pour les stats
      console.log('🔍 Chargement des chaînes...');
      const chainesResponse = await fetch('/api/chaines');
      if (!chainesResponse.ok) {
        console.error('❌ Erreur chaînes:', chainesResponse.status, chainesResponse.statusText);
      }
      const chainesResult = chainesResponse.ok ? await chainesResponse.json() : { success: false };
      const chainesData = chainesResult.success ? chainesResult.data : [];
      console.log('✅ Chaînes chargées:', Array.isArray(chainesData) ? chainesData.length : 'N/A');

      // Charger les vidéos pour compter le total
      console.log('🔍 Chargement des vidéos YouTube...');
      const youtubeResponse = await fetch('/api/chaines/videos?type=youtube');
      if (!youtubeResponse.ok) {
        console.error('❌ Erreur YouTube:', youtubeResponse.status, youtubeResponse.statusText);
      }
      const youtubeResult = youtubeResponse.ok ? await youtubeResponse.json() : { success: false };
      const youtubeData = youtubeResult.success ? youtubeResult.data : [];
      console.log('✅ Vidéos YouTube chargées:', Array.isArray(youtubeData) ? youtubeData.length : 'N/A');

      console.log('🔍 Chargement des VODs Twitch...');
      const twitchResponse = await fetch('/api/chaines/videos?type=twitch');
      if (!twitchResponse.ok) {
        console.error('❌ Erreur Twitch:', twitchResponse.status, twitchResponse.statusText);
      }
      const twitchResult = twitchResponse.ok ? await twitchResponse.json() : { success: false };
      const twitchData = twitchResult.success ? twitchResult.data : [];
      console.log('✅ VODs Twitch chargées:', Array.isArray(twitchData) ? twitchData.length : 'N/A');

      // Calculer les stats essentielles
      console.log('🧮 Calcul des statistiques...');
      let nouvellesNotifications = 0;
      let chainesYouTube = [];
      let chainesTwitch = [];
      let abonnesYouTube = 0;
      let abonnesTwitch = 0;
      let vuesYouTube = 0;
      let vuesTwitch = 0;
      let totalVideos = 0;

      try {
        nouvellesNotifications = Array.isArray(notifData) ? notifData.filter((n: any) => n && !n.lu).length : 0;
        console.log('✅ Notifications non lues:', nouvellesNotifications);

        chainesYouTube = Array.isArray(chainesData) ? chainesData.filter((c: any) => c && c.type === 'youtube') : [];
        chainesTwitch = Array.isArray(chainesData) ? chainesData.filter((c: any) => c && c.type === 'twitch') : [];
        console.log('✅ Chaînes filtrées - YouTube:', chainesYouTube.length, 'Twitch:', chainesTwitch.length);

        abonnesYouTube = chainesYouTube.reduce((acc: number, c: any) => acc + (Number(c?.abonnes) || 0), 0);
        abonnesTwitch = chainesTwitch.reduce((acc: number, c: any) => acc + (Number(c?.abonnes) || 0), 0);
        vuesYouTube = chainesYouTube.reduce((acc: number, c: any) => acc + (Number(c?.vues_total) || 0), 0);
        vuesTwitch = chainesTwitch.reduce((acc: number, c: any) => acc + (Number(c?.vues_total) || 0), 0);
        totalVideos = (Array.isArray(youtubeData) ? youtubeData.length : 0) + (Array.isArray(twitchData) ? twitchData.length : 0);
        console.log('✅ Stats calculées avec succès');
      } catch (calcError) {
        console.error('❌ Erreur lors du calcul des stats:', calcError);
        // Les valeurs par défaut sont déjà initialisées à 0
      }

      console.log('📊 Stats calculées:', {
        totalHistoires: Array.isArray(histoireData) ? histoireData.length : 0,
        totalChapitres: Array.isArray(chapitreData) ? chapitreData.length : 0,
        nouvellesNotifications,
        abonnesYouTube,
        abonnesTwitch,
        vuesYouTube,
        vuesTwitch,
        totalVideos
      });

      setStats({
        totalHistoires: Array.isArray(histoireData) ? histoireData.length : 0,
        totalChapitres: Array.isArray(chapitreData) ? chapitreData.length : 0,
        nouvellesNotifications,
        abonnesYouTube,
        abonnesTwitch,
        vuesYouTube,
        vuesTwitch,
        totalVideos
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour formater les nombres
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Supprimer les données de test
  const supprimerDonneesTest = async () => {
    try {
      const response = await fetch('/api/chaines/clear-test-data', {
        method: 'POST'
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        alert(`✅ Données de test supprimées !\n${data.data.chainesSupprimes} chaînes supprimées`);
        await chargerStats();
      } else {
        alert(`❌ Erreur: ${data.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur suppression données test:', error);
      alert('❌ Erreur réseau');
    }
  };

  // Test de diagnostic des API
  const testerAPIs = async () => {
    const endpoints = [
      '/api/histoire',
      '/api/chapitre', 
      '/api/notification',
      '/api/chaines',
      '/api/chaines/videos?type=youtube',
      '/api/auto-check',
      '/api/sync/channels',
      '/api/scraping/full-sync',
      '/api/cache/clear'
    ];

    console.log('🧪 Test de diagnostic des API...');
    let resultats = [];

    for (const endpoint of endpoints) {
      try {
        const start = Date.now();
        const response = await fetch(endpoint, {
          method: endpoint.includes('auto-check') || endpoint.includes('sync') || endpoint.includes('scraping') || endpoint.includes('cache') ? 'POST' : 'GET'
        });
        const end = Date.now();
        const status = response.ok ? '✅' : '❌';
        resultats.push(`${status} ${endpoint} - ${response.status} (${end - start}ms)`);
      } catch (error) {
        resultats.push(`❌ ${endpoint} - ERREUR: ${error}`);
      }
    }

    alert(`🧪 Diagnostic des API:\n\n${resultats.join('\n')}`);
  };

  // Synchronisation des APIs sociales
  const synchroniserAPIsSociales = async () => {
    try {
      setScrapingLoading(true);
      const response = await fetch('/api/sync/all', {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const summary = result.data.summary;
          alert(`✅ Synchronisation des APIs sociales terminée !
          
📊 Résultats détaillés:
• YouTube: ${summary.mises_a_jour_youtube}/${summary.total_chaines_youtube} chaînes mises à jour
• Twitch: ${summary.mises_a_jour_twitch}/${summary.total_chaines_twitch} chaînes mises à jour
• Lives Twitch actifs: ${summary.lives_twitch_actifs}
• Services réussis: ${summary.services_reussis}/${summary.total_services}

🔥 Données Imaginary Flame synchronisées !`);
        } else {
          alert('⚠️ Synchronisation partielle - voir les détails dans les logs');
        }
        await chargerStats();
      } else {
        alert('❌ Erreur lors de la synchronisation des APIs sociales');
      }
    } catch (error) {
      console.error('Erreur sync APIs sociales:', error);
      alert('❌ Erreur réseau');
    } finally {
      setScrapingLoading(false);
    }
  };

  // Actions de contrôle
  const declencherAutoCheck = async () => {
    try {
      setAutoCheckLoading(true);
      const response = await fetch('/api/auto-check', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Vérification terminée !\n${data.totalNouveauxChapitres} nouveaux chapitres détectés`);
        await chargerStats();
      } else {
        alert('❌ Erreur lors de la vérification automatique');
      }
    } catch (error) {
      console.error('Erreur auto-check:', error);
      alert('❌ Erreur réseau');
    } finally {
      setAutoCheckLoading(false);
    }
  };


  const lancerScrapingComplet = async () => {
    try {
      setScrapingLoading(true);
      const response = await fetch('/api/scraping/full-sync', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Scraping complet terminé !\nHistoires: ${data.histoires?.updated || 0} mises à jour\nChaînes: ${data.chaines?.synced || 0} synchronisées`);
        await chargerStats();
      } else {
        alert('❌ Erreur lors du scraping complet');
      }
    } catch (error) {
      console.error('Erreur scraping:', error);
      alert('❌ Erreur réseau');
    } finally {
      setScrapingLoading(false);
    }
  };

  const nettoyerCache = async () => {
    try {
      const response = await fetch('/api/cache/clear', {
        method: 'POST'
      });

      if (response.ok) {
        alert('✅ Cache nettoyé avec succès !');
      } else {
        alert('❌ Erreur lors du nettoyage du cache');
      }
    } catch (error) {
      console.error('Erreur nettoyage cache:', error);
      alert('❌ Erreur réseau');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du centre de contrôle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎛️ Centre de Contrôle
          </h1>
          <p className="text-gray-600">
            Contrôle total du système MyFlameCompanion - Histoires, Chaînes et Synchronisations
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow text-white">
            <div className="flex items-center">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium opacity-90">Histoires</p>
                <p className="text-2xl font-bold">{stats.totalHistoires}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow text-white">
            <div className="flex items-center">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <span className="text-2xl">📖</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium opacity-90">Chapitres</p>
                <p className="text-2xl font-bold">{stats.totalChapitres}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-lg shadow text-white">
            <div className="flex items-center">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <span className="text-2xl">🔔</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium opacity-90">Notifications</p>
                <p className="text-2xl font-bold">{stats.nouvellesNotifications}</p>
              </div>
            </div>
          </div>

          {/* Stats YouTube */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-lg shadow text-white">
            <div className="flex items-center">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium opacity-90">Abonnés YT</p>
                <p className="text-2xl font-bold">{formatNumber(stats.abonnesYouTube)}</p>
              </div>
            </div>
          </div>

          {/* Stats Twitch */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow text-white">
            <div className="flex items-center">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium opacity-90">Followers</p>
                <p className="text-2xl font-bold">{formatNumber(stats.abonnesTwitch)}</p>
              </div>
            </div>
          </div>

          {/* Vues YouTube */}
          <div className="bg-gradient-to-br from-red-400 to-red-500 p-6 rounded-lg shadow text-white">
            <div className="flex items-center">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <span className="text-2xl">👀</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium opacity-90">Vues YT</p>
                <p className="text-2xl font-bold">{formatNumber(stats.vuesYouTube)}</p>
              </div>
            </div>
          </div>

          {/* Vues Twitch */}
          <div className="bg-gradient-to-br from-purple-400 to-purple-500 p-6 rounded-lg shadow text-white">
            <div className="flex items-center">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <span className="text-2xl">👀</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium opacity-90">Vues Twitch</p>
                <p className="text-2xl font-bold">{formatNumber(stats.vuesTwitch)}</p>
              </div>
            </div>
          </div>

          {/* Total Vidéos */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-lg shadow text-white">
            <div className="flex items-center">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <span className="text-2xl">🎥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium opacity-90">Total Vidéos</p>
                <p className="text-2xl font-bold">{stats.totalVideos}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions principales */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📚 Contrôles système
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={declencherAutoCheck}
              disabled={autoCheckLoading}
              className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {autoCheckLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Vérification...
                </>
              ) : (
                <>
                  <span className="text-xl mr-2">🔍</span>
                  Vérifier histoires
                </>
              )}
            </button>

            <button
              onClick={synchroniserAPIsSociales}
              disabled={scrapingLoading}
              className="p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {scrapingLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sync APIs...
                </>
              ) : (
                <>
                  <span className="text-xl mr-2">🔄</span>
                  Sync APIs Sociales
                </>
              )}
            </button>

            <button
              onClick={lancerScrapingComplet}
              disabled={scrapingLoading}
              className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {scrapingLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Scraping...
                </>
              ) : (
                <>
                  <span className="text-xl mr-2">🕷️</span>
                  Scraping complet
                </>
              )}
            </button>

            <a
              href="/admin/scraping"
              className="p-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center"
            >
              <span className="text-xl mr-2">➕</span>
              Nouvelle histoire
            </a>
          </div>
        </div>


        {/* Actions système */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ⚙️ Actions système
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={supprimerDonneesTest}
              className="p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <div className="text-2xl mb-2">🗑️</div>
              <div className="font-medium">Nettoyer Test</div>
            </button>

            <button
              onClick={testerAPIs}
              className="p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <div className="text-2xl mb-2">🧪</div>
              <div className="font-medium">Test API</div>
            </button>

            <button
              onClick={nettoyerCache}
              className="p-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <div className="text-2xl mb-2">🧹</div>
              <div className="font-medium">Nettoyer cache</div>
            </button>

            <a
              href="/admin/dashboard"
              className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">Dashboard Admin</div>
            </a>

            <a
              href="/admin/gerer-histoires"
              className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🗂️</div>
              <div className="font-medium">Gérer histoires</div>
            </a>

            <a
              href="/admin/wiki"
              className="p-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📚</div>
              <div className="font-medium">Admin Wiki</div>
            </a>

            <a
              href="/dashboard"
              className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🏠</div>
              <div className="font-medium">Dashboard Utilisateur</div>
            </a>
          </div>
        </div>

        {/* Informations système */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            🤖 Informations système
          </h3>
          <div className="text-sm text-gray-700">
            <h4 className="font-medium mb-2">📚 Système MyFlameCompanion:</h4>
            <ul className="space-y-1">
              <li>• Vérification automatique quotidienne des histoires Wattpad</li>
              <li>• Scraping intelligent multi-méthodes</li>
              <li>• Notifications automatiques pour nouveaux chapitres</li>
              <li>• Sauvegarde automatique des progressions de lecture</li>
              <li>• Système de planification de lecture intégré</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 