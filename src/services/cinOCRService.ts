
import { CINOCRResult } from "@/types/cinTypes";

export const performCINOCR = async (file: File, apiKey: string): Promise<CINOCRResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('apikey', apiKey);
  formData.append('language', 'fre'); // Changé vers français
  formData.append('isOverlayRequired', 'true');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');
  formData.append('OCREngine', '2');

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
