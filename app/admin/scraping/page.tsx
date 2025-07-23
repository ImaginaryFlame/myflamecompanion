'use client';

import { useState, useEffect } from 'react';

export default function AdminScrapingPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [url, setUrl] = useState('');
  const [logs, setLogs] = useState<string[]>(['Vérification des droits d\'accès... 🔐']);
  const [isLoading, setIsLoading] = useState(false);
  const [scrapingMode, setScrapingMode] = useState<'histoire' | 'profil'>('histoire');

  // Vérification des droits admin
  useEffect(() => {
    const verifierAccesAdmin = () => {
      // Pour l'instant, on simule une vérification simple
      // Plus tard tu pourras ajouter une vraie authentification
      const isAdminUser = true; // TODO: Remplacer par une vraie vérification
      
      setIsAdmin(isAdminUser);
      
      if (isAdminUser) {
        setLogs(['✅ Accès administrateur confirmé - Prêt à scraper ! 🕷️']);
      } else {
        setLogs(['❌ Accès refusé - Seul l\'administrateur peut scraper les histoires']);
      }
    };

    verifierAccesAdmin();
  }, []);

  // Si pas encore vérifié
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Vérification des droits d'accès...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si pas admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h1 className="text-3xl font-bold text-red-800 mb-4">
                Accès Restreint
              </h1>
              <p className="text-xl text-red-600 mb-6">
                Seul l'administrateur peut scraper de nouvelles histoires
              </p>
              
              <div className="bg-white p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">👥 En tant qu'utilisateur, tu peux :</h3>
                <ul className="text-left text-gray-700 space-y-2">
                  <li>• 📚 <strong>Consulter</strong> toutes les histoires disponibles</li>
                  <li>• ⭐ <strong>Suivre</strong> tes histoires préférées</li>
                  <li>• 📖 <strong>Marquer</strong> ta progression de lecture</li>
                  <li>• ⭐ <strong>Noter</strong> les chapitres que tu as lus</li>
                  <li>• 🔔 <strong>Recevoir des notifications</strong> pour les nouveaux chapitres</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="/dashboard"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  📱 Dashboard Utilisateur
                </a>
                <a
                  href="/histoires"
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  📚 Parcourir les Histoires
                </a>
              </div>

              <div className="mt-6 text-center">
                <a href="/" className="text-gray-500 hover:text-gray-700 underline">
                  ← Retour à l'accueil
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interface admin (code existant)
  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLog = () => {
    setLogs([]);
  };

  const detecterPlateforme = (url: string) => {
    if (url.includes('wattpad.com')) return 'Wattpad';
    if (url.includes('webnovel.com')) return 'Webnovel';
    if (url.includes('yume-arts.com')) return 'Yume-Arts';
    return 'Inconnue';
  };

  const scraperHistoire = async (modeVerification = false) => {
    if (!url.trim()) {
      log('❌ Veuillez entrer une URL');
      return;
    }

    const plateforme = detecterPlateforme(url);
    if (plateforme === 'Inconnue') {
      log('❌ Plateforme non supportée. Utilisez Wattpad, Webnovel ou Yume-Arts');
      return;
    }

    setIsLoading(true);
    const typeAction = modeVerification ? 'vérification des mises à jour' : 'scraping intelligent';
    log(`🧠 Début du ${typeAction} pour ${plateforme}...`);
    log(`🔗 URL: ${url}`);

    try {
      const endpoint = '/api/scraping/wattpad-smart';
      const body = { url, verificationMaj: modeVerification };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        
        if (modeVerification) {
          log(`✅ Vérification terminée !`);
          if (data.chapitres.nouveaux > 0) {
            log(`🎉 ${data.chapitres.nouveaux} nouveaux chapitres détectés !`);
            log(`📖 Total: ${data.chapitres.total} chapitres`);
          } else {
            log(`ℹ️ Aucun nouveau chapitre détecté`);
            log(`📖 Histoire à jour avec ${data.chapitres.total} chapitres`);
          }
        } else {
          log(`✅ Histoire scrapée avec succès !`);
          log(`📚 Titre: ${data.histoire.titre}`);
          log(`✍️ Auteur: ${data.histoire.auteur}`);
          log(`📖 Chapitres: ${data.chapitres.total} trouvés, ${data.chapitres.nouveaux} ajoutés`);
        }
        
        log(`🆔 ID de l'histoire: ${data.histoire.id}`);
        if (data.methode) {
          log(`🔧 Méthode utilisée: ${data.methode}`);
        }
        if (data.misAJour) {
          log(`🔄 Histoire mise à jour: ${data.misAJour}`);
        }
      } else {
        const error = await response.json();
        log(`❌ Erreur lors du ${typeAction}: ${error.error}`);
        if (error.details) {
          log(`🔍 Détails: ${error.details}`);
        }
      }
    } catch (error) {
      log(`❌ Erreur réseau: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    setIsLoading(false);
  };

  const scraperProfil = async () => {
    if (!url.trim()) {
      log('❌ Veuillez entrer une URL de profil ou un nom d\'utilisateur');
      return;
    }

    const plateforme = detecterPlateforme(url);
    if (plateforme !== 'Wattpad') {
      log('❌ Ce mode de scraping est uniquement disponible pour Wattpad. Utilisez Wattpad pour scraper un profil.');
      return;
    }

    setIsLoading(true);
    log(`🧠 Début du scraping de profil pour ${url}...`);

    try {
      const endpoint = '/api/scraping/profil-wattpad';
      const body = url.includes('wattpad.com/user/') 
        ? { profilUrl: url }
        : { username: url };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        log(`✅ Scraping de profil terminé !`);
        log(`📚 ${data.stats.total} histoires trouvées`);
        log(`🆕 ${data.stats.nouvelles} nouvelles histoires ajoutées`);
        log(`🔄 ${data.stats.mises_a_jour} histoires mises à jour`);
        
        if (data.resultats && data.resultats.length > 0) {
          log(`📋 Aperçu des histoires :`);
          data.resultats.slice(0, 3).forEach((resultat: any, index: number) => {
            log(`  ${index + 1}. ${resultat.titre} - ${resultat.statut}`);
          });
        }
      } else {
        const error = await response.json();
        log(`❌ Erreur lors du scraping de profil: ${error.error}`);
        if (error.details) {
          log(`🔍 Détails: ${error.details}`);
        }
      }
    } catch (error) {
      log(`❌ Erreur réseau: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    setIsLoading(false);
  };

  const exemples = [
    {
      plateforme: 'Wattpad',
      url: 'https://www.wattpad.com/story/287182109-le-h%C3%A9ros-et-la-f%C3%A9e-acte-2-puis-vint-la-revanche',
      titre: 'La Fable du Héros et la Fée - Acte 2'
    },
    {
      plateforme: 'Wattpad',
      url: 'https://www.wattpad.com/story/202925290-la-fable-du-h%C3%A9ros-et-la-f%C3%A9e-acte-1-il-%C3%A9tait-une',
      titre: 'La Fable du Héros et la Fée - Acte 1'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="bg-red-50 p-4 rounded-lg mb-6">
            <h2 className="font-semibold text-red-800 mb-2">🔒 Mode Administrateur</h2>
            <p className="text-sm text-red-700">
              Vous êtes connecté en tant qu'administrateur. Seuls les administrateurs peuvent scraper de nouvelles histoires.
            </p>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🧠 Scraping Intelligent - Admin Seulement !
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire de scraping */}
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">🎯 Options de Scraping :</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>🧠 <strong>Scraper intelligent</strong> : Une histoire à la fois (Playwright → Cheerio → Fallback)</li>
                  <li>👤 <strong>Scraper de profil</strong> : Toutes les histoires d'un auteur automatiquement</li>
                  <li>🔍 <strong>Vérification MAJ</strong> : Détecte les nouveaux chapitres</li>
                  <li>✏️ <strong>Éditeur</strong> : Modifie et ajoute des URLs de sites multiples</li>
                </ul>
              </div>

              {/* Mode de scraping */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔧 Mode de scraping
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="scrapingMode"
                      value="histoire"
                      checked={scrapingMode === 'histoire'}
                      onChange={(e) => setScrapingMode(e.target.value as 'histoire' | 'profil')}
                      className="text-blue-500"
                    />
                    <span className="text-sm">🧠 Une histoire</span>
                  </label>
                  <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="scrapingMode"
                      value="profil"
                      checked={scrapingMode === 'profil'}
                      onChange={(e) => setScrapingMode(e.target.value as 'histoire' | 'profil')}
                      className="text-blue-500"
                    />
                    <span className="text-sm">👤 Profil complet</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {scrapingMode === 'profil' ? '👤 URL de profil ou nom d\'utilisateur' : '🔗 URL de l\'histoire'}
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={scrapingMode === 'profil' 
                    ? "https://www.wattpad.com/user/ImaginaryFlame ou ImaginaryFlame" 
                    : "https://www.wattpad.com/story/..."
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {url && scrapingMode === 'histoire' && (
                  <p className="mt-2 text-sm text-gray-600">
                    Plateforme détectée: <span className="font-semibold text-blue-600">{detecterPlateforme(url)}</span>
                  </p>
                )}
                {url && scrapingMode === 'profil' && (
                  <p className="mt-2 text-sm text-gray-600">
                    Mode: <span className="font-semibold text-purple-600">Scraping de profil complet</span>
                  </p>
                )}
              </div>

              {scrapingMode === 'histoire' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => scraperHistoire(false)}
                    disabled={isLoading || !url.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center"
                  >
                    {isLoading ? '🧠 Scraping...' : '🚀 Scraper cette histoire'}
                  </button>

                  <button
                    onClick={() => scraperHistoire(true)}
                    disabled={isLoading || !url.trim()}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center"
                  >
                    {isLoading ? '🔍 Vérification...' : '🔄 Vérifier MAJ'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={scraperProfil}
                    disabled={isLoading || !url.trim()}
                    className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center"
                  >
                    {isLoading ? '👤 Scraping du profil...' : '🚀 Scraper tout le profil'}
                  </button>
                  
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-purple-700">
                      <strong>Mode profil :</strong> Va récupérer automatiquement toutes les histoires de ce profil Wattpad !
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={clearLog}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold"
              >
                🧹 Effacer le log
              </button>

              {/* Exemples */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">💡 Exemples d'URLs :</h3>
                <div className="space-y-2">
                  {exemples.map((exemple, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded border">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium text-gray-600">{exemple.plateforme}</span>
                          <p className="text-sm text-gray-800">{exemple.titre}</p>
                        </div>
                        <button
                          onClick={() => setUrl(exemple.url)}
                          className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                        >
                          Utiliser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Log des actions */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Journal du scraping</h2>
              <div className="bg-gray-50 border rounded-lg p-4 h-96 overflow-y-auto">
                <div className="font-mono text-sm whitespace-pre-wrap">
                  {logs.map((log, index) => (
                    <div key={index} className={
                      log.includes('✅') ? 'text-green-600' :
                      log.includes('❌') ? 'text-red-600' :
                      log.includes('🧠') || log.includes('🔗') || log.includes('📚') || log.includes('🔍') ? 'text-blue-600' :
                      log.includes('🎉') ? 'text-purple-600 font-semibold' :
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
              href="/admin/visualiser"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              👁️ Visualiser les histoires
            </a>
            <a
              href="/admin/gerer-histoires"
              className="text-orange-500 hover:text-orange-700 underline"
            >
              🗂️ Gérer les histoires
            </a>
            <a
              href="/admin/editer-histoires"
              className="text-purple-500 hover:text-purple-700 underline"
            >
              ✏️ Editer les histoires
            </a>
            <a
              href="/admin"
              className="text-gray-500 hover:text-gray-700 underline"
            >
              ← Retour admin
            </a>
          </div>

          <div className="mt-6 bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">👥 Gestion des utilisateurs :</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• <strong>Admin</strong> : Peut scraper et gérer toutes les histoires</li>
              <li>• <strong>Utilisateurs</strong> : Peuvent seulement consulter et suivre les histoires</li>
              <li>• Les utilisateurs reçoivent des notifications quand tu ajoutes de nouveaux chapitres</li>
              <li>• Système sécurisé - seul l'admin contrôle le contenu</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 