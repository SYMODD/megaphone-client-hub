
import { PassportOCRScanner } from "./PassportOCRScanner";
import { MRZData } from "@/services/ocrService";

interface PassportSectionProps {
  scannedImage: string | null;
  onImageScanned: (image: string) => void;
  onMRZDataExtracted: (data: MRZData) => void;
}

export const PassportSection = ({ scannedImage, onImageScanned, onMRZDataExtracted }: PassportSectionProps) => {
  return (
    <PassportOCRScanner 
      scannedImage={scannedImage}
      onImageScanned={onImageScanned}
      onDataExtracted={onMRZDataExtracted}
    />
  );
};
