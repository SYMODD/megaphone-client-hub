
import { DocumentScanner } from "./DocumentScanner";
import { MRZData } from "@/services/ocrService";
import { DocumentType } from "@/types/documentTypes";

interface PassportSectionProps {
  scannedImage: string | null;
  onImageScanned: (image: string) => void;
  onMRZDataExtracted: (data: MRZData, documentType: DocumentType) => void;
}

export const PassportSection = ({ scannedImage, onImageScanned, onMRZDataExtracted }: PassportSectionProps) => {
  return (
    <DocumentScanner 
      scannedImage={scannedImage}
      onImageScanned={onImageScanned}
      onDataExtracted={onMRZDataExtracted}
    />
  );
};
