'use client';

import { useState } from 'react';

export default function TestAPIsPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tests individuels
  const [youtubeChannelId, setYoutubeChannelId] = useState('UCbVWhV1QQHy-iur65xP_KIA');
  const [twitchUsername, setTwitchUsername] = useState('imaginaryflame');

  const testYouTubeAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/youtube/channel?id=${youtubeChannelId}`);
      const data = await response.json();
      setResults({ type: 'YouTube Channel', data });
    } catch (err) {
      setError('Erreur test YouTube API');
    } finally {
      setLoading(false);
    }
  };

  const testTwitchAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/twitch/channel?username=${twitchUsername}`);
      const data = await response.json();
      setResults({ type: 'Twitch Channel', data });
    } catch (err) {
      setError('Erreur test Twitch API');
    } finally {
      setLoading(false);
    }
  };

  const testYouTubeVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/youtube/videos?channelId=${youtubeChannelId}&maxResults=5`);
      const data = await response.json();
      setResults({ type: 'YouTube Videos', data });
    } catch (err) {
      setError('Erreur test YouTube Videos API');
    } finally {
      setLoading(false);
    }
  };

  const testTwitchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/twitch/videos?username=${twitchUsername}&maxResults=5`);
      const data = await response.json();
      setResults({ type: 'Twitch Videos (VODs)', data });
    } catch (err) {
      setError('Erreur test Twitch Videos API');
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/chaines/videos?limit=10');
      const data = await response.json();
      setResults({ type: 'Database Videos', data });
    } catch (err) {
      setError('Erreur récupération vidéos BDD');
    } finally {
      setLoading(false);
    }
  };

  const testEnvironment = async () => {
    setLoading(true);
    setError(null);
    try {
      const envVars = {
        YOUTUBE_API_KEY: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ? '✅ Définie' : '❌ Manquante',
        TWITCH_CLIENT_ID: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID ? '✅ Définie' : '❌ Manquante',
      };
      setResults({ type: 'Environment Variables', data: envVars });
    } catch (err) {
      setError('Erreur vérification environnement');
    } finally {
      setLoading(false);
    }
  };

  const syncAllChannels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/sync/channels', { method: 'POST' });
      const data = await response.json();
      setResults({ type: 'Sync All Channels', data });
    } catch (err) {
      setError('Erreur synchronisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🧪 Test des APIs
          </h1>
          <p className="text-gray-600">
            Interface de test pour diagnostiquer les problèmes d'APIs YouTube et Twitch
          </p>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">⚙️ Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Channel ID
              </label>
              <input
                type="text"
                value={youtubeChannelId}
                onChange={(e) => setYoutubeChannelId(e.target.value)}
                placeholder="UCbVWhV1QQHy-iur65xP_KIA"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitch Username
              </label>
              <input
                type="text"
                value={twitchUsername}
                onChange={(e) => setTwitchUsername(e.target.value)}
                placeholder="imaginaryflame"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Tests */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🔧 Tests disponibles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Tests Environnement */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">🌍 Environnement</h3>
              <button
                onClick={testEnvironment}
                disabled={loading}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Variables ENV
              </button>
            </div>

            {/* Tests YouTube */}
            <div className="space-y-2">
              <h3 className="font-medium text-red-700">🔴 YouTube</h3>
              <button
                onClick={testYouTubeAPI}
                disabled={loading}
                className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                Test Chaîne
              </button>
              <button
                onClick={testYouTubeVideos}
                disabled={loading}
                className="w-full px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500 disabled:opacity-50"
              >
                Test Vidéos
              </button>
            </div>

            {/* Tests Twitch */}
            <div className="space-y-2">
              <h3 className="font-medium text-purple-700">🟣 Twitch</h3>
              <button
                onClick={testTwitchAPI}
                disabled={loading}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
              >
                Test Chaîne
              </button>
              <button
                onClick={testTwitchVideos}
                disabled={loading}
                className="w-full px-4 py-2 bg-purple-400 text-white rounded hover:bg-purple-500 disabled:opacity-50"
              >
                Test VODs
              </button>
            </div>

            {/* Tests Base de données */}
            <div className="space-y-2">
              <h3 className="font-medium text-green-700">💾 Base de données</h3>
              <button
                onClick={testDatabaseVideos}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                Vidéos en BDD
              </button>
            </div>

            {/* Synchronisation */}
            <div className="space-y-2">
              <h3 className="font-medium text-blue-700">🔄 Synchronisation</h3>
              <button
                onClick={syncAllChannels}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Sync Toutes
              </button>
            </div>
          </div>
        </div>

        {/* Résultats */}
        {(loading || error || results) && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Résultats</h2>
            
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Test en cours...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-600 text-2xl mr-2">❌</span>
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              </div>
            )}

            {results && !loading && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 text-2xl">✅</span>
                  <h3 className="text-lg font-medium text-gray-800">{results.type}</h3>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {JSON.stringify(results.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 text-center space-x-6">
          <a href="/admin" className="text-blue-500 hover:text-blue-700 underline">
            🏠 Retour Admin
          </a>
          <a href="/admin/chaines" className="text-purple-500 hover:text-purple-700 underline">
            📺 Gestion Chaînes
          </a>
          <a href="/chaines" className="text-green-500 hover:text-green-700 underline">
            👁️ Voir Chaînes
          </a>
        </div>
      </div>
    </div>
  );
} 