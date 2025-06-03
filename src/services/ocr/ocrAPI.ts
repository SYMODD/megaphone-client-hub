
import { OCRResponse } from "@/types/ocrTypes";

export const performOCRRequest = async (imageFile: File, apiKey: string = "helloworld"): Promise<OCRResponse> => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('apikey', apiKey);
  formData.append('language', 'eng');
  formData.append('isOverlayRequired', 'true');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');
  formData.append('OCREngine', '2');

  console.log("Sending passport image to OCR.space API...");

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};
