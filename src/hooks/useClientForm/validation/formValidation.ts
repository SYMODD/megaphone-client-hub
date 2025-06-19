
export const validateBarcodeImageUrl = (url: string | undefined | null): boolean => {
  return !!(url && typeof url === 'string' && url.trim() !== '');
};

export const logValidationError = (url: string | undefined | null) => {
  // Log discret en développement seulement, plus d'erreur critique
  if (process.env.NODE_ENV === 'development') {
    console.debug("💡 Info: URL du code-barres optionnelle:", {
      url_dans_payload: url,
      type: typeof url,
      timestamp: new Date().toISOString()
    });
  }
};