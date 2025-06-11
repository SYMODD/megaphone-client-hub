
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key } from "lucide-react";

interface DomainInstructionsProps {
  currentDomain: string;
}

export const DomainInstructions: React.FC<DomainInstructionsProps> = ({ currentDomain }) => {
  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Key className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-1 text-sm">
          <div><strong>Vérifications nécessaires :</strong></div>
          <div>1. Dans Google Cloud Console, vérifiez que ces domaines sont autorisés :</div>
          <div className="ml-4">• <code>localhost</code> (pour développement)</div>
          <div className="ml-4">• <code>sudmegaphone.netlify.app</code></div>
          <div className="ml-4">• <code>app.sudmegaphone.com</code></div>
          <div className="ml-4">• <code>{currentDomain}</code> (domaine actuel)</div>
          <div>2. Assurez-vous que la clé publique correspond au bon projet Google</div>
          <div>3. Rechargez complètement la page après les modifications</div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
