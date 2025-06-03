
import { Label } from "@/components/ui/label";
import { formatBarcodeForDisplay, canSimplifyBarcode } from "@/utils/barcodeUtils";

interface CurrentBarcodeDisplayProps {
  currentBarcode: string;
}

export const CurrentBarcodeDisplay = ({ currentBarcode }: CurrentBarcodeDisplayProps) => {
  const displayBarcode = formatBarcodeForDisplay(currentBarcode);
  const isSimplified = canSimplifyBarcode(currentBarcode);

  return (
    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
      <Label className="text-sm font-medium text-green-800">Code-barres actuel</Label>
      <p className="text-green-700 font-mono text-sm mt-1">{displayBarcode}</p>
      {isSimplified && (
        <p className="text-xs text-green-600 mt-1">
          Format original : {currentBarcode}
        </p>
      )}
    </div>
  );
};
