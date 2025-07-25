'use client';

import { useState, useEffect } from 'react';

interface Notification {
  id: number;
  type: string;
  message: string;
  lu: boolean;
  date: string;
}

interface Histoire {
  id: number;
  titre: string;
  auteur: string;
  chapitres: any[];
  progressions: any[];
}

interface Video {
  id: number;
  titre: string;
  description: string;
  url: string;
  duree: number;
  vues: number;
  date_publication: string;
  chaine: {
    nom: string;
    plateforme: string;
  };
}

interface Chaine {
  id: number;
  nom: string;
  plateforme: string;
  abonnes: number;
  vues_total: number;
}

export default function AdminDashboardPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [histoires, setHistoires] = useState<Histoire[]>([]);
  const [videosYouTube, setVideosYouTube] = useState<Video[]>([]);
  const [vodsTwitch, setVodsTwitch] = useState<Video[]>([]);
  const [chaines, setChaines] = useState<Chaine[]>([]);
  const [stats, setStats] = useState({
    totalHistoires: 0,
    totalChapitres: 0,
    nouvellesNotifications: 0,
    // Statistiques YouTube
    chainesYouTube: 0,
    videosYouTube: 0,
    vuesYouTube: 0,
    abonnesYouTube: 0,
    // Statistiques Twitch
    chainesTwitch: 0,
    vodsTwitch: 0,
    vuesTwitch: 0,
    abonnesTwitch: 0
  });
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour charger les données
  const chargerDonnees = async () => {
    try {
      setIsLoading(true);

      // Charger les notifications
      const notifResponse = await fetch('/api/notification');
      if (notifResponse.ok) {
        const notifResult = await notifResponse.json();
        const notifData = notifResult.success ? notifResult.data : [];
        setNotifications(notifData);
      }

      // Charger les histoires
      const histoireResponse = await fetch('/api/histoire');
      if (histoireResponse.ok) {
        const histoireResult = await histoireResponse.json();
        const histoireData = histoireResult.success ? histoireResult.data : [];
        setHistoires(histoireData);
      }

      // Charger les chaînes
      const chainesResponse = await fetch('/api/chaines');
      if (chainesResponse.ok) {
        const chainesResult = await chainesResponse.json();
        const chainesData = chainesResult.success ? chainesResult.data : [];
        setChaines(chainesData);
      }

      // Charger les vidéos YouTube
      const youtubeResponse = await fetch('/api/chaines/videos?type=youtube');
      if (youtubeResponse.ok) {
        const youtubeResult = await youtubeResponse.json();
        const youtubeData = youtubeResult.success ? youtubeResult.data : [];
        setVideosYouTube(youtubeData);
      }

      // Charger les VODs Twitch
      const twitchResponse = await fetch('/api/chaines/videos?type=twitch');
      if (twitchResponse.ok) {
        const twitchResult = await twitchResponse.json();
        const twitchData = twitchResult.success ? twitchResult.data : [];
        setVodsTwitch(twitchData);
      }

      // Calculer les stats séparées par plateforme
      const totalHistoires = histoires.length;
      const totalChapitres = histoires.reduce((acc, h) => acc + (h.chapitres?.length || 0), 0);
      const nouvellesNotifications = notifications.filter(n => !n.lu).length;

      // Statistiques par plateforme
      const chainesYouTube = chaines.filter(c => c.plateforme === 'youtube');
      const chainesTwitch = chaines.filter(c => c.plateforme === 'twitch');

      const vuesYouTube = chainesYouTube.reduce((acc, c) => acc + (Number(c.vues_total) || 0), 0);
      const abonnesYouTube = chainesYouTube.reduce((acc, c) => acc + (Number(c.abonnes) || 0), 0);

      const vuesTwitch = chainesTwitch.reduce((acc, c) => acc + (Number(c.vues_total) || 0), 0);
      const abonnesTwitch = chainesTwitch.reduce((acc, c) => acc + (Number(c.abonnes) || 0), 0);

      setStats({
        totalHistoires,
        totalChapitres,
        nouvellesNotifications,
        // YouTube
        chainesYouTube: chainesYouTube.length,
        videosYouTube: videosYouTube.length,
        vuesYouTube,
        abonnesYouTube,
        // Twitch
        chainesTwitch: chainesTwitch.length,
        vodsTwitch: vodsTwitch.length,
        vuesTwitch,
        abonnesTwitch
      });

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    chargerDonnees();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      chargerDonnees();
    }, 60000); // Refresh toutes les minutes pour l'admin

    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  // Fonction pour formater la durée
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Fonction pour formater les nombres
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Actions admin
  const declencherVerification = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auto-check', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Vérification terminée !\n${data.totalNouveauxChapitres} nouveaux chapitres détectés`);
        await chargerDonnees();
      } else {
        alert('❌ Erreur lors de la vérification automatique');
      }
    } catch (error) {
      console.error('Erreur vérification:', error);
      alert('❌ Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  const synchroniserChaines = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sync/channels', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Synchronisation terminée !\nYouTube: ${data.youtube?.updated || 0} chaînes\nTwitch: ${data.twitch?.updated || 0} chaînes\nVidéos: ${data.videos?.created || 0} nouvelles`);
        await chargerDonnees();
      } else {
        alert('❌ Erreur lors de la synchronisation');
      }
    } catch (error) {
      console.error('Erreur synchronisation:', error);
      alert('❌ Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête Admin */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⚙️ Dashboard Administrateur
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Dernière mise à jour : {lastRefresh.toLocaleTimeString()}
            </p>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isAutoRefresh}
                  onChange={(e) => setIsAutoRefresh(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Auto-refresh (1min)</span>
              </label>
              <button
                onClick={chargerDonnees}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? '🔄' : '🔄'} Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques administrateur */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8 gap-6 mb-8">
          {/* Wattpad */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Histoires</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHistoires}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">📖</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chapitres</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalChapitres}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">🔔</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.nouvellesNotifications}</p>
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

        {/* Actions rapides admin */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ⚡ Actions rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={declencherVerification}
              disabled={isLoading}
              className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-medium">Vérifier Wattpad</div>
            </button>
            <button
              onClick={synchroniserChaines}
              disabled={isLoading}
              className="p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-medium">Sync Chaînes</div>
            </button>
            <a
              href="/admin/scraping"
              className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🕷️</div>
              <div className="font-medium">Scraping</div>
            </a>
            <a
              href="/admin/centre-controle"
              className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🎛️</div>
              <div className="font-medium">Centre Contrôle</div>
            </a>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notifications admin */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🔔 Notifications système
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune notification</p>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      !notification.lu
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {notification.type}
                        </p>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(notification.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Histoires récentes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                📚 Histoires récentes
              </h2>
              <a
                href="/admin/gerer-histoires"
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                Gérer →
              </a>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {histoires.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune histoire</p>
              ) : (
                histoires.slice(0, 5).map((histoire) => (
                  <div key={histoire.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {histoire.titre}
                    </h3>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>👤 {histoire.auteur}</span>
                      <span>📖 {histoire.chapitres?.length || 0} chapitres</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Résumé des plateformes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📊 Résumé plateformes
            </h2>
            <div className="space-y-4">
              {/* YouTube */}
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-red-800 flex items-center">
                    <span className="text-xl mr-2">📺</span>
                    YouTube
                  </h3>
                  <span className="text-sm text-red-600 font-medium">
                    {stats.chainesYouTube} chaînes
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-red-700 font-medium">Vidéos:</span>
                    <br />
                    <span className="text-red-900">{stats.videosYouTube}</span>
                  </div>
                  <div>
                    <span className="text-red-700 font-medium">Vues:</span>
                    <br />
                    <span className="text-red-900">{formatNumber(stats.vuesYouTube)}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-red-700 font-medium">Abonnés:</span>
                  <span className="text-red-900 ml-2">{formatNumber(stats.abonnesYouTube)}</span>
                </div>
              </div>

              {/* Twitch */}
              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-purple-800 flex items-center">
                    <span className="text-xl mr-2">🎮</span>
                    Twitch
                  </h3>
                  <span className="text-sm text-purple-600 font-medium">
                    {stats.chainesTwitch} chaînes
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-purple-700 font-medium">VODs:</span>
                    <br />
                    <span className="text-purple-900">{stats.vodsTwitch}</span>
                  </div>
                  <div>
                    <span className="text-purple-700 font-medium">Vues:</span>
                    <br />
                    <span className="text-purple-900">{formatNumber(stats.vuesTwitch)}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-purple-700 font-medium">Followers:</span>
                  <span className="text-purple-900 ml-2">{formatNumber(stats.abonnesTwitch)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Vidéos récentes */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vidéos YouTube récentes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="bg-red-100 p-2 rounded-lg mr-3">📺</span>
                Dernières vidéos YouTube
              </h2>
              <div className="text-right">
                <div className="text-sm text-gray-500">{stats.videosYouTube} vidéos</div>
                <div className="text-xs text-red-600 font-medium">
                  {formatNumber(stats.abonnesYouTube)} abonnés
                </div>
              </div>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {videosYouTube.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune vidéo YouTube</p>
              ) : (
                videosYouTube.slice(0, 5).map((video) => (
                  <div key={video.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {video.titre}
                    </h3>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>⏱️ {formatDuration(video.duree)}</span>
                      <span>👀 {formatNumber(video.vues)} vues</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(video.date_publication).toLocaleDateString()}
                      </span>
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Voir →
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* VODs Twitch récentes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="bg-purple-100 p-2 rounded-lg mr-3">🎮</span>
                Dernières VODs Twitch
              </h2>
              <div className="text-right">
                <div className="text-sm text-gray-500">{stats.vodsTwitch} VODs</div>
                <div className="text-xs text-purple-600 font-medium">
                  {formatNumber(stats.abonnesTwitch)} followers
                </div>
              </div>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {vodsTwitch.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune VOD Twitch</p>
              ) : (
                vodsTwitch.slice(0, 5).map((vod) => (
                  <div key={vod.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {vod.titre}
                    </h3>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>⏱️ {formatDuration(vod.duree)}</span>
                      <span>👀 {formatNumber(vod.vues)} vues</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(vod.date_publication).toLocaleDateString()}
                      </span>
                      <a
                        href={vod.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-500 hover:text-purple-700 text-sm font-medium"
                      >
                        Voir →
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 