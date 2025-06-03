
export interface ClientData {
  id: number;
  nom: string;
  prenom: string;
  nationalite: string;
  dateEnregistrement: string;
  photo?: string | null;
  pointOperation: string;
  code_barre?: string | null;
}

export interface NationalityData {
  name: string;
  value: number;
  color: string;
}

export interface RegistrationData {
  month: string;
  clients: number;
}

export interface AdminFilters {
  selectedPoint?: string | null;
  selectedCategory?: string | null;
}

export interface AgentDataStatistics {
  totalClients: number;
  newThisMonth: number;
  contractsGenerated: number;
  nationalities: number;
}

export interface AgentDataResult {
  clients: ClientData[];
  totalClients: number;
  newThisMonth: number;
  contractsGenerated: number;
  nationalities: number;
  nationalityData: NationalityData[];
  registrationData: RegistrationData[];
  recentClients: ClientData[];
}
