
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

interface PassportAPIKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  showApiKey: boolean;
  onToggleApiKey: () => void;
}

export const PassportAPIKeyInput = ({ 
  apiKey, 
  onApiKeyChange, 
  showApiKey, 
  onToggleApiKey 
}: PassportAPIKeyInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="apiKey" className="text-sm">Clé API OCR.space</Label>
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            id="apiKey"
            type={showApiKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="Entrez votre clé API OCR.space"
            className="pr-10"
          />
          <button
            type="button"
            onClick={onToggleApiKey}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Clé API configurée et prête à utiliser
      </p>
    </div>
  );
};
