
import React from 'react';
import { TestResult } from "@/hooks/useRecaptchaTestRunner";

interface RecaptchaTestDetailsProps {
  results: TestResult[];
}

export const RecaptchaTestDetails: React.FC<RecaptchaTestDetailsProps> = ({
  results
}) => {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-slate-50 rounded-lg">
      <h5 className="font-medium text-sm mb-2">Détails Techniques</h5>
      <div className="space-y-2 text-xs">
        {results.map((result, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between">
              <span className="font-medium">{result.role.toUpperCase()}</span>
              <span className="text-slate-500">
                {result.timestamp.toLocaleTimeString()}
              </span>
            </div>
            {result.success ? (
              <div className="text-green-700">
                ✅ Token généré: {result.token}
              </div>
            ) : (
              <div className="text-red-700">
                ❌ Erreur: {result.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
