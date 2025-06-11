
import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";

interface RecaptchaTestActionsProps {
  isConfigured: boolean;
  testing: boolean;
  hasResults: boolean;
  onRunTests: () => void;
  onClearResults: () => void;
}

export const RecaptchaTestActions: React.FC<RecaptchaTestActionsProps> = ({
  isConfigured,
  testing,
  hasResults,
  onRunTests,
  onClearResults
}) => {
  return (
    <div className="flex gap-2">
      <Button 
        onClick={onRunTests} 
        disabled={!isConfigured || testing}
        className="flex items-center gap-2"
      >
        {testing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Test en cours...
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Lancer Tests
          </>
        )}
      </Button>
      
      {hasResults && (
        <Button 
          variant="outline" 
          onClick={onClearResults}
          disabled={testing}
        >
          Vider Résultats
        </Button>
      )}
    </div>
  );
};
