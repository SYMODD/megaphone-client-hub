
export const validateBarcodeImageUrl = (url: string | undefined | null): boolean => {
  return !!(url && typeof url === 'string' && url.trim() !== '');
};

export const logValidationError = (url: string | undefined | null) => {
  // Logs supprimés pour interface propre
};