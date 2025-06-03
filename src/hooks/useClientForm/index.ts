
import { useFormState } from "./useFormState";
import { useMRZHandler } from "./useMRZHandler";
import { useFormSubmission } from "./useFormSubmission";

export const useClientFormLogic = () => {
  const {
    formData,
    setFormData,
    selectedDocumentType,
    handleInputChange,
    handleDocumentTypeSelect
  } = useFormState();

  const { handleMRZDataExtracted } = useMRZHandler({ formData, setFormData });
  const { isLoading, handleSubmit } = useFormSubmission({ formData });

  return {
    formData,
    isLoading,
    selectedDocumentType,
    handleInputChange,
    handleSubmit,
    handleMRZDataExtracted,
    handleDocumentTypeSelect
  };
};
