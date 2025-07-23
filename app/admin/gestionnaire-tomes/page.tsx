'use client';

import { useState, useEffect } from 'react';

interface Histoire {
  id: number;
  titre: string;
  auteur: string;
  description: string;
  source: string;
  url_source: string;
  image_couverture: string | null;
  chapitres: any[];
  tome_numero?: number;
  licence_principale?: string;
  urls_multiples?: {
    wattpad?: string;
    webnovel_fr?: string;
    webnovel_en?: string;
    yume_arts_fr?: string;
    yume_arts_en?: string;
  };
}

interface Licence {
  nom: string;
  webnovel_url_fr?: string;
  webnovel_url_en?: string;
  yume_arts_url_fr?: string;
  yume_arts_url_en?: string;
  description: string;
  tomes: Histoire[];
  langue_principale: 'fr' | 'en';
}

export default function GestionnaireTomesPage() {
  const [histoires, setHistoires] = useState<Histoire[]>([]);
  const [licences, setLicences] = useState<Licence[]>([]);
  const [licenceSelectionnee, setLicenceSelectionnee] = useState<string>('');
  const [nouvelleUrl, setNouvelleUrl] = useState({ 
    webnovel_fr: '', 
    webnovel_en: '', 
    yume_arts_fr: '', 
    yume_arts_en: '' 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    chargerHistoires();
  }, []);

  // FONCTION DE DIAGNOSTIC
  const diagnosticUrls = () => {
    console.log('🔍 DIAGNOSTIC - Histoires chargées:', histoires);
    histoires.forEach(histoire => {
      console.log(`📚 ${histoire.titre}:`);
      console.log(`  - ID: ${histoire.id}`);
      console.log(`  - url_source: ${histoire.url_source}`);
      console.log(`  - description: ${histoire.description?.substring(0, 100)}...`);
      if (histoire.description?.includes('URLS_TEMP:')) {
        const urlsPart = histoire.description.split('URLS_TEMP:')[1];
        console.log(`  - URLs trouvées: ${urlsPart}`);
      } else {
        console.log(`  - Pas d'URLs TEMP trouvées`);
      }
    });
  };

  const chargerHistoires = async () => {
    try {
      const response = await fetch('/api/histoire');
      if (response.ok) {
        const result = await response.json();
        const data = result.success ? result.data : [];
        setHistoires(data);
        organiserParLicences(data);
      }
    } catch (error) {
      console.error('Erreur chargement histoires:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const organiserParLicences = (histoires: Histoire[]) => {
    const licencesMap = new Map<string, Histoire[]>();
    
    histoires.forEach(histoire => {
      // Détecter la licence principale basée sur le titre (fusionner FR/EN)
      let licence = 'Autres';
      
      // Fusionner "La Fable du Héros et la Fée" et "The Hero and the Fairy"
      if ((histoire.titre.toLowerCase().includes('héros') && histoire.titre.toLowerCase().includes('fée')) ||
          (histoire.titre.toLowerCase().includes('hero') && histoire.titre.toLowerCase().includes('fairy'))) {
        licence = 'La Fable du Héros et la Fée';
      } 
      // Fusionner toutes les variations de Vince
      else if (histoire.titre.toLowerCase().includes('vince')) {
        licence = 'Vince De Belii';
      }
      
      if (!licencesMap.has(licence)) {
        licencesMap.set(licence, []);
      }
      licencesMap.get(licence)!.push(histoire);
    });

    const licencesArray: Licence[] = Array.from(licencesMap.entries()).map(([nom, tomes]) => {
      // Détecter la langue principale basée sur les titres
      const langueDetectee = detecterLanguePrincipale(tomes);
      
      // Récupérer les URLs existantes depuis les histoires
      const urlsExistantes = extraireUrlsExistantes(tomes);
      
      return {
        nom,
        langue_principale: langueDetectee,
        description: genererDescriptionLicence(nom, tomes, langueDetectee),
        tomes: tomes.sort((a, b) => {
          // Trier par numéro d'acte/tome, puis par langue (FR avant EN)
          const acteA = extraireNumeroActe(a.titre);
          const acteB = extraireNumeroActe(b.titre);
          if (acteA !== acteB) return acteA - acteB;
          
          // Si même acte, mettre FR avant EN
          const estFrA = a.titre.toLowerCase().includes('héros') || a.titre.toLowerCase().includes('acte');
          const estFrB = b.titre.toLowerCase().includes('héros') || b.titre.toLowerCase().includes('acte');
          if (estFrA && !estFrB) return -1;
          if (!estFrA && estFrB) return 1;
          return 0;
        }),
        ...urlsExistantes
      };
    });

    setLicences(licencesArray);
  };

  const extraireUrlsExistantes = (tomes: Histoire[]) => {
    // Chercher les URLs dans tous les tomes de la licence
    let webnovel_url_fr = '';
    let webnovel_url_en = '';
    let yume_arts_url_fr = '';
    let yume_arts_url_en = '';

    tomes.forEach(tome => {
      // SOLUTION TEMPORAIRE : Lire depuis la description si URLs stockées en JSON
      if (tome.description && tome.description.includes('URLS_TEMP:')) {
        try {
          const urlsPart = tome.description.split('URLS_TEMP:')[1];
          const urlsData = JSON.parse(urlsPart);
          
          webnovel_url_fr = webnovel_url_fr || urlsData.webnovel_fr || '';
          webnovel_url_en = webnovel_url_en || urlsData.webnovel_en || '';
          yume_arts_url_fr = yume_arts_url_fr || urlsData.yume_arts_fr || '';
          yume_arts_url_en = yume_arts_url_en || urlsData.yume_arts_en || '';
          
          console.log(`📖 URLs trouvées dans ${tome.titre}:`, urlsData);
        } catch (e) {
          console.warn('⚠️ Erreur parsing URLs depuis description:', e);
        }
      }

      // Fallback : utiliser url_source comme avant
      if (tome.url_source) {
        if (tome.url_source.includes('fr.webnovel.com')) {
          webnovel_url_fr = webnovel_url_fr || tome.url_source;
        } else if (tome.url_source.includes('webnovel.com')) {
          webnovel_url_en = webnovel_url_en || tome.url_source;
        } else if (tome.url_source.includes('yume-arts.com/fr')) {
          yume_arts_url_fr = yume_arts_url_fr || tome.url_source;
        } else if (tome.url_source.includes('yume-arts.com/en')) {
          yume_arts_url_en = yume_arts_url_en || tome.url_source;
        }
      }

      // TODO: Une fois Prisma régénéré, utiliser ceci :
      /*
      if (tome.urls_multiples) {
        webnovel_url_fr = webnovel_url_fr || tome.urls_multiples.webnovel_fr || '';
        webnovel_url_en = webnovel_url_en || tome.urls_multiples.webnovel_en || '';
        yume_arts_url_fr = yume_arts_url_fr || tome.urls_multiples.yume_arts_fr || '';
        yume_arts_url_en = yume_arts_url_en || tome.urls_multiples.yume_arts_en || '';
      }
      */
    });

    console.log('🔗 URLs extraites pour la licence:', {
      webnovel_url_fr,
      webnovel_url_en,
      yume_arts_url_fr,
      yume_arts_url_en
    });

    return {
      webnovel_url_fr,
      webnovel_url_en,
      yume_arts_url_fr,
      yume_arts_url_en
    };
  };

  const detecterLanguePrincipale = (tomes: Histoire[]): 'fr' | 'en' => {
    // Compter les titres français vs anglais
    const scoresFr = tomes.filter(tome => 
      tome.titre.toLowerCase().includes('héros') || 
      tome.titre.toLowerCase().includes('fée') ||
      tome.titre.toLowerCase().includes('acte') ||
      !tome.titre.toLowerCase().includes('hero') // Si pas "hero", probablement français
    ).length;
    
    const scoresEn = tomes.filter(tome => 
      tome.titre.toLowerCase().includes('hero') || 
      tome.titre.toLowerCase().includes('fairy') ||
      tome.titre.toLowerCase().includes('act')
    ).length;
    
    return scoresFr >= scoresEn ? 'fr' : 'en';
  };

  const extraireNumeroActe = (titre: string): number => {
    // Gérer à la fois "Acte" et "Act"
    const matchFr = titre.match(/acte?\s*(\d+)/i);
    const matchEn = titre.match(/act\s*(\d+)/i);
    const match = matchFr || matchEn;
    return match ? parseInt(match[1]) : 0;
  };

  const genererDescriptionLicence = (nom: string, tomes: Histoire[], langue: 'fr' | 'en'): string => {
    const tomesParLangue = {
      fr: tomes.filter(t => t.titre.toLowerCase().includes('héros') || t.titre.toLowerCase().includes('acte') || !t.titre.toLowerCase().includes('hero')),
      en: tomes.filter(t => t.titre.toLowerCase().includes('hero') || t.titre.toLowerCase().includes('act'))
    };

    if (nom === 'La Fable du Héros et la Fée') {
      return `Saga complète (${tomesParLangue.fr.length} tomes FR + ${tomesParLangue.en.length} tomes EN). Dans un futur lointain, deux âmes que tout oppose doivent s'unir pour sauver le monde.`;
    } else if (nom === 'Vince De Belii') {
      return `Histoire de Vince De Belii (${tomesParLangue.fr.length} partie(s) FR + ${tomesParLangue.en.length} partie(s) EN).`;
    }
    return `Collection de ${tomes.length} histoire(s) multilingue.`;
  };

  const sauvegarderUrlsLicence = async (licence: Licence) => {
    const hasAnyUrl = nouvelleUrl.webnovel_fr || nouvelleUrl.webnovel_en || 
                      nouvelleUrl.yume_arts_fr || nouvelleUrl.yume_arts_en;
    
    if (!hasAnyUrl) {
      alert('❌ Veuillez entrer au moins une URL');
      return;
    }

    setIsSaving(true);
    console.log('🔄 Début sauvegarde pour licence:', licence.nom);
    console.log('📝 Nouvelles URLs:', nouvelleUrl);

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Mettre à jour toutes les histoires de cette licence
      for (const tome of licence.tomes) {
        try {
          console.log(`🔄 Mise à jour tome: ${tome.titre} (ID: ${tome.id})`);
          
          // SOLUTION TEMPORAIRE : Stocker les URLs dans la description en JSON
          const urlsMultiples = {
            webnovel_fr: nouvelleUrl.webnovel_fr || '',
            webnovel_en: nouvelleUrl.webnovel_en || '',
            yume_arts_fr: nouvelleUrl.yume_arts_fr || '',
            yume_arts_en: nouvelleUrl.yume_arts_en || ''
          };

          // Nettoyer la description originale (enlever les URLs précédentes)
          let descriptionNettoyee = tome.description || '';
          if (descriptionNettoyee.includes('URLS_TEMP:')) {
            descriptionNettoyee = descriptionNettoyee.split('URLS_TEMP:')[0].trim();
          }

          // Ajouter les URLs en fin de description
          const descriptionAvecUrls = `${descriptionNettoyee}\n\nURLS_TEMP:${JSON.stringify(urlsMultiples)}`;

          // Préparer les données à envoyer
          const updateData = {
            titre: tome.titre,
            auteur: tome.auteur,
            description: descriptionAvecUrls, // Description modifiée avec URLs
            source: tome.source,
            url_source: nouvelleUrl.webnovel_fr || nouvelleUrl.webnovel_en || nouvelleUrl.yume_arts_fr || nouvelleUrl.yume_arts_en || tome.url_source, // URL principale
            image_couverture: tome.image_couverture
          };

          console.log('📤 Données envoyées:', updateData);

          const response = await fetch(`/api/histoire/${tome.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
          });

          console.log(`📡 Réponse API (${tome.id}):`, response.status, response.statusText);

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Erreur API pour ${tome.titre}:`, errorText);
            errors.push(`${tome.titre}: ${errorText}`);
            errorCount++;
          } else {
            const result = await response.json();
            console.log(`✅ Succès pour ${tome.titre}:`, result);
            successCount++;
          }

        } catch (tomeError) {
          console.error(`❌ Erreur réseau pour ${tome.titre}:`, tomeError);
          errors.push(`${tome.titre}: Erreur réseau`);
          errorCount++;
        }
      }

      // Afficher le résultat
      if (errorCount === 0) {
        alert(`✅ Toutes les URLs ont été mises à jour pour la licence "${licence.nom}" !\n\n📊 ${successCount} tome(s) mis à jour avec succès.\n\n⚠️ Note: URLs stockées temporairement en attendant la mise à jour Prisma.`);
        setNouvelleUrl({ webnovel_fr: '', webnovel_en: '', yume_arts_fr: '', yume_arts_en: '' });
        
        // Forcer un rechargement complet avec délai
        setTimeout(async () => {
          console.log('🔄 Rechargement forcé des données...');
          await chargerHistoires();
          console.log('✅ Données rechargées');
        }, 500);
        
      } else {
        const message = `⚠️ Sauvegarde partielle pour "${licence.nom}":\n\n✅ Réussis: ${successCount}\n❌ Échecs: ${errorCount}\n\nErreurs:\n${errors.join('\n')}`;
        alert(message);
        console.error('🚨 Erreurs de sauvegarde:', errors);
      }

    } catch (error) {
      console.error('💥 Erreur générale sauvegarde:', error);
      alert(`❌ Erreur générale lors de la sauvegarde:\n\n${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsSaving(false);
      console.log('🏁 Fin sauvegarde');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du gestionnaire de tomes...</p>
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
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg mb-6">
            <h2 className="font-semibold text-purple-800 mb-2">📚 Gestionnaire de Tomes & Licences</h2>
            <p className="text-sm text-purple-700">
              Gérez vos histoires regroupées par licence. Sur Webnovel et Yume-Arts, chaque langue 
              (français/anglais) a sa propre URL même pour la même licence.
            </p>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            🌍 Gestion Multi-Tomes & Multi-Langues
          </h1>

          {/* Bouton de diagnostic */}
          <div className="text-center mb-4">
            <button
              onClick={diagnosticUrls}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              🔍 Diagnostic URLs (voir console)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Liste des licences */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🏷️ Vos Licences</h2>
            
            <div className="space-y-4">
              {licences.map((licence, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    licenceSelectionnee === licence.nom
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setLicenceSelectionnee(licence.nom)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{licence.nom}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      licence.langue_principale === 'fr' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      🌍 {licence.langue_principale.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{licence.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      📖 {licence.tomes.length} tome(s)
                    </span>
                    
                    <div className="flex flex-wrap gap-1">
                      {licence.webnovel_url_fr && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                          📖 WN-FR
                        </span>
                      )}
                      {licence.webnovel_url_en && (
                        <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                          📖 WN-EN
                        </span>
                      )}
                      {licence.yume_arts_url_fr && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          🎨 YA-FR
                        </span>
                      )}
                      {licence.yume_arts_url_en && (
                        <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">
                          🎨 YA-EN
                        </span>
                      )}
                      
                      {/* Indicateur global si aucune URL */}
                      {!licence.webnovel_url_fr && !licence.webnovel_url_en && !licence.yume_arts_url_fr && !licence.yume_arts_url_en && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                          🔗 Non configuré
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Aperçu des tomes */}
                  <div className="space-y-1">
                    {licence.tomes.map((tome, tomeIndex) => (
                      <div key={tome.id} className="text-xs text-gray-500 flex justify-between">
                        <span>• {tome.titre.substring(0, 45)}...</span>
                        <span>{tome.chapitres?.length || 0} ch.</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Éditeur de licence */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {!licenceSelectionnee ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌍</div>
                <h2 className="text-2xl font-bold text-gray-600 mb-4">Sélectionnez une licence</h2>
                <p className="text-gray-500">
                  Choisissez une licence dans la liste de gauche pour gérer ses URLs multilingues
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {(() => {
                  const licence = licences.find(l => l.nom === licenceSelectionnee);
                  if (!licence) return null;

                  return (
                    <>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                          🏷️ {licence.nom}
                          <span className={`ml-3 text-sm px-3 py-1 rounded ${
                            licence.langue_principale === 'fr' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            🌍 Langue principale: {licence.langue_principale.toUpperCase()}
                          </span>
                        </h2>
                        <p className="text-gray-600 mb-4">{licence.description}</p>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-6">
                          <h3 className="font-semibold text-blue-800 mb-2">🌍 Gestion Multi-Langues :</h3>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• <strong>Webnovel FR</strong> : Version française sur Webnovel</li>
                            <li>• <strong>Webnovel EN</strong> : Version anglaise sur Webnovel</li>
                            <li>• <strong>Yume-Arts FR</strong> : Version française sur Yume-Arts</li>
                            <li>• <strong>Yume-Arts EN</strong> : Version anglaise sur Yume-Arts</li>
                            <li>• Chaque langue peut avoir sa propre URL de licence</li>
                          </ul>
                        </div>
                      </div>

                      {/* URLs actuelles */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">🔗 URLs actuelles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Webnovel */}
                          <div className="border rounded-lg p-3">
                            <h4 className="font-medium text-orange-700 mb-2">📖 Webnovel</h4>
                            
                            {licence.webnovel_url_fr ? (
                              <div className="mb-2">
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">🇫🇷 FR</span>
                                <a 
                                  href={licence.webnovel_url_fr} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 underline block mt-1 truncate"
                                >
                                  {licence.webnovel_url_fr}
                                </a>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 mb-2">🇫🇷 FR : Non configuré</div>
                            )}
                            
                            {licence.webnovel_url_en ? (
                              <div>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">🇬🇧 EN</span>
                                <a 
                                  href={licence.webnovel_url_en} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 underline block mt-1 truncate"
                                >
                                  {licence.webnovel_url_en}
                                </a>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500">🇬🇧 EN : Non configuré</div>
                            )}
                          </div>

                          {/* Yume-Arts */}
                          <div className="border rounded-lg p-3">
                            <h4 className="font-medium text-purple-700 mb-2">🎨 Yume-Arts</h4>
                            
                            {licence.yume_arts_url_fr ? (
                              <div className="mb-2">
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">🇫🇷 FR</span>
                                <a 
                                  href={licence.yume_arts_url_fr} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 underline block mt-1 truncate"
                                >
                                  {licence.yume_arts_url_fr}
                                </a>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 mb-2">🇫🇷 FR : Non configuré</div>
                            )}
                            
                            {licence.yume_arts_url_en ? (
                              <div>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">🇬🇧 EN</span>
                                <a 
                                  href={licence.yume_arts_url_en} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 underline block mt-1 truncate"
                                >
                                  {licence.yume_arts_url_en}
                                </a>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500">🇬🇧 EN : Non configuré</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Nouvelles URLs */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">✏️ Modifier les URLs</h3>
                        <div className="space-y-4">
                          
                          {/* Webnovel URLs */}
                          <div className="border rounded-lg p-4">
                            <h4 className="font-medium text-orange-700 mb-3">📖 Webnovel</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  🇫🇷 Version Française
                                </label>
                                <input
                                  type="url"
                                  value={nouvelleUrl.webnovel_fr}
                                  onChange={(e) => setNouvelleUrl(prev => ({ ...prev, webnovel_fr: e.target.value }))}
                                  placeholder="https://fr.webnovel.com/book/..."
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  🇬🇧 Version Anglaise
                                </label>
                                <input
                                  type="url"
                                  value={nouvelleUrl.webnovel_en}
                                  onChange={(e) => setNouvelleUrl(prev => ({ ...prev, webnovel_en: e.target.value }))}
                                  placeholder="https://www.webnovel.com/book/..."
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 text-sm"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Yume-Arts URLs */}
                          <div className="border rounded-lg p-4">
                            <h4 className="font-medium text-purple-700 mb-3">🎨 Yume-Arts</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  🇫🇷 Version Française
                                </label>
                                <input
                                  type="url"
                                  value={nouvelleUrl.yume_arts_fr}
                                  onChange={(e) => setNouvelleUrl(prev => ({ ...prev, yume_arts_fr: e.target.value }))}
                                  placeholder="https://yume-arts.com/fr/novel/..."
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  🇬🇧 Version Anglaise
                                </label>
                                <input
                                  type="url"
                                  value={nouvelleUrl.yume_arts_en}
                                  onChange={(e) => setNouvelleUrl(prev => ({ ...prev, yume_arts_en: e.target.value }))}
                                  placeholder="https://yume-arts.com/en/novel/..."
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-4">
                        <button
                          onClick={() => sauvegarderUrlsLicence(licence)}
                          disabled={isSaving || (!nouvelleUrl.webnovel_fr && !nouvelleUrl.webnovel_en && !nouvelleUrl.yume_arts_fr && !nouvelleUrl.yume_arts_en)}
                          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex-1"
                        >
                          {isSaving ? '💾 Sauvegarde...' : '✅ Appliquer à tous les tomes'}
                        </button>
                        
                        <button
                          onClick={() => {
                            setLicenceSelectionnee('');
                            setNouvelleUrl({ webnovel_fr: '', webnovel_en: '', yume_arts_fr: '', yume_arts_en: '' });
                          }}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold"
                        >
                          ❌ Annuler
                        </button>
                      </div>

                      {/* Liste des tomes affectés */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">📚 Tomes qui seront mis à jour :</h3>
                        <div className="space-y-2">
                          {licence.tomes.map((tome, index) => (
                            <div key={tome.id} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">
                                {index + 1}. {tome.titre.substring(0, 50)}...
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-500">
                                  {tome.chapitres?.length || 0} ch.
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  tome.titre.toLowerCase().includes('hero') || tome.titre.toLowerCase().includes('act')
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {tome.titre.toLowerCase().includes('hero') || tome.titre.toLowerCase().includes('act') ? '🇬🇧' : '🇫🇷'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center space-x-6">
          <a href="/admin/editeur" className="text-blue-500 hover:text-blue-700 underline">
            ✏️ Éditeur individuel
          </a>
          <a href="/admin/centre-controle" className="text-purple-500 hover:text-purple-700 underline">
            🎛️ Centre de contrôle
          </a>
          <a href="/admin" className="text-gray-500 hover:text-gray-700 underline">
            ← Retour admin
          </a>
        </div>
      </div>
    </div>
  );
} 