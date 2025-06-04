
import { useCINForm } from "@/hooks/useCINForm";
import { CINScannerSection } from "./CINScannerSection";
import { CINFormFields } from "./CINFormFields";
import { FormActions } from "./FormActions";

export const CINForm = () => {
  const {
    formData,
    isLoading,
    handleInputChange,
    handleImageScanned,
    handleCINDataExtracted,
    handleSubmit
  } = useCINForm();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
      <CINScannerSection
        scannedImage={formData.scannedImage}
        onImageScanned={handleImageScanned}
        onDataExtracted={handleCINDataExtracted}
      />

      <CINFormFields
        formData={formData}
        onInputChange={handleInputChange}
      />

      <FormActions 
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />
    </form>
  );
};
