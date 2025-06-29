
export interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  date_enregistrement: string;
  observations?: string;
  code_barre_image_url?: string;
}

export interface FieldMapping {
  id: string;
  placeholder: string;
  clientField: string;
  description?: string;
  x?: number;
  y?: number;
  fontSize?: number;
  defaultValue?: string;
}

export interface ReplacementData {
  [key: string]: string;
}
