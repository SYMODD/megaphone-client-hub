
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

// 🎯 NOUVELLE FONCTION: Normalisation finale de la nationalité
export const normalizeNationalityForSubmission = (nationality: string | undefined): string => {
  if (!nationality) return "Maroc";
  
  const normalized = nationality.trim().toLowerCase();
  
  // Forcer "Maroc" pour toutes les variantes marocaines
  if (normalized.includes("marocain") || normalized === "maroc") {
    console.log("🇲🇦 NORMALISATION NATIONALITÉ:", {
      valeur_originale: nationality,
      valeur_normalisee: "Maroc",
      action: "Conversion automatique vers Maroc"
    });
    return "Maroc";
  }
  
  // Pour les autres nationalités, garder la première lettre en majuscule
  const formatted = nationality.charAt(0).toUpperCase() + nationality.slice(1).toLowerCase();
  console.log("🌍 NATIONALITÉ CONSERVÉE:", {
    valeur_originale: nationality,
    valeur_formatée: formatted
  });
  
  return formatted;
};
