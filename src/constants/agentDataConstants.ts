
import { ClientData, RegistrationData } from "@/types/agentDataTypes";

// Mock client data with operation points
export const mockClients: ClientData[] = [
  {
    id: "1",
    nom: "Dubois",
    prenom: "Marie",
    nationalite: "France",
    dateEnregistrement: "2024-11-15",
    pointOperation: "aeroport_marrakech",
    numeroPasseport: "FR123456789"
  },
  {
    id: "2",
    nom: "Benali",
    prenom: "Ahmed",
    nationalite: "Algérie",
    dateEnregistrement: "2024-12-14",
    pointOperation: "aeroport_casablanca",
    numeroPasseport: "DZ987654321"
  },
  {
    id: "3",
    nom: "Smith",
    prenom: "John",
    nationalite: "États-Unis",
    dateEnregistrement: "2024-10-20",
    pointOperation: "aeroport_agadir",
    numeroPasseport: "US555666777"
  },
  {
    id: "4",
    nom: "Garcia",
    prenom: "Carlos",
    nationalite: "Espagne",
    dateEnregistrement: "2024-09-25",
    pointOperation: "navire_atlas",
    numeroPasseport: "ES111222333"
  },
  {
    id: "5",
    nom: "Müller",
    prenom: "Hans",
    nationalite: "Allemagne",
    dateEnregistrement: "2025-01-10",
    pointOperation: "navire_meridien",
    numeroPasseport: "DE444555666"
  },
  {
    id: "6",
    nom: "Rossi",
    prenom: "Giuseppe",
    nationalite: "Italie",
    dateEnregistrement: "2025-02-05",
    pointOperation: "agence_centrale",
    numeroPasseport: "IT777888999"
  },
  {
    id: "7",
    nom: "Kone",
    prenom: "Mamadou",
    nationalite: "Sénégal",
    dateEnregistrement: "2025-03-09",
    pointOperation: "aeroport_casablanca",
    numeroPasseport: "SN123789456"
  },
  {
    id: "8",
    nom: "Johnson",
    prenom: "Emily",
    nationalite: "Royaume-Uni",
    dateEnregistrement: "2025-04-15",
    pointOperation: "aeroport_marrakech",
    numeroPasseport: "GB654321987"
  },
  {
    id: "9",
    nom: "Silva",
    prenom: "João",
    nationalite: "Portugal",
    dateEnregistrement: "2025-05-12",
    pointOperation: "navire_atlas",
    numeroPasseport: "PT369258147"
  },
  {
    id: "10",
    nom: "Wang",
    prenom: "Li",
    nationalite: "Chine",
    dateEnregistrement: "2025-05-20",
    pointOperation: "agence_centrale",
    numeroPasseport: "CN741852963"
  },
  {
    id: "11",
    nom: "Yamamoto",
    prenom: "Hiroshi",
    nationalite: "Japon",
    dateEnregistrement: "2025-05-28",
    pointOperation: "aeroport_agadir",
    numeroPasseport: "JP159753486"
  },
  {
    id: "12",
    nom: "Abdellah",
    prenom: "Karim",
    nationalite: "Algérie",
    dateEnregistrement: "2025-06-01",
    pointOperation: "aeroport_casablanca",
    numeroPasseport: "DZ852741963"
  }
];

export const baseColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#6B7280", "#EC4899", "#14B8A6", "#F97316", "#84CC16"];

// Category prefixes mapping
export const categoryPrefixes: Record<string, string[]> = {
  "aeroport": ["aeroport"],
  "navire": ["navire"],
  "agence": ["agence"]
};

// Base registration data template
export const baseRegistrationData: RegistrationData[] = [
  { month: "Jan", clients: 12 },
  { month: "Fév", clients: 19 },
  { month: "Mar", clients: 15 },
  { month: "Avr", clients: 25 },
  { month: "Mai", clients: 22 },
  { month: "Jun", clients: 30 },
  { month: "Jul", clients: 28 },
  { month: "Aoû", clients: 35 },
  { month: "Sep", clients: 31 },
  { month: "Oct", clients: 40 },
  { month: "Nov", clients: 38 },
  { month: "Déc", clients: 23 },
];
