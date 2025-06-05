
export const validateBarcodeImageUrl = (url: string | undefined | null): boolean => {
  return !!(url && typeof url === 'string' && url.trim() !== '');
};

export const logValidationError = (url: string | undefined | null) => {
  console.error("🚨 ARRÊT CRITIQUE: URL invalide détectée avant insertion Supabase", {
    url_dans_payload: url,
    type: typeof url,
    action: "ARRÊT DE LA SOUMISSION POUR ÉVITER PERTE DE DONNÉES",
    timestamp: new Date().toISOString()
  });
};
