'use client';

import { useState } from 'react';

export default function TestScrapingPage() {
  const [url, setUrl] = useState('https://www.wattpad.com/story/315315133-the-hero-and-the-fairy-act-1-once-upon-a-time-the');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testerScraping = async () => {
    if (!url.trim()) {
      alert('Veuillez entrer une URL');
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const response = await fetch('/api/scraping/test-wattpad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      alert(`Erreur réseau: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    setIsLoading(false);
  };

  const renderTestResults = (tests: any, method: string) => {
    if (!tests) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Résultats {method}
        </h3>
        
        {/* Tests de titre */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Tests de titre :</h4>
          <div className="space-y-2">
            {tests.titre?.map((test: any, index: number) => (
              <div
                key={index}
                className={`p-2 rounded text-sm ${
                  test.found && test.length > 10
                    ? 'bg-green-100 border-green-300'
                    : test.found
                    ? 'bg-yellow-100 border-yellow-300'
                    : 'bg-red-100 border-red-300'
                } border`}
              >
                <div className="font-mono text-xs text-gray-600">{test.selector}</div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    test.found ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {test.found ? '✅ Trouvé' : '❌ Non trouvé'}
                  </span>
                  {test.found && (
                    <span className="text-xs text-gray-500">
                      ({test.length} caractères)
                    </span>
                  )}
                </div>
                {test.found && test.text && (
                  <div className="mt-1 text-sm text-gray-700 italic">
                    "{test.text}..."
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tests d'auteur */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Tests d'auteur :</h4>
          <div className="space-y-2">
            {tests.auteur?.map((test: any, index: number) => (
              <div
                key={index}
                className={`p-2 rounded text-sm ${
                  test.found && test.length > 2
                    ? 'bg-green-100 border-green-300'
                    : test.found
                    ? 'bg-yellow-100 border-yellow-300'
                    : 'bg-red-100 border-red-300'
                } border`}
              >
                <div className="font-mono text-xs text-gray-600">{test.selector}</div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    test.found ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {test.found ? '✅ Trouvé' : '❌ Non trouvé'}
                  </span>
                  {test.found && (
                    <span className="text-xs text-gray-500">
                      ({test.length} caractères)
                    </span>
                  )}
                </div>
                {test.found && test.text && (
                  <div className="mt-1 text-sm text-gray-700 italic">
                    "{test.text}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tests de description */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Tests de description :</h4>
          <div className="space-y-2">
            {tests.description?.map((test: any, index: number) => (
              <div
                key={index}
                className={`p-2 rounded text-sm ${
                  test.found && test.length > 20
                    ? 'bg-green-100 border-green-300'
                    : test.found
                    ? 'bg-yellow-100 border-yellow-300'
                    : 'bg-red-100 border-red-300'
                } border`}
              >
                <div className="font-mono text-xs text-gray-600">{test.selector}</div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    test.found ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {test.found ? '✅ Trouvé' : '❌ Non trouvé'}
                  </span>
                  {test.found && (
                    <span className="text-xs text-gray-500">
                      ({test.length} caractères)
                    </span>
                  )}
                </div>
                {test.found && test.text && (
                  <div className="mt-1 text-sm text-gray-700 italic">
                    "{test.text}..."
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🧪 Test de scraping Wattpad
          </h1>

          <div className="mb-8">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              URL Wattpad à tester :
            </label>
            <div className="flex gap-4">
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.wattpad.com/story/..."
              />
              <button
                onClick={testerScraping}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-md"
              >
                {isLoading ? '🔄 Test en cours...' : '🧪 Tester'}
              </button>
            </div>
          </div>

          {results && (
            <div className="space-y-8">
              {/* Recommandations */}
              {results.recommendations && results.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">
                    🎯 Recommandations
                  </h3>
                  <ul className="space-y-1">
                    {results.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm text-blue-700">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Structure de la page */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Résultats Playwright */}
                {results.playwright && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-purple-800 mb-4">
                      🎭 Playwright {results.playwright.success ? '✅' : '❌'}
                    </h3>
                    
                    {results.playwright.success ? (
                      <>
                        {results.playwright.pageStructure && (
                          <div className="mb-4 p-3 bg-white rounded border">
                            <h4 className="font-medium text-gray-700 mb-2">Structure de la page :</h4>
                            <div className="text-sm text-gray-600">
                              <div><strong>Titre :</strong> {results.playwright.pageStructure.title}</div>
                              <div><strong>Body classes :</strong> {results.playwright.pageStructure.bodyClasses}</div>
                            </div>
                          </div>
                        )}
                        {renderTestResults(results.playwright.tests, 'Playwright')}
                      </>
                    ) : (
                      <div className="text-red-600">
                        Erreur: {results.playwright.error}
                      </div>
                    )}
                  </div>
                )}

                {/* Résultats Cheerio */}
                {results.cheerio && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-green-800 mb-4">
                      🕷️ Cheerio {results.cheerio.success ? '✅' : '❌'}
                    </h3>
                    
                    {results.cheerio.success ? (
                      <>
                        {results.cheerio.pageStructure && (
                          <div className="mb-4 p-3 bg-white rounded border">
                            <h4 className="font-medium text-gray-700 mb-2">Structure de la page :</h4>
                            <div className="text-sm text-gray-600">
                              <div><strong>Titre :</strong> {results.cheerio.pageStructure.title}</div>
                              <div><strong>Body classes :</strong> {results.cheerio.pageStructure.bodyClasses}</div>
                            </div>
                          </div>
                        )}
                        {renderTestResults(results.cheerio.tests, 'Cheerio')}
                      </>
                    ) : (
                      <div className="text-red-600">
                        Erreur: {results.cheerio.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Test de scraping en cours...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 