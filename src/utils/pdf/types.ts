
export interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  date_enregistrement: string;
  observations?: string;
}

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

export interface ReplacementData {
  [key: string]: string;
}
