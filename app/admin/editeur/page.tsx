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
  urls_multiples?: {
    wattpad?: string;
    webnovel_fr?: string;
    webnovel_en?: string;
    yume_arts_fr?: string;
    yume_arts_en?: string;
    autres?: string[];
  };
}

export default function EditeurHistoiresPage() {
  const [histoires, setHistoires] = useState<Histoire[]>([]);
  const [histoireSelectionnee, setHistoireSelectionnee] = useState<Histoire | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  const sauvegarderHistoire = async () => {
    if (!histoireSelectionnee) return;

    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/histoire/${histoireSelectionnee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titre: histoireSelectionnee.titre,
          auteur: histoireSelectionnee.auteur,
          description: histoireSelectionnee.description,
          url_source: histoireSelectionnee.url_source,
          image_couverture: histoireSelectionnee.image_couverture,
          urls_multiples: histoireSelectionnee.urls_multiples
        })
      });

      if (response.ok) {
        alert('✅ Histoire sauvegardée avec succès !');
        chargerHistoires();
      } else {
        alert('❌ Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('❌ Erreur réseau');
    } finally {
      setIsSaving(false);
    }
  };

  const ajouterUrlSite = (site: string, url: string) => {
    if (!histoireSelectionnee) return;

    setHistoireSelectionnee({
      ...histoireSelectionnee,
      urls_multiples: {
        ...histoireSelectionnee.urls_multiples,
        [site]: url
      }
    });
  };

  const supprimerUrlSite = (site: string) => {
    if (!histoireSelectionnee) return;

    const nouvelles_urls = { ...histoireSelectionnee.urls_multiples };
    delete nouvelles_urls[site as keyof typeof nouvelles_urls];

    setHistoireSelectionnee({
      ...histoireSelectionnee,
      urls_multiples: nouvelles_urls
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de l'éditeur...</p>
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
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h2 className="font-semibold text-blue-800 mb-2">✏️ Éditeur d'Histoires</h2>
            <p className="text-sm text-blue-700">
              Modifiez vos histoires et ajoutez des URLs de sites multiples avec support multilingue 
              (Wattpad, Webnovel FR/EN, Yume-Arts FR/EN, etc.).
            </p>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            🌍 Éditeur Multi-Sites & Multi-Langues
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Liste des histoires */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📚 Vos Histoires</h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {histoires.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  <p>Aucune histoire à éditer</p>
                  <a 
                    href="/admin/scraping" 
                    className="text-blue-500 hover:text-blue-700 underline mt-2 inline-block"
                  >
                    🚀 Scraper des histoires
                  </a>
                </div>
              ) : (
                histoires.map((histoire) => (
                  <div 
                    key={histoire.id} 
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      histoireSelectionnee?.id === histoire.id 
                        ? 'bg-blue-100 border-2 border-blue-500' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setHistoireSelectionnee(histoire)}
                  >
                    <h3 className="font-medium text-gray-800 text-sm line-clamp-2">
                      {histoire.titre}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {histoire.auteur} • {histoire.chapitres?.length || 0} chapitres
                    </p>
                    <div className="flex items-center mt-2 text-xs space-x-1">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {histoire.source}
                      </span>
                      {/* Indicateurs des URLs configurées */}
                      {histoire.urls_multiples?.wattpad && (
                        <span className="bg-green-100 text-green-800 px-1 py-1 rounded">📱</span>
                      )}
                      {(histoire.urls_multiples?.webnovel_fr || histoire.urls_multiples?.webnovel_en) && (
                        <span className="bg-orange-100 text-orange-800 px-1 py-1 rounded">📖</span>
                      )}
                      {(histoire.urls_multiples?.yume_arts_fr || histoire.urls_multiples?.yume_arts_en) && (
                        <span className="bg-purple-100 text-purple-800 px-1 py-1 rounded">🎨</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Éditeur principal */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            {!histoireSelectionnee ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-2xl font-bold text-gray-600 mb-4">Sélectionnez une histoire</h2>
                <p className="text-gray-500">
                  Choisissez une histoire dans la liste de gauche pour commencer l'édition
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Informations de base */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    📖 Informations de base
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📚 Titre
                      </label>
                      <input
                        type="text"
                        value={histoireSelectionnee.titre}
                        onChange={(e) => setHistoireSelectionnee({
                          ...histoireSelectionnee,
                          titre: e.target.value
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ✍️ Auteur
                      </label>
                      <input
                        type="text"
                        value={histoireSelectionnee.auteur}
                        onChange={(e) => setHistoireSelectionnee({
                          ...histoireSelectionnee,
                          auteur: e.target.value
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📝 Description
                    </label>
                    <textarea
                      value={histoireSelectionnee.description || ''}
                      onChange={(e) => setHistoireSelectionnee({
                        ...histoireSelectionnee,
                        description: e.target.value
                      })}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🖼️ Image de couverture (URL)
                    </label>
                    <input
                      type="url"
                      value={histoireSelectionnee.image_couverture || ''}
                      onChange={(e) => setHistoireSelectionnee({
                        ...histoireSelectionnee,
                        image_couverture: e.target.value
                      })}
                      placeholder="https://exemple.com/image.jpg"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* URLs multiples */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    🌐 URLs Multi-Sites & Multi-Langues
                  </h2>
                  
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">🌍 Support Multilingue :</h3>
                    <p className="text-sm text-yellow-700">
                      Webnovel et Yume-Arts ont des URLs différentes pour chaque langue. 
                      Vous pouvez maintenant configurer les versions FR et EN séparément !
                    </p>
                  </div>

                  <div className="space-y-6">
                    
                    {/* URL Wattpad */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-800 mb-3">📱 Wattpad</h3>
                      <div className="flex space-x-2">
                        <input
                          type="url"
                          value={histoireSelectionnee.urls_multiples?.wattpad || histoireSelectionnee.url_source || ''}
                          onChange={(e) => ajouterUrlSite('wattpad', e.target.value)}
                          placeholder="https://www.wattpad.com/story/..."
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        {histoireSelectionnee.urls_multiples?.wattpad && (
                          <button
                            onClick={() => supprimerUrlSite('wattpad')}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>

                    {/* URLs Webnovel */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-800 mb-3">📖 Webnovel</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            🇫🇷 Version Française
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="url"
                              value={histoireSelectionnee.urls_multiples?.webnovel_fr || ''}
                              onChange={(e) => ajouterUrlSite('webnovel_fr', e.target.value)}
                              placeholder="https://fr.webnovel.com/book/..."
                              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                            {histoireSelectionnee.urls_multiples?.webnovel_fr && (
                              <button
                                onClick={() => supprimerUrlSite('webnovel_fr')}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            🇬🇧 Version Anglaise
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="url"
                              value={histoireSelectionnee.urls_multiples?.webnovel_en || ''}
                              onChange={(e) => ajouterUrlSite('webnovel_en', e.target.value)}
                              placeholder="https://www.webnovel.com/book/..."
                              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                            {histoireSelectionnee.urls_multiples?.webnovel_en && (
                              <button
                                onClick={() => supprimerUrlSite('webnovel_en')}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* URLs Yume-Arts */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-800 mb-3">🎨 Yume-Arts</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            🇫🇷 Version Française
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="url"
                              value={histoireSelectionnee.urls_multiples?.yume_arts_fr || ''}
                              onChange={(e) => ajouterUrlSite('yume_arts_fr', e.target.value)}
                              placeholder="https://yume-arts.com/fr/novel/..."
                              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                            {histoireSelectionnee.urls_multiples?.yume_arts_fr && (
                              <button
                                onClick={() => supprimerUrlSite('yume_arts_fr')}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            🇬🇧 Version Anglaise
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="url"
                              value={histoireSelectionnee.urls_multiples?.yume_arts_en || ''}
                              onChange={(e) => ajouterUrlSite('yume_arts_en', e.target.value)}
                              placeholder="https://yume-arts.com/en/novel/..."
                              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                            {histoireSelectionnee.urls_multiples?.yume_arts_en && (
                              <button
                                onClick={() => supprimerUrlSite('yume_arts_en')}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Autres URLs */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-800 mb-3">🌍 Autres sites</h3>
                      <input
                        type="url"
                        placeholder="https://autre-site.com/histoire/..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Ajoutez d'autres sites où votre histoire est publiée
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-4">
                  <button
                    onClick={sauvegarderHistoire}
                    disabled={isSaving}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex-1"
                  >
                    {isSaving ? '💾 Sauvegarde...' : '✅ Sauvegarder les modifications'}
                  </button>
                  
                  <button
                    onClick={() => setHistoireSelectionnee(null)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    ❌ Annuler
                  </button>
                </div>

                {/* Statistiques */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">📊 Statistiques :</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                      <strong>Chapitres :</strong> {histoireSelectionnee.chapitres?.length || 0}
                    </div>
                    <div>
                      <strong>ID :</strong> {histoireSelectionnee.id}
                    </div>
                    <div>
                      <strong>Source principale :</strong> {histoireSelectionnee.source}
                    </div>
                    <div>
                      <strong>Sites configurés :</strong> {
                        Object.keys(histoireSelectionnee.urls_multiples || {}).filter(key => 
                          histoireSelectionnee.urls_multiples?.[key as keyof typeof histoireSelectionnee.urls_multiples]
                        ).length + 1
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center space-x-6">
          <a
            href="/admin/gestionnaire-tomes"
            className="text-purple-500 hover:text-purple-700 underline"
          >
            🏛️ Gestionnaire de tomes
          </a>
          <a
            href="/admin/scraping"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            🧠 Scraper des histoires
          </a>
          <a
            href="/admin/centre-controle"
            className="text-gray-500 hover:text-gray-700 underline"
          >
            🎛️ Centre de contrôle
          </a>
        </div>
      </div>
    </div>
  );
} 