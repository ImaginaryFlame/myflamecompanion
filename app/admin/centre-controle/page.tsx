'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalHistoires: number;
  totalChapitres: number;
  nouvellesNotifications: number;
}

export default function CentreControlePage() {
  const [stats, setStats] = useState<Stats>({
    totalHistoires: 0,
    totalChapitres: 0,
    nouvellesNotifications: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);

  useEffect(() => {
    chargerStats();
  }, []);

  const chargerStats = async () => {
    try {
      // Charger les histoires
      const histoireResponse = await fetch('/api/histoire');
      if (histoireResponse.ok) {
        const histoireResult = await histoireResponse.json();
        const histoireData = histoireResult.success ? histoireResult.data : [];
        
        // Charger les chapitres
        const chapitreResponse = await fetch('/api/chapitre');
        if (chapitreResponse.ok) {
          const chapitreResult = await chapitreResponse.json();
          const chapitreData = chapitreResult.success ? chapitreResult.data : [];
          
          setStats({
            totalHistoires: histoireData.length,
            totalChapitres: chapitreData.length,
            nouvellesNotifications: 0
          });
        }
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const synchroniserChaines = async () => {
    try {
      setSyncLoading(true);
      const response = await fetch('/api/sync/channels', {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('✅ Synchronisation des chaînes réussie ! Toutes les vidéos YouTube et VODs Twitch ont été mises à jour.');
        } else {
          alert('❌ Erreur lors de la synchronisation: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Erreur synchronisation chaînes:', error);
      alert('❌ Erreur lors de la synchronisation des chaînes');
    } finally {
      setSyncLoading(false);
    }
  };

  const outils = {
    scraping: [
      {
        titre: "🧠 Scraping Intelligent",
        description: "Scraper une histoire Wattpad avec multi-méthodes (Playwright + Cheerio + Fallback)",
        url: "/admin/scraping",
        couleur: "bg-blue-500 hover:bg-blue-600",
        statut: "✅ Opérationnel"
      },
      {
        titre: "🧪 Test de Scraping",
        description: "Tester et déboguer les sélecteurs CSS pour le scraping Wattpad",
        url: "/admin/test-scraping",
        couleur: "bg-yellow-500 hover:bg-yellow-600",
        statut: "🔧 Debug"
      },
      {
        titre: "👤 Scraping de Profil",
        description: "Scraper toutes les histoires d'un profil Wattpad automatiquement",
        url: "/admin/scraping",
        couleur: "bg-purple-500 hover:bg-purple-600",
        statut: "✅ Opérationnel"
      }
    ],
    edition: [
      {
        titre: "✏️ Éditeur d'Histoires",
        description: "Modifier titre, auteur, description et URLs multiples de tes histoires",
        url: "/admin/editeur",
        couleur: "bg-green-500 hover:bg-green-600",
        statut: "✅ Recommandé"
      },
      {
        titre: "📝 Corriger les Chapitres",
        description: "Corriger les titres de chapitres inventés par le scraping",
        url: "/admin/corriger-chapitres",
        couleur: "bg-orange-500 hover:bg-orange-600",
        statut: "🔧 Utile"
      },
      {
        titre: "➕ Ajouter des Chapitres",
        description: "Ajouter manuellement des chapitres à une histoire",
        url: "/admin/chapitres",
        couleur: "bg-teal-500 hover:bg-teal-600",
        statut: "📝 Manuel"
      },
      {
        titre: "🏛️ Gestionnaire de Tomes",
        description: "Gérer les licences regroupées (Webnovel & Yume-Arts)",
        url: "/admin/gestionnaire-tomes",
        couleur: "bg-purple-500 hover:bg-purple-600",
        statut: "🔗 Multi-sites"
      }
    ],
    visualisation: [
      {
        titre: "👁️ Visualiseur Avancé",
        description: "Voir toutes tes histoires avec chapitres et URLs de chapitres",
        url: "/admin/visualiser",
        couleur: "bg-indigo-500 hover:bg-indigo-600",
        statut: "👀 Essentiel"
      },
      {
        titre: "🗂️ Gestionnaire d'Histoires",
        description: "Supprimer des histoires et gérer la base de données",
        url: "/admin/gerer-histoires",
        couleur: "bg-red-500 hover:bg-red-600",
        statut: "⚠️ Prudence"
      }
    ],
    chaines: [
      {
        titre: "📺 Gestion des Chaînes",
        description: "Gérer tes chaînes YouTube et Twitch, statistiques et configuration",
        url: "/admin/chaines",
        couleur: "bg-red-500 hover:bg-red-600",
        statut: "📊 Essentiel"
      },
      {
        titre: "🔄 Synchroniser Vidéos",
        description: "Synchroniser toutes tes vidéos YouTube et VODs Twitch maintenant",
        action: synchroniserChaines,
        couleur: syncLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600",
        statut: syncLoading ? "🔄 Sync..." : "🚀 Cliquer ici",
        disabled: syncLoading
      },
      {
        titre: "🧪 Test APIs",
        description: "Tester les connexions YouTube et Twitch, diagnostiquer les erreurs",
        url: "/admin/test-apis",
        couleur: "bg-yellow-500 hover:bg-yellow-600",
        statut: "🔧 Debug"
      }
    ],
    automatisation: [
      {
        titre: "🤖 Vérification Auto",
        description: "Déclencher manuellement la vérification de nouveaux chapitres",
        url: "/admin/dashboard",
        couleur: "bg-cyan-500 hover:bg-cyan-600",
        statut: "🔄 Auto 1h"
      },
      {
        titre: "📊 Dashboard Admin",
        description: "Statistiques temps réel et monitoring du système",
        url: "/admin/dashboard",
        couleur: "bg-gray-600 hover:bg-gray-700",
        statut: "📈 Monitoring"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎛️ Centre de Contrôle Admin
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Tous tes outils de gestion MyFlameCompanion en un seul endroit
          </p>
          
          {/* Stats rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
              <div className="text-3xl font-bold text-blue-400">
                {isLoading ? '...' : stats.totalHistoires}
              </div>
              <div className="text-sm text-gray-300">📚 Histoires</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
              <div className="text-3xl font-bold text-green-400">
                {isLoading ? '...' : stats.totalChapitres}
              </div>
              <div className="text-sm text-gray-300">📖 Chapitres</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
              <div className="text-3xl font-bold text-yellow-400">
                {isLoading ? '...' : stats.nouvellesNotifications}
              </div>
              <div className="text-sm text-gray-300">🔔 Notifications</div>
            </div>
          </div>
        </div>

        {/* Outils par catégorie */}
        <div className="space-y-12">
          
          {/* Scraping */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              🕷️ Outils de Scraping
              <span className="ml-4 text-sm bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
                Récupération automatique
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outils.scraping.map((outil, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-white">{outil.titre}</h3>
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                      {outil.statut}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                    {outil.description}
                  </p>
                  <a
                    href={outil.url}
                    className={`${outil.couleur} text-white px-6 py-3 rounded-lg font-semibold inline-block transition-all duration-200 transform hover:scale-105`}
                  >
                    Ouvrir l'outil →
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Chaînes YouTube & Twitch */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              📺 Chaînes YouTube & Twitch
              <span className="ml-4 text-sm bg-red-500/20 text-red-300 px-3 py-1 rounded-full">
                Synchronisation vidéos
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outils.chaines.map((outil, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-white">{outil.titre}</h3>
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                      {outil.statut}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                    {outil.description}
                  </p>
                  {outil.action ? (
                    <button
                      onClick={outil.action}
                      disabled={outil.disabled}
                      className={`${outil.couleur} text-white px-6 py-3 rounded-lg font-semibold inline-block transition-all duration-200 transform hover:scale-105 ${outil.disabled ? 'cursor-not-allowed' : ''}`}
                    >
                      {outil.disabled ? 'Synchronisation...' : 'Synchroniser maintenant →'}
                    </button>
                  ) : (
                    <a
                      href={outil.url}
                      className={`${outil.couleur} text-white px-6 py-3 rounded-lg font-semibold inline-block transition-all duration-200 transform hover:scale-105`}
                    >
                      Ouvrir l'outil →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Édition */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              ✏️ Outils d'Édition
              <span className="ml-4 text-sm bg-green-500/20 text-green-300 px-3 py-1 rounded-full">
                Modification manuelle
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outils.edition.map((outil, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-white">{outil.titre}</h3>
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                      {outil.statut}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                    {outil.description}
                  </p>
                  <a
                    href={outil.url}
                    className={`${outil.couleur} text-white px-6 py-3 rounded-lg font-semibold inline-block transition-all duration-200 transform hover:scale-105`}
                  >
                    Ouvrir l'outil →
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Visualisation */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              👁️ Outils de Visualisation
              <span className="ml-4 text-sm bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
                Consultation et gestion
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {outils.visualisation.map((outil, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-white">{outil.titre}</h3>
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                      {outil.statut}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                    {outil.description}
                  </p>
                  <a
                    href={outil.url}
                    className={`${outil.couleur} text-white px-6 py-3 rounded-lg font-semibold inline-block transition-all duration-200 transform hover:scale-105`}
                  >
                    Ouvrir l'outil →
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Automatisation */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              🤖 Automatisation
              <span className="ml-4 text-sm bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full">
                Système automatique
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {outils.automatisation.map((outil, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-white">{outil.titre}</h3>
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                      {outil.statut}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                    {outil.description}
                  </p>
                  <a
                    href={outil.url}
                    className={`${outil.couleur} text-white px-6 py-3 rounded-lg font-semibold inline-block transition-all duration-200 transform hover:scale-105`}
                  >
                    Ouvrir l'outil →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Raccourcis rapides */}
        <div className="mt-16 bg-white/5 backdrop-blur-md rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">⚡ Raccourcis Rapides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/admin/scraping" className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-3 rounded-lg text-center transition-all">
              🧠 Scraper
            </a>
            <a href="/admin/editeur" className="bg-green-500/20 hover:bg-green-500/30 text-green-300 px-4 py-3 rounded-lg text-center transition-all">
              ✏️ Éditer
            </a>
            <a href="/admin/visualiser" className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-3 rounded-lg text-center transition-all">
              👁️ Voir
            </a>
            <a href="/admin/test-scraping" className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-4 py-3 rounded-lg text-center transition-all">
              🧪 Tester
            </a>
            <a href="/admin/gestionnaire-tomes" className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-3 rounded-lg text-center transition-all">
              🏛️ Tomes
            </a>
          </div>
        </div>

        {/* Infos système */}
        <div className="mt-12 bg-gradient-to-r from-red-500/10 to-orange-500/10 backdrop-blur-md rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">🤖 Système Automatique</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">🕐 Cron Job Automatique :</h4>
              <ul className="space-y-1">
                <li>• Vérifie les MAJ tous les jours à 1h du matin</li>
                <li>• Scraping intelligent multi-méthodes</li>
                <li>• Notifications automatiques aux utilisateurs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">🔒 Sécurité :</h4>
              <ul className="space-y-1">
                <li>• Seul l'admin peut scraper et modifier</li>
                <li>• Les utilisateurs peuvent seulement consulter</li>
                <li>• Contrôle d'accès sur toutes les APIs</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 text-center space-x-6">
          <a href="/admin" className="text-gray-300 hover:text-white underline">
            ← Retour admin classique
          </a>
          <a href="/dashboard" className="text-gray-300 hover:text-white underline">
            📊 Dashboard utilisateur
          </a>
          <a href="/" className="text-gray-300 hover:text-white underline">
            🏠 Accueil
          </a>
        </div>
      </div>
    </div>
  );
} 