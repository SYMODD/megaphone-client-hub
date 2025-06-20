import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PassportScanner } from "./PassportScanner";
import { PassportMarocainForm } from "./PassportMarocainForm";
import { PassportEtrangerForm } from "./PassportEtrangerForm";
import { DocumentType } from "@/types/documentTypes";

interface PassportSectionProps {
  documentType: DocumentType;
  isOpen: boolean;
  onToggle: (docType: DocumentType) => void;
}

export const PassportSection = ({ documentType, isOpen, onToggle }: PassportSectionProps) => {
  const getTitle = () => {
    return documentType === 'passeport_marocain' ? 'Passeport Marocain' : 'Passeport Étranger';
  };

  const getDescription = () => {
    return documentType === 'passeport_marocain' 
      ? 'Scan automatique des passeports marocains avec lecture MRZ'
      : 'Scan universel pour tous les passeports étrangers';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {documentType === 'passeport_marocain' ? '🇲🇦' : '🌍'}
            </span>
            {getTitle()}
          </div>
          <Button
            variant="outline"
            onClick={() => onToggle(documentType)}
          >
            {isOpen ? 'Fermer' : 'Ouvrir'}
          </Button>
        </CardTitle>
        <CardDescription>
          {getDescription()}
        </CardDescription>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="space-y-6">
          <PassportScanner documentType={documentType} />
          
          {documentType === 'passeport_marocain' ? (
            <PassportMarocainForm />
          ) : (
            <PassportEtrangerForm />
          )}
        </CardContent>
      )}
    </Card>
  );
};
