'use client';

import { useState, useEffect } from 'react';

interface Chaine {
  id: number;
  nom: string;
  type: 'youtube' | 'twitch';
  channel_id: string;
  nom_affichage: string;
  description?: string;
  avatar_url?: string;
  url_chaine: string;
  abonnes: number;
  videos_total: number;
  vues_total: number;
  actif: boolean;
  derniere_maj?: string;
  videos_count?: number;
  lives_count?: number;
}

export default function AdminChainesPage() {
  const [chaines, setChaines] = useState<Chaine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  
  // Formulaire d'ajout
  const [newChaine, setNewChaine] = useState({
    nom: '',
    type: 'youtube' as 'youtube' | 'twitch',
    channel_id: '',
    url_chaine: ''
  });

  useEffect(() => {
    chargerChaines();
  }, []);

  const chargerChaines = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/chaines');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setChaines(result.data);
        }
      }
    } catch (error) {
      console.error('Erreur chargement chaînes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ajouterChaine = async () => {
    try {
      if (!newChaine.nom || !newChaine.channel_id || !newChaine.url_chaine) {
        alert('❌ Veuillez remplir tous les champs obligatoires');
        return;
      }

      const response = await fetch('/api/chaines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: newChaine.nom,
          type: newChaine.type,
          channel_id: newChaine.channel_id,
          nom_affichage: newChaine.nom,
          url_chaine: newChaine.url_chaine,
          actif: true
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('✅ Chaîne ajoutée avec succès !');
          setNewChaine({ nom: '', type: 'youtube', channel_id: '', url_chaine: '' });
          setShowAddForm(false);
          await chargerChaines();
        } else {
          alert('❌ Erreur: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Erreur ajout chaîne:', error);
      alert('❌ Erreur lors de l\'ajout');
    }
  };

  const toggleActif = async (id: number, actif: boolean) => {
    try {
      const response = await fetch(`/api/chaines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: !actif })
      });

      if (response.ok) {
        await chargerChaines();
      }
    } catch (error) {
      console.error('Erreur toggle actif:', error);
    }
  };

  const supprimerChaine = async (id: number, nom: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la chaîne "${nom}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/chaines/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('✅ Chaîne supprimée');
        await chargerChaines();
      } else {
        alert('❌ Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const synchroniserTout = async () => {
    try {
      setSyncLoading(true);
      const response = await fetch('/api/sync/channels', {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('✅ Synchronisation réussie ! Toutes les chaînes ont été mises à jour.');
          await chargerChaines();
        } else {
          alert('❌ Erreur lors de la synchronisation: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Erreur synchronisation:', error);
      alert('❌ Erreur lors de la synchronisation');
    } finally {
      setSyncLoading(false);
    }
  };

  const testerAPI = async (chaine: Chaine) => {
    try {
      let apiUrl = '';
      if (chaine.type === 'youtube') {
        apiUrl = `/api/youtube/channel?id=${chaine.channel_id}`;
      } else {
        apiUrl = `/api/twitch/channel?username=${chaine.nom}`;
      }

      const response = await fetch(apiUrl);
      const result = await response.json();

      if (result.success) {
        const data = result.data;
        let message = `✅ API ${chaine.type.toUpperCase()} fonctionnelle !\n\n`;
        
        if (chaine.type === 'youtube') {
          message += `Données récupérées:\n`;
          message += `- Nom: ${data.title}\n`;
          message += `- Abonnés: ${data.subscriberCount?.toLocaleString()}\n`;
          message += `- Vidéos: ${data.videoCount}\n`;
          message += `- Vues totales: ${data.viewCount?.toLocaleString()}`;
        } else {
          message += `Données récupérées:\n`;
          message += `- Nom: ${data.display_name}\n`;
          message += `- Followers: ${data.follower_count?.toLocaleString()}\n`;
          message += `- Type: ${data.broadcaster_type || 'Utilisateur normal'}`;
          if (data.broadcaster_type === 'affiliate') {
            message += `\n\n💡 Chaîne affiliate Twitch - API fonctionnelle !`;
          }
        }
        
        alert(message);
      } else {
        alert(`❌ Erreur API ${chaine.type.toUpperCase()}: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur test API:', error);
      alert('❌ Erreur lors du test API');
    }
  };

  const formatNombre = (nombre: number): string => {
    if (nombre >= 1000000) {
      return (nombre / 1000000).toFixed(1) + 'M';
    } else if (nombre >= 1000) {
      return (nombre / 1000).toFixed(1) + 'K';
    }
    return nombre.toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des chaînes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                ⚙️ Administration - Chaînes
              </h1>
              <p className="text-gray-600">
                Gestion des chaînes YouTube et Twitch avec synchronisation automatique
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                ➕ Ajouter Chaîne
              </button>
              
              <button
                onClick={synchroniserTout}
                disabled={syncLoading}
                className={`px-4 py-2 rounded-lg font-medium text-white ${
                  syncLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {syncLoading ? '🔄 Sync...' : '🔄 Synchroniser Tout'}
              </button>
            </div>
          </div>
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">➕ Ajouter une nouvelle chaîne</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la chaîne *
                </label>
                <input
                  type="text"
                  value={newChaine.nom}
                  onChange={(e) => setNewChaine({ ...newChaine, nom: e.target.value })}
                  placeholder="ImaginaryFlame"
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de plateforme *
                </label>
                <select
                  value={newChaine.type}
                  onChange={(e) => setNewChaine({ ...newChaine, type: e.target.value as 'youtube' | 'twitch' })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="youtube">YouTube</option>
                  <option value="twitch">Twitch</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {newChaine.type === 'youtube' ? 'Channel ID YouTube *' : 'Nom d\'utilisateur Twitch *'}
                </label>
                <input
                  type="text"
                  value={newChaine.channel_id}
                  onChange={(e) => setNewChaine({ ...newChaine, channel_id: e.target.value })}
                  placeholder={newChaine.type === 'youtube' ? 'UCxxxxxxxxxxxxxxxxxx' : 'imaginaryflame'}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newChaine.type === 'youtube' 
                    ? 'ID de la chaîne YouTube (commence par UC)'
                    : 'Nom d\'utilisateur Twitch (sans @, lettres/chiffres/_ seulement)'
                  }
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de la chaîne *
                </label>
                <input
                  type="url"
                  value={newChaine.url_chaine}
                  onChange={(e) => setNewChaine({ ...newChaine, url_chaine: e.target.value })}
                  placeholder={newChaine.type === 'youtube' ? 'https://youtube.com/@imaginaryflame' : 'https://twitch.tv/imaginaryflame'}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={ajouterChaine}
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
              >
                ✅ Ajouter
              </button>
            </div>
          </div>
        )}

        {/* Liste des chaînes */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            📺 Chaînes configurées ({chaines.length})
          </h2>
          
          {chaines.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📺</div>
              <h3 className="text-lg font-medium mb-2">Aucune chaîne configurée</h3>
              <p className="text-sm">Cliquez sur "Ajouter Chaîne" pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chaines.map(chaine => (
                <div key={chaine.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    
                    {/* Informations de la chaîne */}
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        {chaine.avatar_url ? (
                          <img 
                            src={chaine.avatar_url} 
                            alt={chaine.nom_affichage}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center text-white text-2xl ${
                            chaine.type === 'youtube' ? 'bg-red-500' : 'bg-purple-500'
                          }`}>
                            {chaine.type === 'youtube' ? '📺' : '🎮'}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {chaine.nom_affichage}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            chaine.type === 'youtube' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {chaine.type.toUpperCase()}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            chaine.actif 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {chaine.actif ? '✅ Actif' : '⏸️ Inactif'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {chaine.description || 'Aucune description'}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>🆔 {chaine.channel_id}</span>
                          <span>
                            👥 {formatNombre(chaine.abonnes)} {chaine.type === 'youtube' ? 'abonnés' : 'followers'}
                          </span>
                          <span>
                            📹 {formatNombre(chaine.videos_count || 0)} vidéos 
                            {chaine.type === 'youtube' ? ' (API)' : ' (VODs)'}
                          </span>
                          {chaine.type === 'youtube' && (
                            <span>👀 {formatNombre(chaine.vues_total)} vues</span>
                          )}
                          {chaine.lives_count !== undefined && chaine.lives_count > 0 && (
                            <span>🔴 {chaine.lives_count} lives</span>
                          )}
                        </div>
                        
                        {chaine.derniere_maj && (
                          <p className="text-xs text-gray-400 mt-1">
                            Dernière MAJ: {new Date(chaine.derniere_maj).toLocaleString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => testerAPI(chaine)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        🧪 Test API
                      </button>
                      
                      <a
                        href={chaine.url_chaine}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        🔗 Visiter
                      </a>
                      
                      <button
                        onClick={() => toggleActif(chaine.id, chaine.actif)}
                        className={`px-3 py-1 text-sm rounded ${
                          chaine.actif 
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {chaine.actif ? '⏸️ Désactiver' : '▶️ Activer'}
                      </button>
                      
                      <button
                        onClick={() => supprimerChaine(chaine.id, chaine.nom_affichage)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-3">📋 Instructions de configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">🔴 YouTube</h4>
              <ul className="space-y-1 text-blue-600">
                <li>• Channel ID: Trouvable dans l'URL ou les paramètres</li>
                <li>• Format: UCxxxxxxxxxxxxxxxxxx</li>
                <li>• API Key requise dans .env</li>
                <li>• Synchronisation: Vidéos, Lives, Statistiques</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-purple-700 mb-2">🟣 Twitch</h4>
              <ul className="space-y-1 text-purple-600">
                <li>• Username: Nom d'utilisateur sans @ (lettres/chiffres/_)</li>
                <li>• Client ID & Secret requis dans .env</li>
                <li>• Synchronisation: Streams, VODs, Followers</li>
                <li>• Détection automatique des lives</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center space-x-6">
          <a href="/admin" className="text-blue-500 hover:text-blue-700 underline">
            🏠 Retour Admin
          </a>
          <a href="/chaines" className="text-purple-500 hover:text-purple-700 underline">
            📺 Voir les Chaînes
          </a>
          <a href="/admin/test-apis" className="text-green-500 hover:text-green-700 underline">
            🧪 Test APIs
          </a>
        </div>
      </div>
    </div>
  );
} 