
export interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  numero_telephone?: string;
  code_barre?: string;
  code_barre_image_url?: string;
  observations?: string;
  date_enregistrement: string;
  photo_url?: string;
  document_type: 'cin' | 'passport_marocain' | 'passport_etranger' | 'carte_sejour';
  agent_id: string;
  created_at: string;
  updated_at: string;
  point_operation?: string; // 🔥 NEW: Ajout du champ point_operation
  categorie?: string; // 🔥 NEW: Ajout du champ categorie
}

export interface ClientFilters {
  searchTerm: string;
  nationality: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}
