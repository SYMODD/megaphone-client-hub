
import { DateRange } from "react-day-picker";

export interface ClientData {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  dateEnregistrement: string;
  pointOperation: string;
  numeroPasseport: string;
  numeroTelephone?: string;
  codeBarre?: string;
  observations?: string;
}

export interface NationalityData {
  name: string;
  value: number;
  color: string;
}

export interface AdminFilters {
  selectedCategory?: string | null;
  selectedPoint?: string | null;
  dateRange?: DateRange | undefined;
}

export interface AgentDataResult {
  clients: ClientData[];
  totalClients: number;
  newThisMonth: number;
  contractsGenerated: number;
  nationalities: number;
  nationalityData: NationalityData[];
  registrationData: any[];
  recentClients: ClientData[];
  loading?: boolean;
}
