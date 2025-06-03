
import { Label } from "@/components/ui/label";

interface CurrentBarcodeDisplayProps {
  currentBarcode: string;
}

export const CurrentBarcodeDisplay = ({ currentBarcode }: CurrentBarcodeDisplayProps) => {
  return (
    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
      <Label className="text-sm font-medium text-green-800">Code-barres actuel</Label>
      <p className="text-green-700 font-mono text-sm mt-1">{currentBarcode}</p>
    </div>
  );
};
