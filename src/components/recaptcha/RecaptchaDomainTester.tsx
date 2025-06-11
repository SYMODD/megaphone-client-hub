
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { useDomainTester } from './domain-tester/useDomainTester';
import { DomainInfoGrid } from './domain-tester/DomainInfoGrid';
import { TestActions } from './domain-tester/TestActions';
import { TestResults } from './domain-tester/TestResults';
import { DomainInstructions } from './domain-tester/DomainInstructions';

export const RecaptchaDomainTester: React.FC = () => {
  const {
    siteKey,
    isConfigured,
    testing,
    testResults,
    currentDomain,
    currentUrl,
    testDomainCompatibility,
    forceCompleteRefresh
  } = useDomainTester();

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Globe className="w-5 h-5" />
          Diagnostic Domaine reCAPTCHA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DomainInfoGrid 
          currentDomain={currentDomain}
          currentUrl={currentUrl}
          isConfigured={isConfigured}
          siteKey={siteKey}
        />

        <TestActions
          testing={testing}
          siteKey={siteKey}
          onTestDomain={testDomainCompatibility}
          onForceRefresh={forceCompleteRefresh}
        />

        {testResults && (
          <TestResults testResults={testResults} />
        )}

        <DomainInstructions currentDomain={currentDomain} />
      </CardContent>
    </Card>
  );
};
