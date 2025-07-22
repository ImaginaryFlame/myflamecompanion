'use client';

import { useState, useEffect } from 'react';

interface Histoire {
  id: number;
  titre: string;
  auteur: string;
  source: string;
}

interface Chapitre {
  titre: string;
  numero: number;
  contenu?: string;
}

export default function AdminChapitresPage() {
  const [histoires, setHistoires] = useState<Histoire[]>([]);
  const [histoireSelectionnee, setHistoireSelectionnee] = useState<number | null>(null);
  const [nouveauChapitre, setNouveauChapitre] = useState<Chapitre>({
    titre: '',
    numero: 1,
    contenu: ''
  });
  const [logs, setLogs] = useState<string[]>(['Prêt à ajouter des chapitres ! 📚']);
  const [isLoading, setIsLoading] = useState(false);

  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLog = () => {
    setLogs([]);
  };

  // Charger les histoires au démarrage
  useEffect(() => {
    chargerHistoires();
  }, []);

  const chargerHistoires = async () => {
    log('🔍 Chargement des histoires...');
    try {
      const response = await fetch('/api/histoire');
      if (response.ok) {
        const data = await response.json();
        setHistoires(data);
        log(`✅ ${data.length} histoires chargées`);
      } else {
        log(`❌ Erreur lors du chargement: ${response.status}`);
      }
    } catch (error) {
      log(`❌ Erreur réseau: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const ajouterChapitre = async () => {
    if (!histoireSelectionnee) {
      log('❌ Veuillez sélectionner une histoire');
      return;
    }

    if (!nouveauChapitre.titre.trim()) {
      log('❌ Veuillez entrer un titre pour le chapitre');
      return;
    }

    setIsLoading(true);
    log(`📖 Ajout du chapitre "${nouveauChapitre.titre}" à l'histoire ID ${histoireSelectionnee}...`);

    try {
      const response = await fetch('/api/chapitre', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          histoire_id: histoireSelectionnee,
          titre: nouveauChapitre.titre,
          numero: nouveauChapitre.numero,
          contenu: nouveauChapitre.contenu || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        log(`✅ Chapitre ajouté avec succès (ID: ${data.id})`);
        
        // Réinitialiser le formulaire pour le prochain chapitre
        setNouveauChapitre({
          titre: '',
          numero: nouveauChapitre.numero + 1, // Incrémenter automatiquement
          contenu: ''
        });
      } else {
        const error = await response.json();
        log(`❌ Erreur lors de l'ajout: ${JSON.stringify(error)}`);
      }
    } catch (error) {
      log(`❌ Erreur réseau: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    setIsLoading(false);
  };

  const histoireActuelle = histoires.find(h => h.id === histoireSelectionnee);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            📚 Administration - Ajouter des chapitres
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire d'ajout */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📖 Sélectionner une histoire
                </label>
                <select
                  value={histoireSelectionnee || ''}
                  onChange={(e) => {
                    const id = parseInt(e.target.value);
                    setHistoireSelectionnee(id);
                    setNouveauChapitre(prev => ({ ...prev, numero: 1 })); // Reset numéro
                    log(`📚 Histoire sélectionnée: ${histoires.find(h => h.id === id)?.titre}`);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Choisir une histoire --</option>
                  {histoires.map((histoire) => (
                    <option key={histoire.id} value={histoire.id}>
                      {histoire.titre} ({histoire.auteur})
                    </option>
                  ))}
                </select>
              </div>

              {histoireActuelle && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800">Histoire sélectionnée :</h3>
                  <p className="text-blue-700">{histoireActuelle.titre}</p>
                  <p className="text-sm text-blue-600">Par {histoireActuelle.auteur} - {histoireActuelle.source}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔢 Numéro du chapitre
                </label>
                <input
                  type="number"
                  value={nouveauChapitre.numero}
                  onChange={(e) => setNouveauChapitre(prev => ({ 
                    ...prev, 
                    numero: parseInt(e.target.value) || 1 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Titre du chapitre
                </label>
                <input
                  type="text"
                  value={nouveauChapitre.titre}
                  onChange={(e) => setNouveauChapitre(prev => ({ 
                    ...prev, 
                    titre: e.target.value 
                  }))}
                  placeholder="Ex: Le Début de l'Aventure"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📄 Contenu (optionnel)
                </label>
                <textarea
                  value={nouveauChapitre.contenu}
                  onChange={(e) => setNouveauChapitre(prev => ({ 
                    ...prev, 
                    contenu: e.target.value 
                  }))}
                  placeholder="Résumé ou extrait du chapitre..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={ajouterChapitre}
                  disabled={isLoading || !histoireSelectionnee || !nouveauChapitre.titre.trim()}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  {isLoading ? '⏳ Ajout...' : '➕ Ajouter ce chapitre'}
                </button>
                
                <button
                  onClick={clearLog}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  🧹 Effacer le log
                </button>
              </div>
            </div>

            {/* Log des actions */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Journal des actions</h2>
              <div className="bg-gray-50 border rounded-lg p-4 h-96 overflow-y-auto">
                <div className="font-mono text-sm whitespace-pre-wrap">
                  {logs.map((log, index) => (
                    <div key={index} className={
                      log.includes('✅') ? 'text-green-600' :
                      log.includes('❌') ? 'text-red-600' :
                      log.includes('🔍') || log.includes('📖') || log.includes('📚') ? 'text-blue-600' :
                      'text-gray-700'
                    }>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center space-x-4">
            <a 
              href="/api/chapitre" 
              target="_blank"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              🔗 Voir tous les chapitres (API)
            </a>
            <a 
              href="/admin" 
              className="text-gray-500 hover:text-gray-700 underline"
            >
              ← Retour à l'admin principal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 