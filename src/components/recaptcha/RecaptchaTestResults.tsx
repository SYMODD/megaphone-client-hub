
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { TestResult, TestScenario } from "@/hooks/useRecaptchaTestRunner";

interface RecaptchaTestResultsProps {
  results: TestResult[];
  scenarios: TestScenario[];
}

export const RecaptchaTestResults: React.FC<RecaptchaTestResultsProps> = ({
  results,
  scenarios
}) => {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-slate-700">Résultats des Tests</h4>
      
      {scenarios.map((scenario) => {
        const result = results.find(r => r.role === scenario.role);
        const IconComponent = scenario.icon;
        
        return (
          <div 
            key={scenario.role}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <IconComponent className="w-4 h-4 text-slate-600" />
              <div>
                <div className="font-medium text-sm">{scenario.label}</div>
                <div className="text-xs text-slate-500">
                  Action: {scenario.action}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {result ? (
                <>
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "✅ Succès" : "❌ Échec"}
                  </Badge>
                </>
              ) : (
                <Badge variant="secondary">En attente</Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
