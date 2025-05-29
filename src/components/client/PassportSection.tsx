
import { DocumentScanner } from "./DocumentScanner";
import { DocumentTypeSelector } from "./DocumentTypeSelector";
import { MRZData } from "@/services/ocrService";
import { DocumentType } from "@/types/documentTypes";

interface PassportSectionProps {
  scannedImage: string | null;
  onImageScanned: (image: string) => void;
  onMRZDataExtracted: (data: MRZData, documentType: DocumentType) => void;
  selectedDocumentType: DocumentType | null;
  onDocumentTypeSelect: (type: DocumentType) => void;
}

export const PassportSection = ({ 
  scannedImage, 
  onImageScanned, 
  onMRZDataExtracted,
  selectedDocumentType,
  onDocumentTypeSelect 
}: PassportSectionProps) => {
  
  const handleBackToSelection = () => {
    onDocumentTypeSelect(null as any);
  };

  return (
    <div className="space-y-4">
      <DocumentTypeSelector
        selectedType={selectedDocumentType}
        onTypeSelect={onDocumentTypeSelect}
        onBack={selectedDocumentType ? handleBackToSelection : undefined}
      />
      
      {selectedDocumentType && (
        <DocumentScanner 
          scannedImage={scannedImage}
          onImageScanned={onImageScanned}
          onDataExtracted={onMRZDataExtracted}
        />
      )}
    </div>
  );
};
