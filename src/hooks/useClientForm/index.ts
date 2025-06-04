
import { useNavigate } from "react-router-dom";
import { useFormState } from "./useFormState";
import { useMRZHandler } from "./useMRZHandler";
import { useBarcodeHandler } from "./useBarcodeHandler";
import { useFormSubmission } from "./useFormSubmission";

export const useClientFormLogic = () => {
  const navigate = useNavigate();
  
  const {
    formData,
    setFormData,
    updateFormData,
    selectedDocumentType,
    handleInputChange,
    handleDocumentTypeSelect
  } = useFormState();

  const { handleMRZDataExtracted } = useMRZHandler({ formData, setFormData });
  const { handleBarcodeScanned } = useBarcodeHandler({ setFormData });
  const { isLoading, handleSubmit } = useFormSubmission({ formData, navigate });

  return {
    formData,
    isLoading,
    selectedDocumentType,
    handleInputChange,
    handleSubmit,
    handleMRZDataExtracted,
    handleDocumentTypeSelect,
    handleBarcodeScanned
  };
};
