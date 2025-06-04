
import { CINScanner } from "./CINScanner";

interface CINScannerSectionProps {
  scannedImage: string | null;
  onImageScanned: (image: string, photoUrl?: string) => void;
  onDataExtracted: (data: any) => void;
}

export const CINScannerSection = ({ 
  scannedImage, 
  onImageScanned, 
  onDataExtracted 
}: CINScannerSectionProps) => {
  return (
    <CINScanner 
      scannedImage={scannedImage}
      onImageScanned={onImageScanned}
      onDataExtracted={onDataExtracted}
    />
  );
};
