
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { DomainTestResults } from './types';

interface TestResultsProps {
  testResults: DomainTestResults;
}

export const TestResults: React.FC<TestResultsProps> = ({ testResults }) => {
  return (
    <Alert className={testResults.checks.scriptLoaded ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <div><strong>Test effectué :</strong> {new Date(testResults.timestamp).toLocaleString()}</div>
          <div><strong>Script chargé :</strong> {testResults.checks.scriptLoaded ? '✅ Succès' : '❌ Échec'}</div>
          {testResults.checks.scriptError && (
            <div className="text-red-600"><strong>Erreur :</strong> {testResults.checks.scriptError}</div>
          )}
          <div><strong>Domaines attendus :</strong></div>
          <ul className="list-disc list-inside text-xs">
            {testResults.checks.expectedDomains.map((domain: string) => (
              <li key={domain}>{domain}</li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
};
