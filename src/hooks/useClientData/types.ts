export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationalite: string;
  created_at: string;
  status?: string;
  category?: string;
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
