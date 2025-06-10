
import { useState } from "react";
import { AutoDocumentOCRState } from "./types";

export const useAutoDocumentState = () => {
  const [state, setState] = useState<AutoDocumentOCRState>({
    isScanning: false,
    extractedData: null,
    rawText: "",
    detectedDocumentType: null,
    detectionConfidence: 0
  });

  const updateState = (updates: Partial<AutoDocumentOCRState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    setState({
      isScanning: false,
      extractedData: null,
      rawText: "",
      detectedDocumentType: null,
      detectionConfidence: 0
    });
  };

  const setScanning = (isScanning: boolean) => {
    updateState({ isScanning });
  };

  return {
    ...state,
    updateState,
    resetState,
    setScanning
  };
};
