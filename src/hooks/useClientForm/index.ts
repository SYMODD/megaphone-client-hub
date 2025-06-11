
import { useFormState } from "./useFormState";
import { useMRZHandler } from "./useMRZHandler";
import { useBarcodeHandler } from "./useBarcodeHandler";
import { useFormSubmission } from "./useFormSubmission";

export const useClientFormLogic = () => {
  const {
    formData,
    setFormData,
    selectedDocumentType,
    handleInputChange,
    handleDocumentTypeSelect,
    resetForm
  } = useFormState();

  const { handleMRZDataExtracted } = useMRZHandler({ formData, setFormData });
  const { handleBarcodeScanned } = useBarcodeHandler({ setFormData });
  const { isSubmitting, handleSubmit } = useFormSubmission({ formData, resetForm });

  return {
    formData,
    isLoading: isSubmitting, // 🔥 CORRECTION: utiliser isLoading au lieu de isSubmitting pour l'API
    selectedDocumentType,
    handleInputChange,
    handleSubmit,
    handleMRZDataExtracted,
    handleDocumentTypeSelect,
    handleBarcodeScanned
  };
};
