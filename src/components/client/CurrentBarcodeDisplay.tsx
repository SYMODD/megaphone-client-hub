
import { Label } from "@/components/ui/label";
import { formatBarcodeForDisplay, canSimplifyBarcode } from "@/utils/barcodeUtils";

interface CurrentBarcodeDisplayProps {
  currentBarcode: string | any;
}

export const CurrentBarcodeDisplay = ({ currentBarcode }: CurrentBarcodeDisplayProps) => {
  const displayBarcode = formatBarcodeForDisplay(currentBarcode);
  const isSimplified = canSimplifyBarcode(currentBarcode);
  
  // Handle case where currentBarcode is an object (passport data)
  const getOriginalValue = () => {
    if (typeof currentBarcode === 'object' && currentBarcode) {
      return currentBarcode.numero_passeport || currentBarcode.code_barre || currentBarcode.barcode || "";
    }
    return currentBarcode;
  };
  
  const originalValue = getOriginalValue();

  return (
    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
      <Label className="text-sm font-medium text-green-800">Code-barres actuel</Label>
      <p className="text-green-700 font-mono text-sm mt-1">{displayBarcode}</p>
      {isSimplified && originalValue && (
        <p className="text-xs text-green-600 mt-1">
          Format original : {originalValue}
        </p>
      )}
    </div>
  );
};
