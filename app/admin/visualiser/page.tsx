'use client';

import { useState, useEffect } from 'react';

interface Chapitre {
  id: number;
  titre: string;
  numero: number;
  url_chapitre?: string;
}

interface Histoire {
  id: number;
  titre: string;
  auteur: string;
  description: string;
  source: string;
  url_source: string;
  chapitres: Chapitre[];
}

export default function VisualiseurAdmin() {
  const [histoires, setHistoires] = useState<Histoire[]>([]);
  const [histoireSelectionnee, setHistoireSelectionnee] = useState<Histoire | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const chargerHistoires = async () => {
      try {
        const response = await fetch('/api/histoire');
        const data = await response.json();
        
        if (data.success) {
          setHistoires(data.data);
        } else {
          setErreur('Erreur lors du chargement des histoires');
        }
      } catch (error) {
        setErreur('Erreur de connexion');
      } finally {
        setChargement(false);
      }
    };

    chargerHistoires();
  }, []);

  const selectionnerHistoire = async (id: number) => {
    try {
      const response = await fetch(`/api/histoire/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setHistoireSelectionnee(data.data);
      } else {
        setErreur('Erreur lors du chargement des détails de l\'histoire');
      }
    } catch (error) {
      setErreur('Erreur de connexion');
    }
  };

  if (!isClient || chargement) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des histoires...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Visualiseur d'Histoires</h1>
          <p className="text-gray-600">Visualisez toutes vos histoires et leurs chapitres avec liens directs</p>
        </div>

        {erreur && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {erreur}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Liste des histoires */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📖 Histoires disponibles ({histoires.length})</h2>
            
            {histoires.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune histoire trouvée</p>
            ) : (
              <div className="space-y-3">
                {histoires.map((histoire) => (
                  <div
                    key={histoire.id}
                    onClick={() => selectionnerHistoire(histoire.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      histoireSelectionnee?.id === histoire.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {histoire.titre}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      ✍️ {histoire.auteur} • 📱 {histoire.source}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {histoire.description}
                    </p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        📚 {histoire.chapitres?.length || 0} chapitres
                      </span>
                      {histoire.url_source && (
                        <a
                          href={histoire.url_source}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          🔗 Source
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Détails de l'histoire sélectionnée */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {histoireSelectionnee ? (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">📖 {histoireSelectionnee.titre}</h2>
                  <p className="text-gray-600 mb-3">✍️ {histoireSelectionnee.auteur}</p>
                  <p className="text-sm text-gray-700 mb-4">{histoireSelectionnee.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      📱 {histoireSelectionnee.source}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      📚 {histoireSelectionnee.chapitres?.length || 0} chapitres
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">📋 Liste des chapitres</h3>
                  
                  {histoireSelectionnee.chapitres && histoireSelectionnee.chapitres.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {histoireSelectionnee.chapitres
                        .sort((a, b) => (a.numero || 0) - (b.numero || 0))
                        .map((chapitre) => (
                          <div
                            key={chapitre.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-500">
                                  #{chapitre.numero}
                                </span>
                                <span className="text-sm text-gray-900">
                                  {chapitre.titre || 'Titre non défini'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {chapitre.url_chapitre ? (
                                <>
                                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                    ✅ URL
                                  </span>
                                  <a
                                    href={chapitre.url_chapitre}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Ouvrir le chapitre sur Wattpad"
                                  >
                                    🔗
                                  </a>
                                </>
                              ) : (
                                <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
                                  ❌ Pas d'URL
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Aucun chapitre trouvé pour cette histoire
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sélectionnez une histoire
                </h3>
                <p className="text-gray-600">
                  Cliquez sur une histoire à gauche pour voir ses détails et chapitres
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/admin/dashboard"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Retour au Dashboard Admin
          </a>
        </div>
      </div>
    </div>
  );
} 