import { useState, useEffect, useCallback } from 'react';

export const useBlobUrl = () => {
  const [blobUrl, setBlobUrl] = useState<string>('');

  const createBlobUrl = useCallback((data: Uint8Array, type: string = 'application/pdf') => {
    // Révoquer l'ancienne URL si elle existe
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }

    try {
      const blob = new Blob([data], { type });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      return url;
    } catch (error) {
      console.error('❌ Erreur lors de la création du blob URL:', error);
      throw new Error('Impossible de créer l\'URL de prévisualisation');
    }
  }, [blobUrl]);

  const revokeBlobUrl = useCallback(() => {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl('');
    }
  }, [blobUrl]);

  // Nettoyage automatique lors du démontage du composant
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  return {
    blobUrl,
    createBlobUrl,
    revokeBlobUrl
  };
}; 