'use client';

import { useState, useEffect } from 'react';

interface Histoire {
  id: number;
  titre: string;
  auteur: string;
}

export default function AdminWikiPage() {
  const [histoires, setHistoires] = useState<Histoire[]>([]);
  const [selectedHistoire, setSelectedHistoire] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contentType, setContentType] = useState<string>('personnage');

  const [formData, setFormData] = useState({
    nom: '',
    titre: '',
    description: '',
    niveau_deverrouillage: 1,
    image_url: '',
    // Champs spécifiques par type
    apparence: '',
    personnalite: '',
    background: '',
    histoire_lieu: '',
    proprietes: '',
    histoire_objet: '',
    contenu: '',
    type: 'trivia'
  });

  useEffect(() => {
    chargerHistoires();
  }, []);

  const chargerHistoires = async () => {
    try {
      const response = await fetch('/api/histoire');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setHistoires(result.data);
        }
      }
    } catch (error) {
      console.error('Erreur chargement histoires:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHistoire) {
      alert('Veuillez sélectionner une histoire');
      return;
    }

    try {
      setIsLoading(true);
      
      const dataToSend = {
        histoire_id: selectedHistoire,
        type_contenu: contentType,
        ...formData
      };

      const response = await fetch('/api/wiki/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert(`${contentType} créé avec succès !`);
          setShowCreateModal(false);
          resetForm();
        } else {
          alert(`Erreur : ${result.error}`);
        }
      } else {
        alert('Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur création contenu:', error);
      alert('Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      titre: '',
      description: '',
      niveau_deverrouillage: 1,
      image_url: '',
      apparence: '',
      personnalite: '',
      background: '',
      histoire_lieu: '',
      proprietes: '',
      histoire_objet: '',
      contenu: '',
      type: 'trivia'
    });
  };

  const contentTypes = [
    { value: 'personnage', label: 'Personnage', icon: '👥' },
    { value: 'lieu', label: 'Lieu', icon: '🏰' },
    { value: 'objet', label: 'Objet', icon: '⚔️' },
    { value: 'anecdote', label: 'Anecdote', icon: '📖' },
    { value: 'illustration', label: 'Illustration', icon: '🎨' }
  ];

  const renderSpecificFields = () => {
    switch (contentType) {
      case 'personnage':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apparence
              </label>
              <textarea
                value={formData.apparence}
                onChange={(e) => setFormData({ ...formData, apparence: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Description physique du personnage..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personnalité
              </label>
              <textarea
                value={formData.personnalite}
                onChange={(e) => setFormData({ ...formData, personnalite: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Traits de personnalité, caractère..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Histoire / Background
              </label>
              <textarea
                value={formData.background}
                onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Histoire du personnage, origines..."
              />
            </div>
          </>
        );

      case 'lieu':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Histoire du lieu
            </label>
            <textarea
              value={formData.histoire_lieu}
              onChange={(e) => setFormData({ ...formData, histoire_lieu: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Histoire et importance du lieu dans l'univers..."
            />
          </div>
        );

      case 'objet':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Propriétés
              </label>
              <textarea
                value={formData.proprietes}
                onChange={(e) => setFormData({ ...formData, proprietes: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Propriétés magiques, utilisation, pouvoirs..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Histoire de l'objet
              </label>
              <textarea
                value={formData.histoire_objet}
                onChange={(e) => setFormData({ ...formData, histoire_objet: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Origine, création, importance dans l'histoire..."
              />
            </div>
          </>
        );

      case 'anecdote':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'anecdote
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="trivia">Trivia</option>
                <option value="creation">Création</option>
                <option value="reference">Référence</option>
                <option value="easter_egg">Easter Egg</option>
                <option value="secret">Secret</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenu de l'anecdote
              </label>
              <textarea
                value={formData.contenu}
                onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Détails de l'anecdote..."
                required
              />
            </div>
          </>
        );

      case 'illustration':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'illustration
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="concept_art">Concept Art</option>
              <option value="scene">Scène</option>
              <option value="personnage">Personnage</option>
              <option value="lieu">Lieu</option>
              <option value="fan_art">Fan Art</option>
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📚 Administration Wiki
          </h1>
          <p className="text-gray-600">
            Gérez le contenu wiki de vos histoires - personnages, lieux, objets, anecdotes et illustrations
          </p>
        </div>

        {/* Actions principales */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              ➕ Ajouter du contenu
            </button>
            
            <a
              href="/wiki"
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              👁️ Voir le Wiki
            </a>
            
            <a
              href="/admin/dashboard"
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              📊 Retour Dashboard
            </a>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {contentTypes.map((type) => (
            <div key={type.value} className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-3xl mb-2">{type.icon}</div>
              <div className="font-semibold text-gray-900">{type.label}s</div>
              <div className="text-sm text-gray-600">Gestion disponible</div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            💡 Comment fonctionne le système de récompenses Wiki ?
          </h3>
          <div className="text-blue-800 space-y-2 text-sm">
            <p>• <strong>Niveaux de déverrouillage :</strong> Chaque élément se débloque après avoir lu un certain nombre de chapitres</p>
            <p>• <strong>Points automatiques :</strong> Les lecteurs gagnent des points en lisant et débloquent du contenu exclusif</p>
            <p>• <strong>Motivation :</strong> Plus ils lisent, plus ils découvrent de secrets sur votre univers</p>
            <p>• <strong>Engagement :</strong> Le wiki devient un véritable trésor à explorer au fil de la lecture</p>
          </div>
        </div>
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Ajouter du contenu wiki
                </h2>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Sélection de l'histoire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Histoire *
                  </label>
                  <select
                    value={selectedHistoire || ''}
                    onChange={(e) => setSelectedHistoire(parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionnez une histoire</option>
                    {histoires.map((histoire) => (
                      <option key={histoire.id} value={histoire.id}>
                        {histoire.titre} - {histoire.auteur}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type de contenu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de contenu *
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {contentTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setContentType(type.value)}
                        className={`p-3 rounded-lg border-2 transition-colors text-center ${
                          contentType === type.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="text-xs font-medium">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nom/Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {contentType === 'anecdote' || contentType === 'illustration' ? 'Titre' : 'Nom'} *
                  </label>
                  <input
                    type="text"
                    value={contentType === 'anecdote' || contentType === 'illustration' ? formData.titre : formData.nom}
                    onChange={(e) => {
                      if (contentType === 'anecdote' || contentType === 'illustration') {
                        setFormData({ ...formData, titre: e.target.value });
                      } else {
                        setFormData({ ...formData, nom: e.target.value });
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Description */}
                {contentType !== 'anecdote' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Description générale..."
                    />
                  </div>
                )}

                {/* Niveau de déverrouillage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau de déverrouillage (nombre de chapitres) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.niveau_deverrouillage}
                    onChange={(e) => setFormData({ ...formData, niveau_deverrouillage: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Les lecteurs devront avoir lu ce nombre de chapitres pour débloquer ce contenu
                  </p>
                </div>

                {/* URL Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de l'image {contentType === 'illustration' && '*'}
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://exemple.com/image.jpg"
                    required={contentType === 'illustration'}
                  />
                </div>

                {/* Champs spécifiques */}
                {renderSpecificFields()}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium"
                >
                  {isLoading ? 'Création...' : 'Créer le contenu'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}