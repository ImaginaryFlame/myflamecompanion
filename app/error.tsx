'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erreur capturée par Error Boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Oups ! Une erreur s'est produite
          </h1>
          <p className="text-gray-600 mb-6">
            Quelque chose s'est mal passé. Nous nous excusons pour la gêne occasionnée.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={reset}
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-semibold"
            >
              🔄 Réessayer
            </button>
            
            <a
              href="/dashboard"
              className="block w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold"
            >
              🏠 Retour au Dashboard
            </a>
          </div>

          {/* Détails techniques (en développement seulement) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                🔍 Détails techniques
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-red-600 overflow-auto max-h-32">
                <div><strong>Message:</strong> {error.message}</div>
                {error.digest && (
                  <div><strong>Digest:</strong> {error.digest}</div>
                )}
                {error.stack && (
                  <div className="mt-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">{error.stack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
} 