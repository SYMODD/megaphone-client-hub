
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, RefreshCw } from "lucide-react";

interface TestActionsProps {
  testing: boolean;
  siteKey: string | null;
  onTestDomain: () => void;
  onForceRefresh: () => void;
}

export const TestActions: React.FC<TestActionsProps> = ({
  testing,
  siteKey,
  onTestDomain,
  onForceRefresh
}) => {
  return (
    <div className="flex gap-2">
      <Button 
        onClick={onTestDomain} 
        disabled={testing || !siteKey}
        variant="outline"
        size="sm"
      >
        {testing ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Test en cours...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Tester domaine
          </>
        )}
      </Button>
      
      <Button 
        onClick={onForceRefresh}
        variant="outline"
        size="sm"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh complet
      </Button>
    </div>
  );
};
