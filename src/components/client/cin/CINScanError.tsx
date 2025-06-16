
interface CINScanErrorProps {
  scannedImage: string | null;
  extractedData: any;
  isScanning: boolean;
}

export const CINScanError = ({ scannedImage, extractedData, isScanning }: CINScanErrorProps) => {
  if (!scannedImage || extractedData || isScanning) {
    return null;
  }

  return (
    <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-800">
        ⚠️ Aucune donnée extraite. Assurez-vous que l'image de la CIN est claire et lisible.
      </p>
    </div>
  );
};
