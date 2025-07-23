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

export default function DashboardPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [histoires, setHistoires] = useState<Histoire[]>([]);
  const [stats, setStats] = useState({
    totalHistoires: 0,
    totalChapitres: 0,
    nouvellesNotifications: 0
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
        
        // Calculer les stats avec les notifications
        const nouvellesNotifications = notifData.filter((n: Notification) => !n.lu).length;
        
        // Charger les histoires
        const histoireResponse = await fetch('/api/histoire');
        if (histoireResponse.ok) {
          const histoireResult = await histoireResponse.json();
          const histoireData = histoireResult.success ? histoireResult.data : [];
          setHistoires(histoireData);

          // Calculer les stats
          const totalChapitres = histoireData.reduce((total: number, h: Histoire) => 
            total + (h.chapitres?.length || 0), 0);
          
          setStats({
            totalHistoires: histoireData.length,
            totalChapitres,
            nouvellesNotifications
          });
        }
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour déclencher une vérification automatique
  const declencherVerification = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auto-check', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Vérification terminée !\n${data.totalNouveauxChapitres} nouveaux chapitres détectés`);
        
        // Recharger les données
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

  // Marquer une notification comme lue
  const marquerCommeLue = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notification/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lu: true })
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, lu: true } : n)
        );
      }
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  // Auto-refresh toutes les 5 minutes
  useEffect(() => {
    chargerDonnees();

    if (isAutoRefresh) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-refresh du dashboard...');
        chargerDonnees();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [isAutoRefresh]);

  // Auto-refresh plus fréquent pour les notifications (toutes les 30s)
  useEffect(() => {
    if (isAutoRefresh) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch('/api/notification');
          if (response.ok) {
            const data = await response.json();
            setNotifications(data);
          }
        } catch (error) {
          console.error('Erreur refresh notifications:', error);
        }
      }, 30 * 1000); // 30 secondes

      return () => clearInterval(interval);
    }
  }, [isAutoRefresh]);

  const notificationsNonLues = notifications.filter(n => !n.lu);
  const dernieresHistoires = histoires.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header avec stats */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              📱 Dashboard Utilisateur - Comme AniList !
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={isAutoRefresh}
                  onChange={(e) => setIsAutoRefresh(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="autoRefresh" className="text-sm text-gray-600">
                  🔄 Auto-refresh
                </label>
              </div>
              <span className="text-xs text-gray-500">
                Dernière MAJ: {lastRefresh.toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalHistoires}</div>
              <div className="text-sm text-blue-800">📚 Histoires disponibles</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.totalChapitres}</div>
              <div className="text-sm text-green-800">📖 Chapitres totaux</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.nouvellesNotifications}</div>
              <div className="text-sm text-purple-800">🔔 Nouvelles notifications</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Notifications en temps réel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                🔔 Notifications {notificationsNonLues.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                    {notificationsNonLues.length}
                  </span>
                )}
              </h2>
              {isAutoRefresh && (
                <div className="text-xs text-green-600">🟢 Temps réel (30s)</div>
              )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Aucune notification pour le moment
                </div>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border-l-4 cursor-pointer transition-colors ${
                      notification.lu
                        ? 'bg-gray-50 border-gray-300'
                        : 'bg-blue-50 border-blue-500'
                    }`}
                    onClick={() => !notification.lu && marquerCommeLue(notification.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className={`text-sm ${notification.lu ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.date).toLocaleString()}
                        </p>
                      </div>
                      {!notification.lu && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Histoires récentes */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📚 Tes histoires</h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dernieresHistoires.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  <p>Aucune histoire pour le moment</p>
                  <a 
                    href="/admin/scraping" 
                    className="text-blue-500 hover:text-blue-700 underline mt-2 inline-block"
                  >
                    🚀 Ajouter une histoire
                  </a>
                </div>
              ) : (
                dernieresHistoires.map((histoire) => (
                  <div key={histoire.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{histoire.titre}</h3>
                        <p className="text-sm text-gray-600">par {histoire.auteur}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {histoire.chapitres?.length || 0} chapitres
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {histoire.id}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {histoires.length > 5 && (
              <div className="mt-4 text-center">
                <a 
                  href="/admin/visualiser" 
                  className="text-blue-500 hover:text-blue-700 underline text-sm"
                >
                  Voir toutes les histoires →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">⚡ Actions rapides</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a
              href="/histoires"
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">📚 Mes Histoires</h3>
                  <p className="text-gray-600 mt-2">Découvrez et suivez vos histoires préférées</p>
                </div>
                <div className="text-3xl">📖</div>
              </div>
            </a>

            <a
              href="/chaines"
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-l-4 border-red-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">📺 Mes Chaînes</h3>
                  <p className="text-gray-600 mt-2">YouTube, Twitch, lives et votes narratifs</p>
                </div>
                <div className="text-3xl">🎬</div>
              </div>
            </a>

            <a
              href="/live-votes"
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-l-4 border-purple-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">🗳️ Votes Live</h3>
                  <p className="text-gray-600 mt-2">Participez aux décisions narratives en direct</p>
                </div>
                <div className="text-3xl">🎯</div>
              </div>
            </a>
          </div>
        </div>

        {/* Infos système */}
        <div className="mt-6 bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">🔔 Notifications automatiques :</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• <strong>Mises à jour automatiques</strong> : L'admin ajoute du contenu régulièrement</li>
            <li>• <strong>Notifications temps réel</strong> : Tu es averti dès qu'il y a du nouveau</li>
            <li>• <strong>Dashboard intelligent</strong> : Mise à jour automatique toutes les 5 minutes</li>
            <li>• <strong>Suivi personnalisé</strong> : Marque ta progression et reçois des notifications</li>
            <li>• <strong>Vérification quotidienne</strong> : Le système vérifie les MAJ à 1h du matin</li>
            <li>• <strong>Comme AniList</strong> : Expérience moderne et automatisée !</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 