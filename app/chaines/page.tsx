'use client';

import { useState, useEffect } from 'react';

interface Chaine {
  id: number;
  nom: string;
  type: 'youtube' | 'twitch';
  nom_affichage: string;
  description?: string;
  url_chaine: string;
  abonnes: number;
  actif: boolean;
}

export default function ChainesPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'lives' | 'planning'>('overview');
  const [chaines, setChaines] = useState<Chaine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        setIsLoading(true);
        
        // Données mockées simples
        const chainesData: Chaine[] = [
          {
            id: 1,
            nom: 'ImaginaryFlame',
            type: 'youtube',
            nom_affichage: 'ImaginaryFlame - Histoires Imaginaires',
            description: 'Chaîne dédiée aux histoires fantastiques',
            url_chaine: 'https://youtube.com/@imaginaryflame',
            abonnes: 1250,
            actif: true
          },
          {
            id: 2,
            nom: 'ImaginaryFlame',
            type: 'twitch',
            nom_affichage: 'ImaginaryFlame Live',
            description: 'Lives d\'écriture et discussions',
            url_chaine: 'https://twitch.tv/imaginaryflame',
            abonnes: 680,
            actif: true
          }
        ];

        setTimeout(() => {
          setChaines(chainesData);
          setIsLoading(false);
        }, 500);

      } catch (error) {
        console.error('Erreur chargement données:', error);
        setIsLoading(false);
      }
    };

    chargerDonnees();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des chaînes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="bg-gradient-to-r from-red-50 to-purple-50 p-4 rounded-lg mb-6">
            <h2 className="font-semibold text-red-800 mb-2">📺 Mes Chaînes YouTube & Twitch</h2>
            <p className="text-sm text-red-700">
              Reste connecté avec ma communauté ! Reçois des notifications pour les nouvelles vidéos, 
              rejoins mes lives, participe aux votes narratifs et découvre mon planning de contenu.
            </p>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            🎬 Hub Créateur - ImaginaryFlame
          </h1>

          {/* Navigation simplifiée */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              🏠 Aperçu
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'videos'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              📹 Vidéos
            </button>
            <button
              onClick={() => setActiveTab('lives')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'lives'
                  ? 'bg-purple-500 text-white'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              🔴 Lives
            </button>
            <button
              onClick={() => setActiveTab('planning')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'planning'
                  ? 'bg-green-500 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              📅 Planning
            </button>
          </div>
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Chaînes */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">🎯 Mes Chaînes</h2>
              
              <div className="space-y-4">
                {chaines.map(chaine => (
                  <div key={chaine.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl ${
                        chaine.type === 'youtube' ? 'bg-red-500' : 'bg-purple-500'
                      }`}>
                        {chaine.type === 'youtube' ? '📺' : '🎮'}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-800">{chaine.nom_affichage}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            chaine.type === 'youtube' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {chaine.type.toUpperCase()}
                          </span>
                          {chaine.actif && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              ✅ Actif
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">{chaine.description}</p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>👥 {chaine.abonnes} abonnés</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <a
                          href={chaine.url_chaine}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-3 py-1 rounded text-sm font-medium text-white ${
                            chaine.type === 'youtube' 
                              ? 'bg-red-500 hover:bg-red-600' 
                              : 'bg-purple-500 hover:bg-purple-600'
                          }`}
                        >
                          🔗 Visiter
                        </a>
                        
                        <button className="px-3 py-1 rounded text-sm font-medium bg-blue-500 text-white hover:bg-blue-600">
                          🔔 S'abonner
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live en cours */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">🔴 Lives & Prochains Événements</h2>
              
              <div className="mb-6">
                <div className="bg-gradient-to-r from-red-500 to-purple-500 text-white p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">🔴 LIVE EN COURS</h3>
                      <p className="text-sm opacity-90">Écriture en direct - Chapitre 15</p>
                      <p className="text-xs opacity-75 mt-1">👥 247 spectateurs</p>
                    </div>
                    <button className="bg-white text-red-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100">
                      🚀 Rejoindre
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">📅 Prochains Lives</h3>
                
                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Session Q&A Communauté</h4>
                      <p className="text-sm text-gray-600">Demain à 20h00</p>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Twitch</span>
                    </div>
                    <button className="text-blue-500 hover:text-blue-700">
                      🔔 Rappel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">📹 Mes Dernières Vidéos</h2>
            <p className="text-gray-600">Section vidéos en cours de développement...</p>
          </div>
        )}

        {activeTab === 'lives' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">🔴 Gestion des Lives</h2>
            <p className="text-gray-600">Section lives en cours de développement...</p>
          </div>
        )}

        {activeTab === 'planning' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">📅 Planning de Contenu</h2>
            <p className="text-gray-600">Section planning en cours de développement...</p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 text-center space-x-6">
          <a href="/dashboard" className="text-blue-500 hover:text-blue-700 underline">
            🏠 Dashboard
          </a>
          <a href="/live-votes" className="text-purple-500 hover:text-purple-700 underline">
            🗳️ Votes Live
          </a>
          <a href="/admin" className="text-gray-500 hover:text-gray-700 underline">
            ⚙️ Administration
          </a>
        </div>
      </div>
    </div>
  );
} 