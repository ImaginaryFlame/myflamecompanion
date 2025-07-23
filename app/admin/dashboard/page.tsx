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

export default function AdminDashboardPage() {
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
        console.log('🔄 Auto-refresh du dashboard admin...');
        chargerDonnees();
      }, 5 * 60 * 1000); // 5 minutes

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
          <div className="bg-red-50 p-4 rounded-lg mb-6">
            <h2 className="font-semibold text-red-800 mb-2">🔒 Dashboard Administrateur</h2>
            <p className="text-sm text-red-700">
              Interface complète de gestion - Scraping, vérifications automatiques, et statistiques.
            </p>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                🤖 Dashboard Admin - Contrôle Total
              </h1>
              <a
                href="/admin/centre-controle"
                className="text-sm bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg mt-2 inline-block transition-all duration-200"
              >
                🎛️ Centre de Contrôle Avancé →
              </a>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalHistoires}</div>
              <div className="text-sm text-blue-800">📚 Histoires gérées</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.totalChapitres}</div>
              <div className="text-sm text-green-800">📖 Chapitres totaux</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.nouvellesNotifications}</div>
              <div className="text-sm text-purple-800">🔔 Notifications actives</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <button
                onClick={declencherVerification}
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold"
              >
                {isLoading ? '🔍 Vérification...' : '🚀 Vérifier MAJ'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Notifications système */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                🔔 Notifications Système {notificationsNonLues.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                    {notificationsNonLues.length}
                  </span>
                )}
              </h2>
              {isAutoRefresh && (
                <div className="text-xs text-green-600">🟢 Temps réel</div>
              )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Aucune notification système
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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📚 Histoires récentes</h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dernieresHistoires.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  <p>Aucune histoire pour le moment</p>
                  <a 
                    href="/admin/scraping" 
                    className="text-blue-500 hover:text-blue-700 underline mt-2 inline-block"
                  >
                    🚀 Scraper une histoire
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
                  Gérer toutes les histoires →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Actions admin */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">⚡ Actions administrateur</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/admin/scraping"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg text-center font-semibold"
            >
              🧠 Scraper histoires
            </a>
            <a
              href="/admin/visualiser"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg text-center font-semibold"
            >
              👁️ Gérer contenu
            </a>
            <a
              href="/admin/gerer-histoires"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg text-center font-semibold"
            >
              🗂️ Base de données
            </a>
            <a
              href="/admin"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg text-center font-semibold"
            >
              ⚙️ Administration
            </a>
            <a
              href="/admin/test-scraping"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg text-center font-semibold"
            >
              🧪 Test scraping
            </a>
            <a
              href="/admin/editeur"
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg text-center font-semibold"
            >
              ✏️ Éditer descriptions
            </a>
          </div>
        </div>

        {/* Infos système admin */}
        <div className="mt-6 bg-red-50 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">🤖 Système automatique admin :</h3>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• <strong>Cron job automatique</strong> : Vérifie les MAJ tous les jours à 1h du matin</li>
            <li>• <strong>Scraping intelligent</strong> : Multi-méthodes (Playwright → Cheerio → Fallback)</li>
            <li>• <strong>Notifications automatiques</strong> : Les utilisateurs sont avertis automatiquement</li>
            <li>• <strong>Contrôle total</strong> : Seul l'admin peut ajouter du contenu</li>
            <li>• <strong>Dashboard temps réel</strong> : Monitoring complet du système</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 