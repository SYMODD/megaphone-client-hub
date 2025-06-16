
export interface FieldMapping {
  id: string;
  placeholder: string;
  clientField: string;
  description?: string;
  x?: number;
  y?: number;
  fontSize?: number;
  defaultValue?: string; // Nouvelle propriété pour stocker la valeur par défaut
}

export interface FieldMappingProps {
  onFieldMappingsChange: (mappings: FieldMapping[]) => void;
  onAnalyzePDF?: () => void;
  initialMappings?: FieldMapping[];
}
