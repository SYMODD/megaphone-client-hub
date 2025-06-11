
export interface DomainTestResults {
  currentDomain: string;
  currentUrl: string;
  siteKey: string | null;
  timestamp: string;
  checks: {
    hasValidSiteKey: boolean;
    domainInfo: {
      hostname: string;
      protocol: string;
      port: string;
      fullOrigin: string;
    };
    expectedDomains: string[];
    scriptLoaded?: boolean;
    scriptError?: string;
  };
}
