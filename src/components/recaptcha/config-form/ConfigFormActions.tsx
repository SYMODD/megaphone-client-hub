
import React from 'react';
import { Button } from "@/components/ui/button";

interface ConfigFormActionsProps {
  saving: boolean;
  onSave: () => void;
  onClear: () => void;
}

export const ConfigFormActions: React.FC<ConfigFormActionsProps> = ({
  saving,
  onSave,
  onClear
}) => {
  return (
    <div className="flex gap-2 pt-4">
      <Button 
        onClick={onSave} 
        disabled={saving}
        className="flex items-center gap-2"
      >
        {saving ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sauvegarde...
          </>
        ) : (
          'Sauvegarder'
        )}
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onClear}
        disabled={saving}
      >
        Vider
      </Button>
    </div>
  );
};
