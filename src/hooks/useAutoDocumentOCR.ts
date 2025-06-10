
import { useAutoDocumentState } from "./useAutoDocumentOCR/useAutoDocumentState";
import { useOCRRequest } from "./useAutoDocumentOCR/useOCRRequest";
import { useDocumentDetection } from "./useAutoDocumentOCR/useDocumentDetection";

export const useAutoDocumentOCR = () => {
  const {
    isScanning,
    extractedData,
    rawText,
    detectedDocumentType,
    detectionConfidence,
    updateState,
    resetState,
    setScanning
  } = useAutoDocumentState();

  const { performOCR } = useOCRRequest();
  const { detectAndExtractData, resetChildHooks } = useDocumentDetection();

  const scanImage = async (file: File, apiKey: string) => {
    setScanning(true);
    resetState();

    try {
      const parsedText = await performOCR(file, apiKey);
      updateState({ rawText: parsedText });

      const result = await detectAndExtractData(parsedText, file, apiKey);
      
      if (result) {
        updateState({
          extractedData: result.data,
          detectedDocumentType: result.documentType,
          detectionConfidence: result.confidence
        });

        return result;
      }

      return null;
    } catch (error) {
      console.error("Auto document OCR scan error:", error);
      return null;
    } finally {
      setScanning(false);
    }
  };

  const resetScan = () => {
    resetState();
    resetChildHooks();
  };

  return {
    isScanning,
    extractedData,
    rawText,
    detectedDocumentType,
    detectionConfidence,
    scanImage,
    resetScan
  };
};
