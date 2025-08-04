'use client';

import { useState, useEffect } from 'react';

interface PointsUtilisateur {
  points_totaux: number;
  points_actuels: number;
  niveau: number;
  titre_actuel?: string;
}

interface HistoriquePoint {
  id: number;
  points_gagnes: number;
  date_gain: string;
  action: {
    nom: string;
    description: string;
  };
}

interface TitreNiveau {
  nom_titre: string;
  description?: string;
  icone?: string;
  couleur_hexa?: string;
}

interface RewardsData {
  points: PointsUtilisateur;
  niveau_calcule: number;
  points_pour_prochain_niveau: number;
  titre_niveau?: TitreNiveau;
  historique_recent: HistoriquePoint[];
}

interface RewardsWidgetProps {
  utilisateurId?: number;
  className?: string;
}

export default function RewardsWidget({ utilisateurId = 1, className = '' }: RewardsWidgetProps) {
  const [rewardsData, setRewardsData] = useState<RewardsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    chargerRewards();
  }, [utilisateurId]);

  const chargerRewards = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/rewards/points?utilisateur_id=${utilisateurId}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRewardsData(result.data);
        }
      }
    } catch (error) {
      console.error('Erreur chargement rewards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getProgressPercentage = () => {
    if (!rewardsData) return 0;
    const pointsActuelsNiveau = rewardsData.points.points_totaux % 1000;
    return (pointsActuelsNiveau / 1000) * 100;
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-2 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!rewardsData) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🎁</div>
          <p>Système de récompenses non disponible</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-lg shadow p-6 ${className}`}>
        {/* En-tête */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">🎁 Mes Récompenses</h3>
          <button
            onClick={() => setShowModal(true)}
            className="text-white/80 hover:text-white text-sm"
          >
            Voir tout →
          </button>
        </div>

        {/* Niveau et titre */}
        <div className="flex items-center mb-4">
          <div className="bg-white/20 rounded-full p-3 mr-3">
            <span className="text-2xl">
              {rewardsData.titre_niveau?.icone || '⭐'}
            </span>
          </div>
          <div>
            <div className="font-bold text-xl">
              Niveau {rewardsData.niveau_calcule}
            </div>
            <div className="text-white/80 text-sm">
              {rewardsData.titre_niveau?.nom_titre || 'Lecteur Débutant'}
            </div>
          </div>
        </div>

        {/* Points */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80 text-sm">
              {formatNumber(rewardsData.points.points_totaux)} points total
            </span>
            <span className="text-white/80 text-sm">
              {rewardsData.points_pour_prochain_niveau} pour niveau suivant
            </span>
          </div>
          
          {/* Barre de progression */}
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Dernière récompense */}
        {rewardsData.historique_recent.length > 0 && (
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-sm text-white/80 mb-1">Dernière récompense</div>
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {rewardsData.historique_recent[0].action.nom}
              </span>
              <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                +{rewardsData.historique_recent[0].points_gagnes}
              </span>
            </div>
          </div>
        )}

        {/* Bouton wiki */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <a
            href="/wiki"
            className="block text-center bg-white/20 hover:bg-white/30 rounded-lg py-2 px-4 transition-colors"
          >
            📚 Explorer le Wiki
          </a>
        </div>
      </div>

      {/* Modal détaillé */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* En-tête */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  🎁 Système de Récompenses
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Stats détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {formatNumber(rewardsData.points.points_totaux)}
                  </div>
                  <div className="text-blue-100 text-sm">Points Total</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {rewardsData.niveau_calcule}
                  </div>
                  <div className="text-green-100 text-sm">Niveau Actuel</div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {formatNumber(rewardsData.points.points_actuels)}
                  </div>
                  <div className="text-purple-100 text-sm">Points Actuels</div>
                </div>
              </div>

              {/* Titre et progression */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-3">
                  <span className="text-3xl mr-3">
                    {rewardsData.titre_niveau?.icone || '⭐'}
                  </span>
                  <div>
                    <div className="font-bold text-lg">
                      {rewardsData.titre_niveau?.nom_titre || 'Lecteur Débutant'}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {rewardsData.titre_niveau?.description || 'Continuez à lire pour débloquer de nouveaux titres !'}
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-4 transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm text-gray-600 mt-2">
                  {rewardsData.points_pour_prochain_niveau} points pour le niveau suivant
                </div>
              </div>

              {/* Historique récent */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Historique Récent</h3>
                <div className="space-y-3">
                  {rewardsData.historique_recent.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.action.nom}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(item.date_gain).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                        +{item.points_gagnes}
                      </div>
                    </div>
                  ))}
                  
                  {rewardsData.historique_recent.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📝</div>
                      <p>Aucune récompense pour le moment</p>
                      <p className="text-sm">Commencez à lire pour gagner des points !</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex gap-4">
                <a
                  href="/wiki"
                  className="flex-1 bg-blue-500 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  📚 Explorer le Wiki
                </a>
                <a
                  href="/histoires"
                  className="flex-1 bg-green-500 text-white text-center py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                >
                  📖 Continuer la Lecture
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}