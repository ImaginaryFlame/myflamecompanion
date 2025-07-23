'use client';

import { useState, useEffect } from 'react';

/**
 * Hook pour éviter les erreurs d'hydratation
 * Retourne true seulement une fois que le composant est monté côté client
 */
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Composant wrapper pour éviter les erreurs d'hydratation
 */
export function ClientOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  const isClient = useClientOnly();

  if (!isClient) {
    return fallback;
  }

  return <>{children}</>;
}