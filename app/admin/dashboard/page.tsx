'use client';

import { useState, useEffect } from 'react';
import { useClientOnly } from '@/lib/hooks/useClientOnly';

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
  const isClient = useClientOnly();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [histoires, setHistoires] = useState<Histoire[]>([]);
  const [stats, setStats] = useState({
    totalHistoires: 0,
    totalChapitres: 0,
    nouvellesNotifications: 0,
    // YouTube/Twitch stats
    abonnesYouTube: 0,
    abonnesTwitch: 0,
    vuesYouTube: 0,
    vuesTwitch: 0,
    totalVideos: 0
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


      // Charger les chaînes pour les stats
      const chainesResponse = await fetch('/api/chaines');
      const chainesResult = chainesResponse.ok ? await chainesResponse.json() : { success: false };
      const chainesData = chainesResult.success ? chainesResult.data : [];

      // Charger les vidéos pour compter le total
      const youtubeResponse = await fetch('/api/chaines/videos?type=youtube');
      const youtubeResult = youtubeResponse.ok ? await youtubeResponse.json() : { success: false };
      const youtubeData = youtubeResult.success ? youtubeResult.data : [];

      const twitchResponse = await fetch('/api/chaines/videos?type=twitch');
      const twitchResult = twitchResponse.ok ? await twitchResponse.json() : { success: false };
      const twitchData = twitchResult.success ? twitchResult.data : [];

      // Calculer les stats essentielles avec les nouvelles données
      const totalHistoires = Array.isArray(histoireData) ? histoireData.length : 0;
      const totalChapitres = Array.isArray(histoireData) ? histoireData.reduce((acc, h) => acc + (h?.chapitres?.length || 0), 0) : 0;
      const nouvellesNotifications = Array.isArray(notifData) ? notifData.filter(n => n && !n.lu).length : 0;

      // Calculer les stats YouTube/Twitch
      const chainesYouTube = Array.isArray(chainesData) ? chainesData.filter((c: any) => c && c.type === 'youtube') : [];
      const chainesTwitch = Array.isArray(chainesData) ? chainesData.filter((c: any) => c && c.type === 'twitch') : [];
      const abonnesYouTube = chainesYouTube.reduce((acc: number, c: any) => acc + (Number(c?.abonnes) || 0), 0);
      const abonnesTwitch = chainesTwitch.reduce((acc: number, c: any) => acc + (Number(c?.abonnes) || 0), 0);
      const vuesYouTube = chainesYouTube.reduce((acc: number, c: any) => acc + (Number(c?.vues_total) || 0), 0);
      const vuesTwitch = chainesTwitch.reduce((acc: number, c: any) => acc + (Number(c?.vues_total) || 0), 0);
      const totalVideos = (Array.isArray(youtubeData) ? youtubeData.length : 0) + (Array.isArray(twitchData) ? twitchData.length : 0);

      setStats({
        totalHistoires,
        totalChapitres,
        nouvellesNotifications,
        abonnesYouTube,
        abonnesTwitch,
        vuesYouTube,
        vuesTwitch,
        totalVideos
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
      const response = await fetch('/api/sync/all', {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const summary = result.data.summary;
          alert(`✅ Synchronisation des chaînes terminée !
          
📊 Résultats:
• YouTube: ${summary.mises_a_jour_youtube}/${summary.total_chaines_youtube} chaînes mises à jour
• Twitch: ${summary.mises_a_jour_twitch}/${summary.total_chaines_twitch} chaînes mises à jour  
• Lives actifs: ${summary.lives_twitch_actifs}
• Services réussis: ${summary.services_reussis}/${summary.total_services}`);
        } else {
          alert('⚠️ Synchronisation partielle - voir les détails dans les logs');
        }
        await chargerDonnees();
      } else {
        alert('❌ Erreur lors de la synchronisation des APIs');
      }
    } catch (error) {
      console.error('Erreur synchronisation:', error);
      alert('❌ Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  const synchroniserToutesLesDonnees = async () => {
    try {
      setIsLoading(true);
      
      // Synchroniser toutes les chaînes YouTube et Twitch
      const syncResponse = await fetch('/api/sync/all', { method: 'POST' });
      const syncData = syncResponse.ok ? await syncResponse.json() : null;
      
      // Vérifier les histoires Wattpad
      const checkResponse = await fetch('/api/auto-check', { method: 'POST' });
      const checkData = checkResponse.ok ? await checkResponse.json() : null;
      
      let message = '✅ Synchronisation complète terminée !\n\n';
      if (syncData?.success) {
        const summary = syncData.data.summary;
        message += `📺 APIs Sociales:\n`;
        message += `• YouTube: ${summary.mises_a_jour_youtube}/${summary.total_chaines_youtube} chaînes\n`;
        message += `• Twitch: ${summary.mises_a_jour_twitch}/${summary.total_chaines_twitch} chaînes\n`;
        message += `• Lives actifs: ${summary.lives_twitch_actifs}\n`;
        message += `• Services: ${summary.services_reussis}/${summary.total_services} réussis\n\n`;
      }
      if (checkData) {
        message += `📚 Histoires Wattpad: ${checkData.totalNouveauxChapitres || 0} nouveaux chapitres\n`;
      }
      
      alert(message);
      await chargerDonnees();
    } catch (error) {
      console.error('Erreur synchronisation complète:', error);
      alert('❌ Erreur lors de la synchronisation complète');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête Admin */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⚙️ Dashboard Administrateur
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Dernière mise à jour : {isClient ? lastRefresh.toLocaleTimeString() : '--:--:--'}
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
              <button
                onClick={synchroniserChaines}
                disabled={isLoading}
                className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 text-sm"
              >
                📺 Sync Chaînes
              </button>
              <button
                onClick={synchroniserToutesLesDonnees}
                disabled={isLoading}
                className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
              >
                🔄 Sync Complète
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques administrateur */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
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

          {/* Stats YouTube */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-red-600">Abonnés YT</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.abonnesYouTube)}</p>
              </div>
            </div>
          </div>

          {/* Stats Twitch */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Followers</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.abonnesTwitch)}</p>
              </div>
            </div>
          </div>

          {/* Vues YouTube */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-200 rounded-lg">
                <span className="text-2xl">👀</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-red-600">Vues YT</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.vuesYouTube)}</p>
              </div>
            </div>
          </div>

          {/* Vues Twitch */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-200 rounded-lg">
                <span className="text-2xl">👀</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Vues Twitch</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.vuesTwitch)}</p>
              </div>
            </div>
          </div>

          {/* Total Vidéos */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <span className="text-2xl">🎥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-indigo-600">Total Vidéos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVideos}</p>
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
            <div className="space-y-4 max-h-64 sm:max-h-96 overflow-y-auto">
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
            <div className="space-y-4 max-h-64 sm:max-h-96 overflow-y-auto">
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

          {/* Actions rapides */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🔗 Liens rapides
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <a
                href="/histoires"
                className="p-4 text-center border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-2xl mb-2">📚</div>
                <div className="font-medium">Histoires</div>
              </a>
              <a
                href="/admin/scraping"
                className="p-4 text-center border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-2xl mb-2">🕷️</div>
                <div className="font-medium">Scraping</div>
              </a>
              <a
                href="/admin/centre-controle"
                className="p-4 text-center border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-2xl mb-2">⚙️</div>
                <div className="font-medium">Centre Contrôle</div>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
} 