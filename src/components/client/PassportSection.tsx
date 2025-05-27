
import { PassportScanner } from "./PassportScanner";

interface PassportSectionProps {
  scannedImage: string | null;
  onImageScanned: (image: string) => void;
}

export const PassportSection = ({ scannedImage, onImageScanned }: PassportSectionProps) => {
  return (
    <PassportScanner 
      scannedImage={scannedImage}
      onImageScanned={onImageScanned}
    />
  );
};
