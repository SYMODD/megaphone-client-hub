
export interface FieldMapping {
  id: string;
  placeholder: string;
  clientField: string;
  description?: string;
  x?: number;
  y?: number;
  fontSize?: number;
}

export interface FieldMappingProps {
  onFieldMappingsChange: (mappings: FieldMapping[]) => void;
  onAnalyzePDF?: () => void;
  initialMappings?: FieldMapping[];
}
