export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationalite: string;
  created_at: string;
  status?: string;
  category?: string;
  // Propriétés étendues pour compatibilité
  prenom?: string;
  nom?: string;
  numero_telephone?: string;
  numero_passeport?: string;
  document_type?: string;
  point_operation?: string;
  categorie?: string;
  date_enregistrement?: string;
  updated_at?: string;
  photo_url?: string;
  code_barre_image_url?: string;
}

export interface ClientFilters {
  searchTerm?: string;
  nationality?: string;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  status?: string;
  category?: string;
  sortBy?: string;
}

export interface FetchClientsResult {
  clients: Client[];
  totalCount: number;
  totalPages: number;
  shouldGoToPreviousPage?: boolean;
  newPage?: number;
}
