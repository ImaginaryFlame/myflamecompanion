'use client';

import { useState, useEffect } from 'react';

interface Chapitre {
  id: number;
  titre: string;
  numero: number;
  histoire_id: number;
}

interface Histoire {
  id: number;
  titre: string;
  auteur: string;
  chapitres: Chapitre[];
}

export default function AdminCorrigerChapitresPage() {
  const [histoires, setHistoires] = useState<Histoire[]>([]);
  const [selectedHistoire, setSelectedHistoire] = useState<number | null>(null);
  const [chapitresModifies, setChapitresModifies] = useState<{ [key: number]: string }>({});
  const [logs, setLogs] = useState<string[]>(['Prêt à corriger les chapitres ! ✏️']);
  const [isLoading, setIsLoading] = useState(false);

  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLog = () => {
    setLogs([]);
  };

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
        log(`✅ ${data.length} histoires chargées`);
      }
    } catch (error) {
      log(`❌ Erreur chargement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const modifierTitreChapitre = (chapitreId: number, nouveauTitre: string) => {
    setChapitresModifies(prev => ({
      ...prev,
      [chapitreId]: nouveauTitre
    }));
  };

  const sauvegarderChapitre = async (chapitreId: number) => {
    const nouveauTitre = chapitresModifies[chapitreId];
    if (!nouveauTitre?.trim()) {
      log('❌ Le titre ne peut pas être vide');
      return;
    }

    setIsLoading(true);
    log(`💾 Sauvegarde du chapitre ID ${chapitreId}...`);

    try {
      const response = await fetch(`/api/chapitre/${chapitreId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titre: nouveauTitre.trim()
        })
      });

      if (response.ok) {
        log(`✅ Chapitre ${chapitreId} mis à jour avec succès`);
        
        // Recharger les histoires pour voir les changements
        await chargerHistoires();
        
        // Nettoyer les modifications
        setChapitresModifies(prev => {
          const newModified = { ...prev };
          delete newModified[chapitreId];
          return newModified;
        });
      } else {
        const error = await response.json();
        log(`❌ Erreur sauvegarde: ${JSON.stringify(error)}`);
      }
    } catch (error) {
      log(`❌ Erreur réseau: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    setIsLoading(false);
  };

  const sauvegarderTousLesChapitres = async () => {
    if (Object.keys(chapitresModifies).length === 0) {
      log('❌ Aucune modification à sauvegarder');
      return;
    }

    setIsLoading(true);
    log(`💾 Sauvegarde de ${Object.keys(chapitresModifies).length} chapitres...`);

    let succes = 0;
    let erreurs = 0;

    for (const [chapitreId, nouveauTitre] of Object.entries(chapitresModifies)) {
      try {
        const response = await fetch(`/api/chapitre/${chapitreId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            titre: nouveauTitre.trim()
          })
        });

        if (response.ok) {
          succes++;
        } else {
          erreurs++;
        }
      } catch (error) {
        erreurs++;
      }
    }

    log(`📊 Résultat: ${succes} succès, ${erreurs} erreurs`);
    
    if (succes > 0) {
      await chargerHistoires();
      setChapitresModifies({});
    }

    setIsLoading(false);
  };

  const histoireSelectionnee = histoires.find(h => h.id === selectedHistoire);

  // Exemples de vrais chapitres pour tes histoires
  const exemplesChapitres = {
    acte1: [
      "Rencontre Avec Le Héros | Paris-la-Déchue",
      "Rencontre avec la Fée | Bienvenue au Royaume de la Forêt des Fées", 
      "Lointaine Enfance",
      "Vision et souvenir",
      "Préparatifs et légitimité"
    ],
    acte2: [
      "Prologue - Le Retour des Ombres",
      "Chapitre 1 - La Chute du Héros",
      "Chapitre 2 - Les Parias se Révèlent",
      "Chapitre 3 - La Revanche Commence",
      "Chapitre 4 - L'Alliance Interdite"
    ]
  };

  const appliquerExemples = (type: 'acte1' | 'acte2') => {
    if (!histoireSelectionnee) return;

    const exemples = exemplesChapitres[type];
    const nouveauxTitres: { [key: number]: string } = {};

    histoireSelectionnee.chapitres
      .sort((a, b) => a.numero - b.numero)
      .slice(0, exemples.length)
      .forEach((chapitre, index) => {
        nouveauxTitres[chapitre.id] = exemples[index];
      });

    setChapitresModifies(prev => ({ ...prev, ...nouveauxTitres }));
    log(`✅ Exemples appliqués pour ${type === 'acte1' ? 'Acte 1' : 'Acte 2'} (${exemples.length} chapitres)`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            ✏️ Corriger les chapitres inventés
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sélection d'histoire */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📚 Sélectionner une histoire
              </h2>
              
              <div className="space-y-3">
                {histoires.map((histoire) => (
                  <div
                    key={histoire.id}
                    onClick={() => setSelectedHistoire(histoire.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedHistoire === histoire.id
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <h3 className="font-semibold text-sm text-gray-800 mb-2">
                      {histoire.titre.length > 50 
                        ? histoire.titre.substring(0, 50) + '...'
                        : histoire.titre
                      }
                    </h3>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{histoire.auteur}</span>
                      <span>📖 {histoire.chapitres?.length || 0} chapitres</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Exemples rapides */}
              {histoireSelectionnee && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">🚀 Exemples rapides :</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => appliquerExemples('acte1')}
                      className="w-full text-left text-sm bg-yellow-100 hover:bg-yellow-200 p-2 rounded"
                    >
                      📖 Appliquer exemples Acte 1
                    </button>
                    <button
                      onClick={() => appliquerExemples('acte2')}
                      className="w-full text-left text-sm bg-yellow-100 hover:bg-yellow-200 p-2 rounded"
                    >
                      📖 Appliquer exemples Acte 2
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Édition des chapitres */}
            <div className="lg:col-span-2">
              {histoireSelectionnee ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      ✏️ Corriger les chapitres de "{histoireSelectionnee.titre.substring(0, 30)}..."
                    </h2>
                    <div className="space-x-2">
                      <button
                        onClick={sauvegarderTousLesChapitres}
                        disabled={isLoading || Object.keys(chapitresModifies).length === 0}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm"
                      >
                        {isLoading ? '⏳' : '💾'} Sauvegarder tout ({Object.keys(chapitresModifies).length})
                      </button>
                      <button
                        onClick={clearLog}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                      >
                        🧹 Effacer log
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {histoireSelectionnee.chapitres
                      .sort((a, b) => a.numero - b.numero)
                      .map((chapitre) => (
                      <div key={chapitre.id} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            Chapitre {chapitre.numero}
                          </span>
                          <span className="text-xs text-gray-500">ID: {chapitre.id}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs text-gray-500">Titre actuel (probablement inventé) :</label>
                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                              {chapitre.titre}
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-500">Nouveau titre (le vrai) :</label>
                            <input
                              type="text"
                              value={chapitresModifies[chapitre.id] || ''}
                              onChange={(e) => modifierTitreChapitre(chapitre.id, e.target.value)}
                              placeholder="Entrez le vrai titre du chapitre..."
                              className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          
                          {chapitresModifies[chapitre.id] && (
                            <button
                              onClick={() => sauvegarderChapitre(chapitre.id)}
                              disabled={isLoading}
                              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs"
                            >
                              💾 Sauvegarder ce chapitre
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">✏️</div>
                  <p className="text-lg">Sélectionnez une histoire pour corriger ses chapitres</p>
                  <p className="text-sm mt-2">Les chapitres actuels ont été inventés par l'IA - corrigez-les avec les vrais titres !</p>
                </div>
              )}
            </div>
          </div>

          {/* Log des actions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Journal des corrections</h3>
            <div className="bg-gray-50 border rounded-lg p-4 h-32 overflow-y-auto">
              <div className="font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={index} className={
                    log.includes('✅') ? 'text-green-600' :
                    log.includes('❌') ? 'text-red-600' :
                    log.includes('💾') ? 'text-blue-600' :
                    'text-gray-700'
                  }>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center space-x-4">
            <a href="/admin/visualiser" className="text-blue-500 hover:text-blue-700 underline">
              👁️ Voir le résultat
            </a>
            <a href="/admin" className="text-gray-500 hover:text-gray-700 underline">
              ← Retour admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 