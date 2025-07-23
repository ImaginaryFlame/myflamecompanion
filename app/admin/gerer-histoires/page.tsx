'use client';

import { useState, useEffect } from 'react';

interface Histoire {
  id: number;
  titre: string;
  auteur: string;
  source: string;
  url_source?: string;
  description?: string;
  chapitres: { id: number; titre: string; numero: number }[];
}

export default function AdminGererHistoiresPage() {
  const [histoires, setHistoires] = useState<Histoire[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [histoireASupprimer, setHistoireASupprimer] = useState<Histoire | null>(null);
  const [isClient, setIsClient] = useState(false);

  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLog = () => {
    setLogs([]);
  };

  useEffect(() => {
    setIsClient(true);
    setLogs(['Prêt à gérer les histoires ! 🗂️']);
    chargerHistoires();
  }, []);

  const chargerHistoires = async () => {
    try {
      const response = await fetch('/api/histoire');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setHistoires(result.data);
          log(`✅ ${result.data.length} histoires chargées`);
        } else {
          log(`❌ Erreur API: ${result.error || 'Format de réponse inattendu'}`);
        }
      }
    } catch (error) {
      log(`❌ Erreur chargement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const supprimerHistoire = async (histoire: Histoire) => {
    if (!histoire) return;

    setIsLoading(true);
    log(`🗑️ Suppression de "${histoire.titre}"...`);

    try {
      const response = await fetch(`/api/histoire/${histoire.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        log(`✅ Histoire supprimée: ${result.histoire.titre}`);
        
        // Recharger la liste
        await chargerHistoires();
        setHistoireASupprimer(null);
      } else {
        const error = await response.json();
        log(`❌ Erreur suppression: ${error.error}`);
      }
    } catch (error) {
      log(`❌ Erreur réseau: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    setIsLoading(false);
  };

  const confirmerSuppression = (histoire: Histoire) => {
    setHistoireASupprimer(histoire);
  };

  const annulerSuppression = () => {
    setHistoireASupprimer(null);
  };

  const supprimerToutesLesHistoiresTest = async () => {
    const histoiresTest = histoires.filter(h => 
      h.titre.includes('Histoire Fantastique') || 
      h.titre.includes('Romance Moderne') ||
      h.titre.includes('Science-Fiction') ||
      h.titre.includes('Titre extrait de Wattpad')
    );

    if (histoiresTest.length === 0) {
      log('ℹ️ Aucune histoire de test trouvée');
      return;
    }

    setIsLoading(true);
    log(`🧹 Suppression de ${histoiresTest.length} histoires de test...`);

    let succes = 0;
    let erreurs = 0;

    for (const histoire of histoiresTest) {
      try {
        const response = await fetch(`/api/histoire/${histoire.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          succes++;
          log(`✅ Supprimé: ${histoire.titre.substring(0, 30)}...`);
        } else {
          erreurs++;
          log(`❌ Échec: ${histoire.titre.substring(0, 30)}...`);
        }
      } catch (error) {
        erreurs++;
        log(`❌ Erreur: ${histoire.titre.substring(0, 30)}...`);
      }
    }

    log(`📊 Nettoyage terminé: ${succes} supprimées, ${erreurs} erreurs`);
    await chargerHistoires();
    setIsLoading(false);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🗂️ Gérer les histoires
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Actions rapides */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                ⚡ Actions rapides
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={chargerHistoires}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg"
                >
                  🔄 Actualiser la liste
                </button>

                <button
                  onClick={supprimerToutesLesHistoiresTest}
                  disabled={isLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg"
                >
                  🧹 Supprimer histoires de test
                </button>

                <button
                  onClick={clearLog}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg"
                >
                  🗑️ Effacer le log
                </button>
              </div>

              {/* Statistiques */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">📊 Statistiques</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>Total histoires: {histoires.length}</div>
                  <div>Histoires avec chapitres: {histoires.filter(h => h.chapitres?.length > 0).length}</div>
                  <div>Histoires de test: {histoires.filter(h => 
                    h.titre.includes('Histoire Fantastique') || 
                    h.titre.includes('Romance Moderne') ||
                    h.titre.includes('Science-Fiction')
                  ).length}</div>
                </div>
              </div>
            </div>

            {/* Liste des histoires */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📚 Liste des histoires ({histoires.length})
              </h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {histoires.map((histoire) => (
                  <div key={histoire.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {histoire.titre}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Par {histoire.auteur} • {histoire.source} • {histoire.chapitres?.length || 0} chapitres
                        </p>
                        {histoire.url_source && (
                          <a 
                            href={histoire.url_source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline block truncate"
                          >
                            {histoire.url_source}
                          </a>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          ID: {histoire.id}
                        </span>
                        <button
                          onClick={() => confirmerSuppression(histoire)}
                          disabled={isLoading}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    </div>

                    {histoire.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {histoire.description.substring(0, 150)}...
                      </p>
                    )}
                  </div>
                ))}

                {histoires.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-lg">Aucune histoire trouvée</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Log des actions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Journal des actions</h3>
            <div className="bg-gray-50 border rounded-lg p-4 h-32 overflow-y-auto">
              <div className="font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={index} className={
                    log.includes('✅') ? 'text-green-600' :
                    log.includes('❌') ? 'text-red-600' :
                    log.includes('🗑️') || log.includes('🧹') ? 'text-orange-600' :
                    log.includes('🔄') ? 'text-blue-600' :
                    'text-gray-700'
                  }>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center space-x-4">
            <a href="/admin" className="text-gray-500 hover:text-gray-700 underline">
              ← Retour admin
            </a>
            <a href="/admin/visualiser" className="text-blue-500 hover:text-blue-700 underline">
              👁️ Visualiser les histoires
            </a>
          </div>
        </div>
      </div>

      {/* Modal de confirmation */}
      {histoireASupprimer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              ⚠️ Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir supprimer l'histoire :
            </p>
            <p className="font-semibold text-gray-800 mb-2">
              "{histoireASupprimer.titre}"
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Cette action supprimera aussi tous les chapitres, notes et progressions associés.
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={annulerSuppression}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Annuler
              </button>
              <button
                onClick={() => supprimerHistoire(histoireASupprimer)}
                disabled={isLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
              >
                {isLoading ? '⏳ Suppression...' : '🗑️ Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 