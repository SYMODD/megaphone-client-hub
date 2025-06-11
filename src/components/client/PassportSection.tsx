
import { DocumentScanner } from "./DocumentScanner";
import { MRZData } from "@/services/ocr";
import { DocumentType } from "@/types/documentTypes";

interface PassportSectionProps {
  scannedImage: string | null;
  onImageScanned: (image: string) => void;
  onMRZDataExtracted: (data: MRZData, documentType: DocumentType) => void;
  selectedDocumentType: DocumentType | null;
  onDocumentTypeSelect: (type: DocumentType | null) => void;
}

export const PassportSection = ({ 
  scannedImage, 
  onImageScanned, 
  onMRZDataExtracted,
  selectedDocumentType
}: PassportSectionProps) => {
  
  console.log('📄 [PASSPORT_SECTION] Rendu avec type:', selectedDocumentType);

  // Afficher directement le scanner puisque le type est déjà sélectionné
  if (!selectedDocumentType) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">Aucun type de document sélectionné</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DocumentScanner 
        scannedImage={scannedImage}
        onImageScanned={onImageScanned}
        onDataExtracted={onMRZDataExtracted}
      />
    </div>
  );
};
