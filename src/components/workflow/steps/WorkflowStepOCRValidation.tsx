import React, { useState } from "react";
import { WorkflowStepProps } from "@/types/workflowTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle } from "lucide-react";
import { nationalities } from "@/data/nationalities";

interface FieldType {
  key: string;
  label: string;
  value: any;
  required: boolean;
  type: 'input' | 'select';
}

export const WorkflowStepOCRValidation: React.FC<WorkflowStepProps> = ({
  step,
  isActive,
  isCompleted,
  onComplete,
  onError,
  documentType,
  workflowData,
  onDataUpdate
}) => {
  const { extractedData, scannedImage } = workflowData;
  const [editableData, setEditableData] = useState(extractedData || {});

  // Mettre à jour les données modifiables quand extractedData change
  React.useEffect(() => {
    if (extractedData) {
      // S'assurer que la nationalité par défaut est définie pour les CIN
      const updatedData = {
        ...extractedData,
        nationalite: extractedData.nationalite || (documentType === 'cin' ? 'Maroc' : '')
      };
      setEditableData(updatedData);
    }
  }, [extractedData, documentType]);

  const handleFieldChange = (field: string, value: string) => {
    const newData = { ...editableData, [field]: value };
    setEditableData(newData);
    
    // Mettre à jour les données du workflow en temps réel
    onDataUpdate({ extractedData: newData });
  };

  const handleConfirmData = () => {
    onDataUpdate({ 
      extractedData: editableData,
      canProceedToNext: true 
    });
    console.log("✅ WORKFLOW VALIDATION - Données confirmées");
  };

  const renderExtractedData = () => {
    if (!extractedData) {
      return (
        <div className="text-center py-8">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Aucune donnée extraite disponible</p>
          <p className="text-sm text-gray-500 mt-2">
            Retournez à l'étape précédente pour scanner le document ou saisissez les données manuellement
          </p>
        </div>
      );
    }

         // Champs obligatoires uniformes pour TOUS les documents
     const mandatoryFields: FieldType[] = [
       { key: 'nom', label: 'Nom', value: editableData.nom, required: true, type: 'input' as const },
       { key: 'prenom', label: 'Prénom', value: editableData.prenom, required: true, type: 'input' as const },
       { key: 'nationalite', label: 'Nationalité', value: editableData.nationalite || (documentType === 'cin' ? 'Maroc' : ''), required: true, type: 'select' as const },
     ];

     // Champ numéro de document (adapté selon le type)
     const documentField: FieldType = documentType === 'cin' 
       ? { key: 'numero_cin', label: 'Numéro CIN', value: editableData.numero_cin || editableData.numero_passeport, required: true, type: 'input' as const }
       : documentType === 'carte_sejour'
       ? { key: 'numero_carte', label: 'Numéro Carte de Séjour', value: editableData.numero_carte || editableData.numero_passeport, required: true, type: 'input' as const }
       : { key: 'numero_passeport', label: 'Numéro Passeport', value: editableData.numero_passeport || editableData.numero_cin, required: true, type: 'input' as const };

    // Tous les champs (obligatoires + document uniquement)
    const fields: FieldType[] = [...mandatoryFields, documentField];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <h3 className="text-lg font-semibold">Vérifiez et modifiez les données</h3>
          <Badge variant="outline" className="text-green-600">
            {fields.filter(f => f.value).length} champs remplis
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key} className="text-sm font-medium text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
              
              {field.type === 'select' && field.key === 'nationalite' ? (
                <Select
                  value={field.value || ''}
                  onValueChange={(value) => handleFieldChange(field.key, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez une nationalité" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {nationalities.map((nationality) => (
                      <SelectItem key={nationality} value={nationality}>
                        {nationality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.key}
                  value={field.value || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={`Entrez ${field.label.toLowerCase()}`}
                  className="w-full"
                />
              )}
            </div>
          ))}
        </div>

        {scannedImage && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Image scannée</h4>
            <img 
              src={scannedImage} 
              alt="Document scanné" 
              className="max-w-full h-32 object-cover rounded border"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Validation et saisie des données
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderExtractedData()}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button 
          onClick={handleConfirmData}
          className="bg-green-600 hover:bg-green-700 min-w-[200px]"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Valider les données
        </Button>
      </div>
    </div>
  );
}; 