
import React from 'react';
import { PDFContractHeader } from "./PDFContractHeader";
import { PDFContractProvider } from "./provider/PDFContractProvider";
import { PDFContractContent } from "./PDFContractContent";
import { Client } from "./provider/types";

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
