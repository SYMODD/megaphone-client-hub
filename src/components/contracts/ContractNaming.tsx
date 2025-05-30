
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Info } from "lucide-react";

interface ContractNamingProps {
  contractName: string;
  onContractNameChange: (name: string) => void;
  selectedClient: any;
}

export const ContractNaming = ({ 
  contractName, 
  onContractNameChange, 
  selectedClient 
}: ContractNamingProps) => {
  const generateDefaultName = () => {
    if (!selectedClient) return 'contrat';
    const date = new Date().toISOString().split('T')[0];
    return `contrat_${selectedClient.prenom}_${selectedClient.nom}_${date}`;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onContractNameChange(e.target.value);
  };

  const handleUseDefault = () => {
    onContractNameChange(generateDefaultName());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Nom du contrat
        </CardTitle>
        <CardDescription>
          Personnalisez le nom du fichier PDF qui sera généré
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contract-name">Nom du fichier (sans extension)</Label>
            <Input
              id="contract-name"
              value={contractName}
              onChange={handleNameChange}
              placeholder="ex: contrat_service_premium"
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            <span>Le fichier sera sauvegardé comme : <strong>{contractName || 'contrat'}.pdf</strong></span>
          </div>

          {selectedClient && (
            <button
              onClick={handleUseDefault}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Utiliser le nom par défaut : {generateDefaultName()}.pdf
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
