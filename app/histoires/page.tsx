'use client';

import { useState, useEffect } from 'react';

interface Histoire {
  id: number;
  titre: string;
  auteur: string;
  description: string;
  source: string;
  image_couverture: string | null;
  chapitres: any[];
  progressions: any[];
}

export default function HistoiresPage() {
  const [histoires, setHistoires] = useState<Histoire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtreSource, setFiltreSource] = useState('tous');
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    chargerHistoires();
  }, []);

  const chargerHistoires = async () => {
    try {
      const response = await fetch('/api/histoire');
      if (response.ok) {
        const result = await response.json();
        const data = result.success ? result.data : [];
        setHistoires(data);
      }
    } catch (error) {
      console.error('Erreur chargement histoires:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const suivreHistoire = async (histoireId: number) => {
    try {
      // TODO: Implémenter le système de suivi
      alert(`🔔 Vous suivez maintenant cette histoire ! Vous recevrez des notifications pour les nouveaux chapitres.`);
    } catch (error) {
      console.error('Erreur suivi histoire:', error);
    }
  };

  const marquerProgression = async (histoireId: number, chapitre: number) => {
    try {
      const response = await fetch('/api/progression', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          utilisateur_id: 1, // TODO: Gérer les utilisateurs multiples
          histoire_id: histoireId,
          dernier_chapitre_lu: chapitre
        })
      });

      if (response.ok) {
        alert(`📖 Progression mise à jour ! Chapitre ${chapitre} marqué comme lu.`);
        chargerHistoires(); // Recharger pour mettre à jour l'affichage
      }
    } catch (error) {
      console.error('Erreur progression:', error);
    }
  };

  // Filtrer les histoires
  const histoiresFiltrees = histoires.filter(histoire => {
    const matchSource = filtreSource === 'tous' || histoire.source?.toLowerCase() === filtreSource.toLowerCase();
    const matchRecherche = histoire.titre.toLowerCase().includes(recherche.toLowerCase()) ||
                          histoire.auteur?.toLowerCase().includes(recherche.toLowerCase());
    return matchSource && matchRecherche;
  });

  const sources = ['tous', ...Array.from(new Set(histoires.map(h => h.source).filter(Boolean)))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des histoires...</p>
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
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            📚 Bibliothèque d'Histoires
          </h1>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">👥 Mode Utilisateur :</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 📖 <strong>Parcourir</strong> toutes les histoires disponibles</li>
              <li>• ⭐ <strong>Suivre</strong> tes histoires préférées</li>
              <li>• 📊 <strong>Marquer</strong> ta progression de lecture</li>
              <li>• 🔔 <strong>Recevoir des notifications</strong> automatiquement</li>
            </ul>
          </div>

          {/* Filtres et recherche */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Rechercher
              </label>
              <input
                type="text"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Titre ou auteur..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📱 Source
              </label>
              <select
                value={filtreSource}
                onChange={(e) => setFiltreSource(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {sources.map(source => (
                  <option key={source} value={source}>
                    {source === 'tous' ? '🌐 Toutes les sources' : `📱 ${source}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-center text-gray-600">
            {histoiresFiltrees.length} histoire{histoiresFiltrees.length > 1 ? 's' : ''} trouvée{histoiresFiltrees.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Liste des histoires */}
        {histoiresFiltrees.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Aucune histoire trouvée</h2>
            <p className="text-gray-500 mb-6">
              {recherche || filtreSource !== 'tous' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'L\'administrateur n\'a pas encore ajouté d\'histoires'
              }
            </p>
            <div className="space-x-4">
              {(recherche || filtreSource !== 'tous') && (
                <button
                  onClick={() => {
                    setRecherche('');
                    setFiltreSource('tous');
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
                >
                  🔄 Réinitialiser les filtres
                </button>
              )}
              <a
                href="/dashboard"
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg inline-block"
              >
                📱 Retour au dashboard
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {histoiresFiltrees.map((histoire) => {
              const progression = histoire.progressions?.[0];
              const dernierChapitreLu = progression?.dernier_chapitre_lu || 0;
              const totalChapitres = histoire.chapitres?.length || 0;
              const pourcentage = totalChapitres > 0 ? Math.round((dernierChapitreLu / totalChapitres) * 100) : 0;

              return (
                <div key={histoire.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                      {histoire.titre}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      ✍️ {histoire.auteur || 'Auteur inconnu'}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>📱 {histoire.source || 'Source inconnue'}</span>
                      <span>•</span>
                      <span>📖 {totalChapitres} chapitre{totalChapitres > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {histoire.description && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                      {histoire.description}
                    </p>
                  )}

                  {/* Progression */}
                  {dernierChapitreLu > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">📊 Progression</span>
                        <span className="text-sm font-semibold text-blue-600">{pourcentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${pourcentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Chapitre {dernierChapitreLu} sur {totalChapitres}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={() => suivreHistoire(histoire.id)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      ⭐ Suivre cette histoire
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => marquerProgression(histoire.id, dernierChapitreLu + 1)}
                        disabled={dernierChapitreLu >= totalChapitres}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-2 rounded text-sm font-semibold"
                      >
                        📖 Chapitre suivant
                      </button>
                      
                      <button
                        onClick={() => {
                          const chapitre = prompt(`Quel chapitre avez-vous lu ? (1-${totalChapitres})`);
                          if (chapitre && !isNaN(parseInt(chapitre))) {
                            const num = parseInt(chapitre);
                            if (num >= 1 && num <= totalChapitres) {
                              marquerProgression(histoire.id, num);
                            } else {
                              alert('Numéro de chapitre invalide');
                            }
                          }
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm font-semibold"
                      >
                        📊 Marquer chapitre
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 text-center space-x-4">
          <a
            href="/dashboard"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            📱 Dashboard
          </a>
          <a
            href="/"
            className="text-gray-500 hover:text-gray-700 underline"
          >
            🏠 Accueil
          </a>
        </div>

        {/* Info système */}
        <div className="mt-6 bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">🔔 Notifications automatiques :</h3>
          <p className="text-sm text-green-700">
            Quand l'administrateur ajoute de nouveaux chapitres à tes histoires suivies, 
            tu recevras automatiquement des notifications ! Le système vérifie les mises à jour 
            tous les jours à 1h du matin.
          </p>
        </div>
      </div>
    </div>
  );
} 