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

interface Video {
  id: string;
  titre: string;
  description: string;
  miniature_url: string;
  duree: number;
  date_publication: string;
  vues: number;
  chaine: {
    id: number;
    nom: string;
    type: string;
    nom_affichage: string;
    avatar_url: string;
  };
}

interface Live {
  id: string;
  titre: string;
  description: string;
  statut: string;
  date_debut_reelle?: string;
  date_debut_prevue?: string;
  url_live?: string;
  chaine: {
    id: number;
    nom: string;
    type: string;
    nom_affichage: string;
    url_chaine: string;
  };
}

interface PlanningItem {
  titre: string;
  date_prevue: string;
  type: 'video' | 'live' | 'article';
  statut: 'planifie' | 'en_cours' | 'publie' | 'annule';
  description?: string;
}

export default function ChainesPage() {
  const [chaines, setChaines] = useState<Chaine[]>([]);
  const [videosYoutube, setVideosYoutube] = useState<Video[]>([]);
  const [videosTwitch, setVideosTwitch] = useState<Video[]>([]);
  const [lives, setLives] = useState<Live[]>([]);
  const [planning, setPlanning] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'lives' | 'planning'>('overview');

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        setIsLoading(true);
        
        // Chargement des chaînes
        const chainesResponse = await fetch('/api/chaines');
        if (chainesResponse.ok) {
          const chainesResult = await chainesResponse.json();
          if (chainesResult.success) {
            setChaines(chainesResult.data);
          }
        }

        // Chargement des vidéos YouTube (excluant les Shorts)
        const timestamp = Date.now();
        const videosYoutubeResponse = await fetch(`/api/chaines/videos?type=youtube&_t=${timestamp}`);
        if (videosYoutubeResponse.ok) {
          const videosResult = await videosYoutubeResponse.json();
          if (videosResult.success) {
            setVideosYoutube(videosResult.data);
          }
        }

        // Chargement des VODs Twitch
        const videosTwitchResponse = await fetch(`/api/chaines/videos?type=twitch&_t=${timestamp}`);
        if (videosTwitchResponse.ok) {
          const videosResult = await videosTwitchResponse.json();
          if (videosResult.success) {
            setVideosTwitch(videosResult.data);
          }
        }

        // Chargement des lives
        const livesResponse = await fetch(`/api/chaines/lives?type=youtube&_t=${timestamp}`);
        if (livesResponse.ok) {
          const livesResult = await livesResponse.json();
          if (livesResult.success) {
            setLives(livesResult.data);
          }
        }

        // Chargement du planning
        const planningResponse = await fetch(`/api/chaines/planning?type=youtube&_t=${timestamp}`);
        if (planningResponse.ok) {
          const planningResult = await planningResponse.json();
          if (planningResult.success) {
            setPlanning(planningResult.data);
          }
        }

        setIsLoading(false);
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
              
              {lives.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📡</div>
                  <p>Aucun live en cours</p>
                  <p className="text-sm">Les lives apparaîtront ici quand tu seras en direct</p>
                </div>
              ) : (
                <div className="mb-6">
                  {lives.map(live => (
                    <div key={live.id} className="bg-gradient-to-r from-red-500 to-purple-500 text-white p-4 rounded-lg mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">🔴 LIVE EN COURS</h3>
                          <p className="text-sm opacity-90">{live.titre}</p>
                          <p className="text-xs opacity-75 mt-1">👥 En direct</p>
                        </div>
                        <a 
                          href={live.url_live || live.chaine.url_chaine}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white text-red-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
                        >
                          🚀 Rejoindre
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
          <div className="space-y-8">
            
            {/* Section Vidéos YouTube */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  🔴 Mes Vidéos YouTube
                </h2>
                <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  ✅ Shorts exclus (≥1.5min)
                </span>
              </div>
              
              {videosYoutube.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📺</div>
                  <p>Aucune vidéo YouTube</p>
                  <p className="text-sm">Toutes les vidéos ≥ 1.5 minutes, Shorts exclus</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    {videosYoutube.length} vidéo{videosYoutube.length > 1 ? 's' : ''} longue{videosYoutube.length > 1 ? 's' : ''} 
                    (durée ≥ 2 minutes, Shorts exclus)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videosYoutube.map(video => (
                      <div key={`youtube-${video.id}`} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        {video.miniature_url && (
                          <img 
                            src={video.miniature_url} 
                            alt={video.titre}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                            {video.titre}
                          </h3>
                          
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                            <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">
                              {video.chaine.nom_affichage}
                            </span>
                            {video.duree && (
                              <span className="text-xs text-gray-500">
                                {Math.floor(video.duree / 60)}:{(video.duree % 60).toString().padStart(2, '0')}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>👀 {video.vues.toLocaleString()}</span>
                            <span>📅 {new Date(video.date_publication).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Section VODs Twitch */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                🟣 Mes VODs Twitch
              </h2>
              
              {videosTwitch.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🎮</div>
                  <p>Aucune VOD Twitch</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videosTwitch.map(video => (
                    <div key={`twitch-${video.id}`} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      {video.miniature_url && (
                        <img 
                          src={video.miniature_url} 
                          alt={video.titre}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                          {video.titre}
                        </h3>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                          <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-700">
                            {video.chaine.nom_affichage}
                          </span>
                          {video.duree && (
                            <span className="text-xs text-gray-500">
                              {Math.floor(video.duree / 60)}:{(video.duree % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>👀 {video.vues.toLocaleString()}</span>
                          <span>📅 {new Date(video.date_publication).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'lives' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">🔴 Mes Lives</h2>
            
            {lives.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📡</div>
                <p>Aucun live en cours</p>
                <p className="text-sm">Les lives apparaîtront ici quand tu seras en direct</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lives.map(live => (
                  <div key={live.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white text-xl animate-pulse">
                        🔴
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{live.titre}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">
                            {live.chaine.nom_affichage}
                          </span>
                          <span className="text-green-600 font-medium">● EN DIRECT</span>
                        </div>
                        
                        {live.date_debut_reelle && (
                          <p className="text-xs text-gray-500 mt-1">
                            Débuté le {new Date(live.date_debut_reelle).toLocaleString('fr-FR')}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <a 
                          href={live.url_live || live.chaine.url_chaine} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          🔴 Regarder
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'planning' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">📅 Planning de Contenu</h2>
              <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                ➕ Nouveau Planning
              </button>
            </div>
            
            {planning.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📅</div>
                <p>Aucun planning configuré</p>
                <p className="text-sm mb-4">Créez votre planning de contenu pour organiser vos publications</p>
                <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
                  📝 Créer mon premier planning
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {planning.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.titre}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            📅 {new Date(item.date_prevue).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="flex items-center">
                            ⏰ {new Date(item.date_prevue).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.type === 'video' ? 'bg-red-100 text-red-700' :
                            item.type === 'live' ? 'bg-purple-100 text-purple-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {item.type === 'video' ? '📹 Vidéo' : 
                             item.type === 'live' ? '🔴 Live' : '📝 Article'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.statut === 'planifie' ? 'bg-yellow-100 text-yellow-700' :
                            item.statut === 'en_cours' ? 'bg-blue-100 text-blue-700' :
                            item.statut === 'publie' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {item.statut === 'planifie' ? '⏳ Planifié' :
                             item.statut === 'en_cours' ? '🔄 En cours' :
                             item.statut === 'publie' ? '✅ Publié' : '❌ Annulé'}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-500 hover:text-blue-700 px-3 py-1 rounded border border-blue-300 hover:border-blue-500 transition-colors">
                          ✏️ Modifier
                        </button>
                        <button className="text-red-500 hover:text-red-700 px-3 py-1 rounded border border-red-300 hover:border-red-500 transition-colors">
                          🗑️ Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Section de création rapide */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-4">🚀 Création Rapide</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Titre</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Nouveau chapitre Magi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Date & Heure</label>
                  <input 
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option value="video">📹 Vidéo YouTube</option>
                    <option value="live">🔴 Live Twitch</option>
                    <option value="article">📝 Article/Post</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optionnel)</label>
                <textarea 
                  placeholder="Détails sur le contenu prévu..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                ></textarea>
              </div>
              <div className="mt-4 flex justify-end">
                <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
                  ➕ Ajouter au Planning
                </button>
              </div>
            </div>
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