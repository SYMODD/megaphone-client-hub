
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

interface CINScanResultsProps {
  extractedData: any;
  rawText: string;
  showRawText: boolean;
  onToggleRawText: () => void;
  isScanning: boolean;
}

export const CINScanResults = ({ 
  extractedData, 
  rawText, 
  showRawText, 
  onToggleRawText,
  isScanning 
}: CINScanResultsProps) => {
  if (!extractedData || isScanning) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="font-semibold text-green-800 mb-3 flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Données extraites de la CIN
        </h4>
      </div>

      {/* Extracted data display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        {Object.entries(extractedData).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {key.replace(/_/g, ' ')}
            </Label>
            <p className="font-medium text-gray-900 bg-white px-3 py-2 rounded border">
              {String(value) || "Non détecté"}
            </p>
          </div>
        ))}
      </div>

      {/* Raw text toggle */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleRawText}
          className="w-full"
        >
          {showRawText ? "Masquer" : "Afficher"} le texte brut détecté
        </Button>
        
        {showRawText && rawText && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
            {rawText}
          </div>
        )}
      </div>
    </div>
  );
};
