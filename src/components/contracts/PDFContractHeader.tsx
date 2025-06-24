import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown } from "lucide-react";

export const PDFContractHeader = () => {
  return (
    <Card>
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <FileDown className="w-5 h-5 sm:w-6 sm:h-6" />
          Générateur de Contrats PDF
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Gérez vos templates, configurez les champs et générez des contrats personnalisés
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
