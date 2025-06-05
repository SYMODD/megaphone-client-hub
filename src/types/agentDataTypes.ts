
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
  categorie?: string; // 🎯 AJOUT DE LA CATÉGORIE
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
  registrationData: RegistrationData[];
  recentClients: ClientData[];
  loading?: boolean;
}
