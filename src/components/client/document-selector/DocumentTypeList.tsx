
import { CardContent } from "@/components/ui/card";
import { documentTypes, DocumentType } from "@/types/documentTypes";
import { DocumentTypeButton } from "./DocumentTypeButton";
import { useDocumentSelection } from "./hooks/useDocumentSelection";

interface DocumentTypeListProps {
  onTypeSelect?: (type: DocumentType) => void;
}

export const DocumentTypeList = ({ onTypeSelect }: DocumentTypeListProps) => {
  const {
    shouldUseRecaptcha,
    handleDocumentSelectionWithRecaptcha,
    handleRecaptchaError,
    handleTypeClick
  } = useDocumentSelection();

  return (
    <CardContent className="space-y-3">
      {documentTypes.map((docType) => (
        <div key={docType.id}>
          <DocumentTypeButton
            docType={docType}
            shouldUseRecaptcha={shouldUseRecaptcha}
            onTypeClick={() => handleTypeClick(docType.id, onTypeSelect)}
            onRecaptchaSuccess={handleDocumentSelectionWithRecaptcha}
            onRecaptchaError={handleRecaptchaError}
          />
        </div>
      ))}
    </CardContent>
  );
};
