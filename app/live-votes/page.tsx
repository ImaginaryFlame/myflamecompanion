'use client';

import { useState, useEffect } from 'react';

interface Poll {
  id: number;
  question: string;
  options: string[];
  active: boolean;
  votes: { [key: number]: number };
  createdAt: string;
}

export default function LiveVotesPage() {
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Admin
  const [isAdmin] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '']);

  useEffect(() => {
    const loadCurrentPoll = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/votes');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setCurrentPoll(result.data.currentPoll);
          }
        }
      } catch (error) {
        console.error('Erreur chargement sondage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentPoll();
    
    // Polling toutes les 3 secondes
    const interval = setInterval(loadCurrentPoll, 3000);
    return () => clearInterval(interval);
  }, []);

  const createPoll = async () => {
    if (!newQuestion.trim() || newOptions.some(opt => !opt.trim())) {
      alert('❌ Veuillez remplir la question et toutes les options');
      return;
    }

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_poll',
          question: newQuestion,
          options: newOptions.filter(opt => opt.trim())
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCurrentPoll(result.data);
          setNewQuestion('');
          setNewOptions(['', '']);
          setHasVoted(false);
          alert('✅ Sondage créé !');
        }
      }
    } catch (error) {
      console.error('Erreur création sondage:', error);
      alert('❌ Erreur lors de la création');
    }
  };

  const submitVote = async () => {
    if (!username.trim()) {
      alert('❌ Veuillez entrer votre nom');
      return;
    }

    if (selectedOption === null) {
      alert('❌ Veuillez sélectionner une option');
      return;
    }

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'vote',
          username: username,
          optionIndex: selectedOption
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setHasVoted(true);
          alert('✅ Vote enregistré !');
        }
      }
    } catch (error) {
      console.error('Erreur vote:', error);
      alert('❌ Erreur lors du vote');
    }
  };

  const closePoll = async () => {
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close_poll' })
      });

      if (response.ok) {
        alert('✅ Sondage fermé !');
      }
    } catch (error) {
      console.error('Erreur fermeture sondage:', error);
    }
  };

  const getTotalVotes = () => {
    if (!currentPoll) return 0;
    return Object.values(currentPoll.votes).reduce((sum: number, count: number) => sum + count, 0);
  };

  const getPercentage = (optionIndex: number) => {
    if (!currentPoll) return 0;
    const total = getTotalVotes();
    if (total === 0) return 0;
    return Math.round((currentPoll.votes[optionIndex] || 0) / total * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des votes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              🗳️ Votes Narratifs en Live
            </h1>
            <p className="text-gray-600">
              Participez aux décisions narratives en temps réel pendant les lives !
            </p>
            
            {currentPoll && (
              <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
                <span className={`px-3 py-1 rounded-full ${
                  currentPoll.active 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {currentPoll.active ? '🔴 LIVE - Sondage Actif' : '⏹️ Sondage Terminé'}
                </span>
                <span className="text-gray-500">
                  👥 {getTotalVotes()} vote(s)
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sondage actuel */}
          <div className="lg:col-span-2">
            {currentPoll ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  📊 Sondage en Cours
                </h2>
                
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">
                    {currentPoll.question}
                  </h3>
                  <p className="text-sm text-purple-600">
                    Créé le {new Date(currentPoll.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>

                {/* Options de vote */}
                <div className="space-y-4">
                  {currentPoll.options.map((option, index) => {
                    const votes = currentPoll.votes[index] || 0;
                    const percentage = getPercentage(index);
                    
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="vote-option"
                              value={index}
                              checked={selectedOption === index}
                              onChange={() => setSelectedOption(index)}
                              disabled={!currentPoll.active || hasVoted}
                              className="w-4 h-4 text-purple-600"
                            />
                            <span className="font-medium">{option}</span>
                          </label>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-purple-600">
                              {percentage}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {votes} vote{votes !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        
                        {/* Barre de progression */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Interface de vote */}
                {currentPoll.active && !hasVoted && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        placeholder="Votre nom..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={submitVote}
                        disabled={selectedOption === null || !username.trim()}
                        className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400"
                      >
                        🗳️ Voter
                      </button>
                    </div>
                  </div>
                )}

                {hasVoted && (
                  <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-center">
                    ✅ Merci pour votre vote ! Les résultats se mettent à jour en temps réel.
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-6xl mb-4">🗳️</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Aucun sondage actif
                </h2>
                <p className="text-gray-600">
                  Les sondages apparaîtront ici pendant les lives !
                </p>
              </div>
            )}
          </div>

          {/* Panel admin */}
          <div className="space-y-6">
            {isAdmin && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  ⚙️ Administration
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question du sondage
                    </label>
                    <textarea
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Que doit faire le héros maintenant ?"
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Options
                    </label>
                    {newOptions.map((option, index) => (
                      <div key={index} className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const updatedOptions = [...newOptions];
                            updatedOptions[index] = e.target.value;
                            setNewOptions(updatedOptions);
                          }}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                        />
                        {newOptions.length > 2 && (
                          <button
                            onClick={() => setNewOptions(newOptions.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {newOptions.length < 4 && (
                      <button
                        onClick={() => setNewOptions([...newOptions, ''])}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        ➕ Ajouter une option
                      </button>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={createPoll}
                      className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
                    >
                      🚀 Lancer Sondage
                    </button>
                    
                    {currentPoll && currentPoll.active && (
                      <button
                        onClick={closePoll}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        ⏹️ Fermer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center space-x-6">
          <a href="/chaines" className="text-purple-500 hover:text-purple-700 underline">
            📺 Retour aux Chaînes
          </a>
          <a href="/dashboard" className="text-blue-500 hover:text-blue-700 underline">
            🏠 Dashboard
          </a>
        </div>
      </div>
    </div>
  );
} 