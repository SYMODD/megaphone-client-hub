
import React from 'react';
import { Button } from "@/components/ui/button";
import { Target, MapPin, Plus } from "lucide-react";

interface FieldMappingActionsProps {
  onAddPresetFields: () => void;
  onAnalyzePDF?: () => void;
  onAddCustomField: () => void;
}

export const FieldMappingActions = ({ 
  onAddPresetFields, 
  onAnalyzePDF, 
  onAddCustomField 
}: FieldMappingActionsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={onAddPresetFields} variant="outline" className="flex-1">
          <Target className="w-4 h-4 mr-2" />
          Ajouter champs prédéfinis
        </Button>
        {onAnalyzePDF && (
          <Button onClick={onAnalyzePDF} variant="outline" className="flex-1">
            <MapPin className="w-4 h-4 mr-2" />
            Analyser PDF
          </Button>
        )}
      </div>

      <Button onClick={onAddCustomField} variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Ajouter un champ personnalisé
      </Button>
    </div>
  );
};
