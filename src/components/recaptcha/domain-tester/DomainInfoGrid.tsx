
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface DomainInfoGridProps {
  currentDomain: string;
  currentUrl: string;
  isConfigured: boolean;
  siteKey: string | null;
}

export const DomainInfoGrid: React.FC<DomainInfoGridProps> = ({
  currentDomain,
  currentUrl,
  isConfigured,
  siteKey
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <strong>Domaine actuel :</strong>
        <Badge variant="outline" className="ml-2">{currentDomain}</Badge>
      </div>
      <div>
        <strong>URL complète :</strong>
        <Badge variant="outline" className="ml-2">{currentUrl}</Badge>
      </div>
      <div>
        <strong>Clé configurée :</strong>
        <Badge variant={isConfigured ? "default" : "destructive"} className="ml-2">
          {isConfigured ? '✅ Oui' : '❌ Non'}
        </Badge>
      </div>
      <div>
        <strong>Clé valide :</strong>
        <Badge variant={siteKey?.startsWith('6L') ? "default" : "destructive"} className="ml-2">
          {siteKey?.startsWith('6L') ? '✅ Format OK' : '❌ Format invalide'}
        </Badge>
      </div>
    </div>
  );
};
