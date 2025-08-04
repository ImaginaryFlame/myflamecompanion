'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface WikiContent {
  personnages?: WikiPersonnage[];
  lieux?: WikiLieu[];
  objets?: WikiObjet[];
  anecdotes?: WikiAnecdote[];
  illustrations?: WikiIllustration[];
}

interface WikiPersonnage {
  id: number;
  nom: string;
  description?: string;
  apparence?: string;
  personnalite?: string;
  background?: string;
  image_url?: string;
  niveau_deverrouillage: number;
  debloque?: boolean;
  date_debloquage?: string;
}

interface WikiLieu {
  id: number;
  nom: string;
  description?: string;
  histoire_lieu?: string;
  image_url?: string;
  niveau_deverrouillage: number;
  debloque?: boolean;
  date_debloquage?: string;
}

interface WikiObjet {
  id: number;
  nom: string;
  description?: string;
  proprietes?: string;
  histoire_objet?: string;
  image_url?: string;
  niveau_deverrouillage: number;
  debloque?: boolean;
  date_debloquage?: string;
}

interface WikiAnecdote {
  id: number;
  titre: string;
  contenu: string;
  type: string;
  image_url?: string;
  niveau_deverrouillage: number;
  debloque?: boolean;
  date_debloquage?: string;
}

interface WikiIllustration {
  id: number;
  titre: string;
  description?: string;
  image_url: string;
  type: string;
  niveau_deverrouillage: number;
  debloque?: boolean;
  date_debloquage?: string;
}

interface WikiStats {
  total_personnages: number;
  total_lieux: number;
  total_objets: number;
  total_anecdotes: number;
  total_illustrations: number;
  total_debloque?: number;
  total_disponible?: number;
  pourcentage_debloque?: number;
}

export default function WikiPage() {
  const params = useParams();
  const histoireId = params.histoireId as string;
  const [wikiContent, setWikiContent] = useState<WikiContent>({});
  const [stats, setStats] = useState<WikiStats>({
    total_personnages: 0,
    total_lieux: 0,
    total_objets: 0,
    total_anecdotes: 0,
    total_illustrations: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('personnages');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // ID utilisateur factice pour l'exemple - à remplacer par l'authentification réelle
  const utilisateurId = 1;

  useEffect(() => {
    chargerWikiContent();
  }, [histoireId]);

  const chargerWikiContent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/wiki/content?histoire_id=${histoireId}&utilisateur_id=${utilisateurId}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setWikiContent(result.data.wiki);
          setStats(result.data.stats);
        }
      }
    } catch (error) {
      console.error('Erreur chargement wiki:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ouvrirModal = (item: any) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const fermerModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'personnages': return '👥';
      case 'lieux': return '🏰';
      case 'objets': return '⚔️';
      case 'anecdotes': return '📖';
      case 'illustrations': return '🎨';
      default: return '📋';
    }
  };

  const renderContentGrid = (content: any[], type: string) => {
    if (!content || content.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">{getTabIcon(type)}</div>
          <p>Aucun contenu disponible pour cette catégorie</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {content.map((item, index) => (
          <div
            key={item.id}
            className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer ${
              !item.debloque ? 'opacity-60 filter blur-sm hover:blur-none' : ''
            }`}
            onClick={() => item.debloque && ouvrirModal(item)}
          >
            {/* Image */}
            <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
              {item.image_url && item.debloque ? (
                <img
                  src={item.image_url}
                  alt={item.nom || item.titre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-6xl text-gray-400">
                    {item.debloque ? getTabIcon(type) : '🔒'}
                  </div>
                </div>
              )}
              
              {/* Badge de niveau */}
              <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                Niv. {item.niveau_deverrouillage}
              </div>
              
              {/* Badge débloqué */}
              {item.debloque && (
                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  ✅ Débloqué
                </div>
              )}
            </div>

            {/* Contenu */}
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                {item.debloque ? (item.nom || item.titre) : '???'}
              </h3>
              
              {item.debloque ? (
                <p className="text-gray-600 text-sm line-clamp-3">
                  {item.description || item.contenu || 'Pas de description disponible'}
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-500 text-sm">
                    🔒 Contenu verrouillé
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    Lisez {item.niveau_deverrouillage} chapitre(s) pour débloquer
                  </p>
                </div>
              )}
              
              {item.date_debloquage && (
                <p className="text-xs text-green-600 mt-2">
                  Débloqué le {new Date(item.date_debloquage).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du wiki...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'personnages', label: 'Personnages', content: wikiContent.personnages, count: stats.total_personnages },
    { key: 'lieux', label: 'Lieux', content: wikiContent.lieux, count: stats.total_lieux },
    { key: 'objets', label: 'Objets', content: wikiContent.objets, count: stats.total_objets },
    { key: 'anecdotes', label: 'Anecdotes', content: wikiContent.anecdotes, count: stats.total_anecdotes },
    { key: 'illustrations', label: 'Illustrations', content: wikiContent.illustrations, count: stats.total_illustrations }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📚 Wiki de l'Histoire
              </h1>
              <p className="text-gray-600 mt-1">
                Découvrez les secrets au fur et à mesure de votre lecture
              </p>
            </div>
            
            {/* Statistiques de progression */}
            {stats.total_disponible && (
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.pourcentage_debloque}%
                </div>
                <div className="text-sm text-gray-600">
                  {stats.total_debloque}/{stats.total_disponible} débloqué
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.pourcentage_debloque}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{getTabIcon(tab.key)}</span>
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tabs.map((tab) => (
          <div key={tab.key} className={activeTab === tab.key ? 'block' : 'hidden'}>
            {renderContentGrid(tab.content || [], tab.key)}
          </div>
        ))}
      </div>

      {/* Modal de détail */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* En-tête du modal */}
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedItem.nom || selectedItem.titre}
                </h2>
                <button
                  onClick={fermerModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Image */}
              {selectedItem.image_url && (
                <div className="mb-6">
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.nom || selectedItem.titre}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Contenu détaillé */}
              <div className="space-y-4">
                {selectedItem.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700">{selectedItem.description}</p>
                  </div>
                )}

                {selectedItem.apparence && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Apparence</h3>
                    <p className="text-gray-700">{selectedItem.apparence}</p>
                  </div>
                )}

                {selectedItem.personnalite && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Personnalité</h3>
                    <p className="text-gray-700">{selectedItem.personnalite}</p>
                  </div>
                )}

                {selectedItem.background && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Histoire</h3>
                    <p className="text-gray-700">{selectedItem.background}</p>
                  </div>
                )}

                {selectedItem.proprietes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Propriétés</h3>
                    <p className="text-gray-700">{selectedItem.proprietes}</p>
                  </div>
                )}

                {selectedItem.contenu && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Contenu</h3>
                    <p className="text-gray-700">{selectedItem.contenu}</p>
                  </div>
                )}

                {/* Anecdotes */}
                {selectedItem.anecdotes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Anecdotes</h3>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                      <p className="text-gray-700">{JSON.stringify(selectedItem.anecdotes)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Informations de débloquage */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Débloqué au chapitre {selectedItem.niveau_deverrouillage}</span>
                  {selectedItem.date_debloquage && (
                    <span>Débloqué le {new Date(selectedItem.date_debloquage).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}