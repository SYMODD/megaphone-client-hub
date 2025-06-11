
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface ConfigFormFieldsProps {
  formData: {
    siteKey: string;
    secretKey: string;
  };
  showSecrets: boolean;
  onToggleSecrets: () => void;
  onUpdateField: (field: 'siteKey' | 'secretKey', value: string) => void;
}

export const ConfigFormFields: React.FC<ConfigFormFieldsProps> = ({
  formData,
  showSecrets,
  onToggleSecrets,
  onUpdateField
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="siteKey">Clé publique (Site Key)</Label>
        <Input
          id="siteKey"
          type={showSecrets ? "text" : "password"}
          placeholder="6Lc..."
          value={formData.siteKey}
          onChange={(e) => onUpdateField('siteKey', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="secretKey">Clé secrète (Secret Key)</Label>
        <Input
          id="secretKey"
          type={showSecrets ? "text" : "password"}
          placeholder="6Lc..."
          value={formData.secretKey}
          onChange={(e) => onUpdateField('secretKey', e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSecrets}
        >
          {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showSecrets ? 'Masquer' : 'Afficher'}
        </Button>
      </div>
    </div>
  );
};
