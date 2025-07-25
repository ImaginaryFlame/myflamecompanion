'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalHistoires: number;
  totalChapitres: number;
  nouvellesNotifications: number;
  // Statistiques YouTube
  chainesYouTube: number;
  videosYouTube: number;
  vuesYouTube: number;
  abonnesYouTube: number;
  // Statistiques Twitch
  chainesTwitch: number;
  vodsTwitch: number;
  vuesTwitch: number;
  abonnesTwitch: number;
}

interface Chaine {
  id: number;
  nom: string;
  plateforme: string;
  abonnes: number;
  vues_total: number;
  derniere_maj: string;
}

export default function CentreControlePage() {
  const [stats, setStats] = useState<Stats>({
    totalHistoires: 0,
    totalChapitres: 0,
    nouvellesNotifications: 0,
    // YouTube
    chainesYouTube: 0,
    videosYouTube: 0,
    vuesYouTube: 0,
    abonnesYouTube: 0,
    // Twitch
    chainesTwitch: 0,
    vodsTwitch: 0,
    vuesTwitch: 0,
    abonnesTwitch: 0
  });
  const [chaines, setChaines] = useState<Chaine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [scrapingLoading, setScrapingLoading] = useState(false);
  const [autoCheckLoading, setAutoCheckLoading] = useState(false);

  useEffect(() => {
    chargerStats();
  }, []);

  const chargerStats = async () => {
    try {
      setIsLoading(true);

      // Charger les histoires
      const histoireResponse = await fetch('/api/histoire');
      const histoireResult = histoireResponse.ok ? await histoireResponse.json() : { success: false };
      const histoireData = histoireResult.success ? histoireResult.data : [];

      // Charger les chapitres
      const chapitreResponse = await fetch('/api/chapitre');
      const chapitreResult = chapitreResponse.ok ? await chapitreResponse.json() : { success: false };
      const chapitreData = chapitreResult.success ? chapitreResult.data : [];

      // Charger les notifications
      const notifResponse = await fetch('/api/notification');
      const notifResult = notifResponse.ok ? await notifResponse.json() : { success: false };
      const notifData = notifResult.success ? notifResult.data : [];

      // Charger les chaînes
      const chainesResponse = await fetch('/api/chaines');
      const chainesResult = chainesResponse.ok ? await chainesResponse.json() : { success: false };
      const chainesData = chainesResult.success ? chainesResult.data : [];
      setChaines(chainesData);

      // Charger les vidéos YouTube
      const youtubeResponse = await fetch('/api/chaines/videos?type=youtube');
      const youtubeResult = youtubeResponse.ok ? await youtubeResponse.json() : { success: false };
      const youtubeData = youtubeResult.success ? youtubeResult.data : [];

      // Charger les VODs Twitch
      const twitchResponse = await fetch('/api/chaines/videos?type=twitch');
      const twitchResult = twitchResponse.ok ? await twitchResponse.json() : { success: false };
      const twitchData = twitchResult.success ? twitchResult.data : [];

      // Calculer les stats séparées par plateforme
      const nouvellesNotifications = notifData.filter((n: any) => !n.lu).length;

      // Statistiques par plateforme
      const chainesYouTube = chainesData.filter((c: any) => c.plateforme === 'youtube');
      const chainesTwitch = chainesData.filter((c: any) => c.plateforme === 'twitch');

      const vuesYouTube = chainesYouTube.reduce((acc: number, c: any) => acc + (Number(c.vues_total) || 0), 0);
      const abonnesYouTube = chainesYouTube.reduce((acc: number, c: any) => acc + (Number(c.abonnes) || 0), 0);

      const vuesTwitch = chainesTwitch.reduce((acc: number, c: any) => acc + (Number(c.vues_total) || 0), 0);
      const abonnesTwitch = chainesTwitch.reduce((acc: number, c: any) => acc + (Number(c.abonnes) || 0), 0);

      setStats({
        totalHistoires: histoireData.length,
        totalChapitres: chapitreData.length,
        nouvellesNotifications,
        // YouTube
        chainesYouTube: chainesYouTube.length,
        videosYouTube: youtubeData.length,
        vuesYouTube,
        abonnesYouTube,
        // Twitch
        chainesTwitch: chainesTwitch.length,
        vodsTwitch: twitchData.length,
        vuesTwitch,
        abonnesTwitch
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

  const synchroniserToutesChaines = async () => {
    try {
      setSyncLoading(true);
      const response = await fetch('/api/sync/channels', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Synchronisation terminée !\nYouTube: ${data.youtube?.updated || 0} chaînes\nTwitch: ${data.twitch?.updated || 0} chaînes\nVidéos: ${data.videos?.created || 0} nouvelles`);
        await chargerStats();
      } else {
        alert('❌ Erreur lors de la synchronisation');
      }
    } catch (error) {
      console.error('Erreur synchronisation:', error);
      alert('❌ Erreur réseau');
    } finally {
      setSyncLoading(false);
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎛️ Centre de Contrôle Avancé
          </h1>
          <p className="text-gray-600">
            Contrôle total du système MyFlameCompanion - Histoires, Chaînes et Synchronisations
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6 mb-8">
          {/* Wattpad */}
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

          {/* YouTube Stats */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-lg shadow text-white">
            <div className="flex items-center">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <span className="text-2xl">🎥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium opacity-90">Vidéos YT</p>
                <p className="text-2xl font-bold">{stats.videosYouTube}</p>
              </div>
            </div>
          </div>

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

          <div className="bg-gradient-to-br from-red-600 to-red-700 p-6 rounded-lg shadow text-white">
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

          {/* Twitch Stats */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow text-white">
            <div className="flex items-center">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <span className="text-2xl">📹</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium opacity-90">VODs</p>
                <p className="text-2xl font-bold">{stats.vodsTwitch}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-400 to-purple-500 p-6 rounded-lg shadow text-white">
            <div className="flex items-center">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <span className="text-2xl">👁️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium opacity-90">Vues Twitch</p>
                <p className="text-2xl font-bold">{formatNumber(stats.vuesTwitch)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Contrôles Wattpad */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📚 Contrôles Wattpad
            </h2>
            <div className="space-y-4">
              <button
                onClick={declencherAutoCheck}
                disabled={autoCheckLoading}
                className="w-full p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                {autoCheckLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Vérification en cours...
                  </>
                ) : (
                  <>
                    <span className="text-xl mr-2">🔍</span>
                    Vérifier toutes les histoires
                  </>
                )}
              </button>

              <button
                onClick={lancerScrapingComplet}
                disabled={scrapingLoading}
                className="w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                {scrapingLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Scraping en cours...
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
                className="w-full p-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center"
              >
                <span className="text-xl mr-2">➕</span>
                Ajouter une nouvelle histoire
              </a>
            </div>
          </div>

          {/* Contrôles Chaînes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📺 Contrôles Chaînes
            </h2>
            <div className="space-y-4">
              <button
                onClick={synchroniserToutesChaines}
                disabled={syncLoading}
                className="w-full p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                {syncLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Synchronisation en cours...
                  </>
                ) : (
                  <>
                    <span className="text-xl mr-2">🔄</span>
                    Synchroniser toutes les chaînes
                  </>
                )}
              </button>

              <a
                href="/chaines"
                className="w-full p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center"
              >
                <span className="text-xl mr-2">📊</span>
                Gérer les chaînes
              </a>

              <a
                href="/admin/ajouter-chaine"
                className="w-full p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
              >
                <span className="text-xl mr-2">➕</span>
                Ajouter une chaîne
              </a>
            </div>
          </div>
        </div>

        {/* État des chaînes par plateforme */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Chaînes YouTube */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="bg-red-100 p-2 rounded-lg mr-3">📺</span>
              Chaînes YouTube
            </h2>
            <div className="space-y-4">
              {chaines.filter(c => c.plateforme === 'youtube').length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucune chaîne YouTube configurée
                </div>
              ) : (
                chaines
                  .filter(c => c.plateforme === 'youtube')
                  .map((chaine) => (
                    <div key={chaine.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-red-900 truncate">
                          {chaine.nom}
                        </h3>
                        <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-medium">
                          YOUTUBE
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-red-700">
                        <div>
                          <span className="font-medium">👥</span>
                          <br />
                          {formatNumber(chaine.abonnes)} abonnés
                        </div>
                        <div>
                          <span className="font-medium">👀</span>
                          <br />
                          {formatNumber(Number(chaine.vues_total))} vues
                        </div>
                      </div>
                      {chaine.derniere_maj && (
                        <div className="mt-2 text-xs text-red-600">
                          MAJ: {new Date(chaine.derniere_maj).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Chaînes Twitch */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="bg-purple-100 p-2 rounded-lg mr-3">🎮</span>
              Chaînes Twitch
            </h2>
            <div className="space-y-4">
              {chaines.filter(c => c.plateforme === 'twitch').length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucune chaîne Twitch configurée
                </div>
              ) : (
                chaines
                  .filter(c => c.plateforme === 'twitch')
                  .map((chaine) => (
                    <div key={chaine.id} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-purple-900 truncate">
                          {chaine.nom}
                        </h3>
                        <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs font-medium">
                          TWITCH
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-purple-700">
                        <div>
                          <span className="font-medium">👥</span>
                          <br />
                          {formatNumber(chaine.abonnes)} followers
                        </div>
                        <div>
                          <span className="font-medium">👀</span>
                          <br />
                          {formatNumber(Number(chaine.vues_total))} vues
                        </div>
                      </div>
                      {chaine.derniere_maj && (
                        <div className="mt-2 text-xs text-purple-600">
                          MAJ: {new Date(chaine.derniere_maj).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Actions système */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ⚙️ Actions système
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              href="/dashboard"
              className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🏠</div>
              <div className="font-medium">Dashboard Utilisateur</div>
            </a>
          </div>
        </div>

        {/* Informations système */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            🤖 Informations système
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h4 className="font-medium mb-2">📚 Système Wattpad:</h4>
              <ul className="space-y-1">
                <li>• Vérification automatique quotidienne (1h du matin)</li>
                <li>• Scraping intelligent multi-méthodes</li>
                <li>• Notifications automatiques aux utilisateurs</li>
                <li>• Sauvegarde automatique des progressions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📺 Système Chaînes:</h4>
              <ul className="space-y-1">
                <li>• Synchronisation YouTube et Twitch séparée</li>
                <li>• Récupération automatique des statistiques</li>
                <li>• Mise à jour des vidéos et VODs</li>
                <li>• Monitoring des performances par plateforme</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 