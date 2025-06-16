
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown } from "lucide-react";

export const PDFContractHeader = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="w-5 h-5" />
          Générateur de Contrats PDF
        </CardTitle>
        <CardDescription>
          Gérez vos templates, configurez les champs et générez des contrats personnalisés
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
