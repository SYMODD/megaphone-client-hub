
import { CINForm } from "./CINForm";
import { PassportMarocainForm } from "./PassportMarocainForm";
import { PassportEtrangerForm } from "./PassportEtrangerForm";
import { CarteSejourForm } from "./CarteSejourForm";
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
  selectedDocumentType
}: PassportSectionProps) => {
  
  console.log('📄 [PASSPORT_SECTION] Rendu avec type:', selectedDocumentType);

  // Afficher le formulaire approprié selon le type sélectionné
  if (!selectedDocumentType) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">Aucun type de document sélectionné</p>
      </div>
    );
  }

  // Afficher le formulaire correspondant au type de document sélectionné
  switch (selectedDocumentType) {
    case 'cin':
      return <CINForm />;
    case 'passeport_marocain':
      return <PassportMarocainForm />;
    case 'passeport_etranger':
      return <PassportEtrangerForm />;
    case 'carte_sejour':
      return <CarteSejourForm />;
    default:
      return (
        <div className="text-center p-4">
          <p className="text-gray-500">Type de document non reconnu: {selectedDocumentType}</p>
        </div>
      );
  }
};
