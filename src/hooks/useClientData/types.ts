
export interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  code_barre: string | null;
  date_enregistrement: string;
  photo_url?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
  agent_id: string;
}

export interface ClientFilters {
  searchTerm: string;
  nationality: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

export interface PaginationState {
  currentPage: number;
  totalCount: number;
  totalPages: number;
}
