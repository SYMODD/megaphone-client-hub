
import { CardContent } from "@/components/ui/card";
import { documentTypes, DocumentType } from "@/types/documentTypes";
import { DocumentTypeButton } from "./DocumentTypeButton";
import { useDocumentSelection } from "./hooks/useDocumentSelection";

interface DocumentTypeListProps {
  onTypeSelect?: (type: DocumentType) => void;
}

export const DocumentTypeList = ({ onTypeSelect }: DocumentTypeListProps) => {
  const { handleTypeClick } = useDocumentSelection();

  console.log('📋 [UNIFIED_LIST] Rendu liste des types de documents (version unifiée)');

  return (
    <CardContent className="space-y-3">
      {documentTypes.map((docType) => (
        <DocumentTypeButton
          key={docType.id}
          docType={docType}
          onTypeClick={() => {
            console.log('🔗 [UNIFIED_LIST] Transmission du clic vers handler unifié:', docType.id);
            handleTypeClick(docType.id, onTypeSelect);
          }}
        />
      ))}
    </CardContent>
  );
};
