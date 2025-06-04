
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { PassportSection } from "./PassportSection";
import { RegistrationSection } from "./RegistrationSection";
import { FormActions } from "./FormActions";
import { BarcodeScanner } from "./BarcodeScanner";
import { useClientFormLogic } from "@/hooks/useClientForm";
import { DocumentType } from "@/types/documentTypes";

export const ClientForm = () => {
  const { 
    formData, 
    isLoading, 
    selectedDocumentType,
    handleInputChange, 
    handleSubmit, 
    handleMRZDataExtracted,
    handleDocumentTypeSelect,
    handleBarcodeScanned
  } = useClientFormLogic();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(); // 🔧 FIX: Remove the argument
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
      <div className="space-y-4 sm:space-y-6">
        <PassportSection 
          scannedImage={formData.scannedImage}
          onImageScanned={(image) => handleInputChange("scannedImage", image)}
          onMRZDataExtracted={handleMRZDataExtracted}
          selectedDocumentType={selectedDocumentType as DocumentType}
          onDocumentTypeSelect={handleDocumentTypeSelect}
        />

        <BarcodeScanner 
          onBarcodeScanned={handleBarcodeScanned}
          currentBarcode={formData.code_barre}
        />

        {selectedDocumentType && (
          <>
            <PersonalInfoSection 
              formData={formData}
              onInputChange={handleInputChange}
            />

            <ContactInfoSection 
              formData={formData}
              onInputChange={handleInputChange}
            />

            <RegistrationSection 
              formData={formData}
              onInputChange={handleInputChange}
            />

            <FormActions 
              isLoading={isLoading}
              onSubmit={() => handleSubmit()}
            />
          </>
        )}
      </div>
    </form>
  );
};
