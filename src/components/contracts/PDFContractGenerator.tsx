
import React from 'react';
import { PDFContractHeader } from "./PDFContractHeader";
import { PDFContractProvider } from "./PDFContractProvider";
import { PDFContractContent } from "./PDFContractContent";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  date_enregistrement: string;
  observations?: string;
}

interface PDFContractGeneratorProps {
  clients: Client[];
}

export const PDFContractGenerator = ({ clients }: PDFContractGeneratorProps) => {
  return (
    <PDFContractProvider>
      <div className="space-y-6">
        <PDFContractHeader />
        <PDFContractContent clients={clients} />
      </div>
    </PDFContractProvider>
  );
};
