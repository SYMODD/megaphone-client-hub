
export const extractPhoneNumber = (text: string): string | undefined => {
  console.log("Extracting phone number from text:", text);
  
  // Patterns améliorés pour les numéros marocains et internationaux
  const phonePatterns = [
    // Numéros marocains format international
    /\+?212\s?[5-7]\d{8}/g,
    // Numéros marocains format national avec espaces ou tirets
    /0[5-7][\s\-]?\d{2}[\s\-]?\d{2}[\s\-]?\d{2}[\s\-]?\d{2}/g,
    // Numéros marocains format national sans séparateurs
    /0[5-7]\d{8}/g,
    // Numéros de 10 chiffres consécutifs (format compact)
    /(?:^|\s)(\d{10})(?:\s|$)/g,
    // Numéros avec séparateurs variés
    /(?:^|\s)(\d{2,4}[\s\-\.]\d{2,4}[\s\-\.]\d{2,4}[\s\-\.]\d{2,4})(?:\s|$)/g,
    // Format international général
    /\+?\d{1,4}[\s\-]?\d{8,12}/g
  ];

  for (const pattern of phonePatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      for (const match of matches) {
        // Nettoyer le numéro (supprimer espaces, tirets, etc.)
        const cleanPhone = match.replace(/[\s\-\.]/g, '').trim();
        console.log("Potential phone found:", cleanPhone);
        
        // Vérifier la longueur et le format
        if (cleanPhone.length >= 8 && cleanPhone.length <= 15) {
          // Vérifier que c'est bien un numéro (pas un code-barres)
          if (/^\d+$/.test(cleanPhone)) {
            console.log("✅ Numéro de téléphone valide trouvé:", cleanPhone);
            
            // Formater selon le standard marocain si applicable
            if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
              return cleanPhone; // Format national marocain
            } else if (cleanPhone.startsWith('212') && cleanPhone.length === 12) {
              return `+${cleanPhone}`; // Format international
            } else if (cleanPhone.length === 10 && /^[5-7]/.test(cleanPhone)) {
              return `0${cleanPhone}`; // Ajouter le 0 si manquant
            }
            
            return cleanPhone;
          }
        }
      }
    }
  }

  console.log("❌ Aucun numéro de téléphone trouvé");
  return undefined;
};
