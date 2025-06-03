
export const extractPhoneNumber = (text: string): string | undefined => {
  const phonePatterns = [
    /\+?212\s?[5-7]\d{8}/g, // Format marocain international
    /0[5-7]\d{8}/g, // Format marocain national
    /\+?\d{1,4}[\s-]?\d{8,12}/g, // Format international général
    /\b\d{10}\b/g // 10 chiffres consécutifs
  ];

  for (const pattern of phonePatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      const potentialPhone = matches[0].replace(/[\s-]/g, '');
      if (potentialPhone.length >= 8 && potentialPhone.length <= 15) {
        return potentialPhone;
      }
    }
  }

  return undefined;
};
