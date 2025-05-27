import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

// Types pour les données simulées
interface ClientData {
  id: number;
  nom: string;
  prenom: string;
  nationalite: string;
  dateEnregistrement: string;
  photo?: string | null;
  pointOperation: string;
}

interface NationalityData {
  name: string;
  value: number;
  color: string;
}

interface RegistrationData {
  month: string;
  clients: number;
}

interface AdminFilters {
  selectedPoint?: string | null;
  selectedCategory?: string | null;
}

// Données simulées avec points d'opération
const mockClients: ClientData[] = [
  { id: 1, nom: "Dubois", prenom: "Marie", nationalite: "France", dateEnregistrement: "2024-01-15", photo: "https://images.unsplash.com/photo-1494790108755-2616b332c8a5?w=100&h=100&fit=crop&crop=face", pointOperation: "aeroport_marrakech" },
  { id: 2, nom: "Benali", prenom: "Ahmed", nationalite: "Algérie", dateEnregistrement: "2024-01-14", pointOperation: "aeroport_casablanca" },
  { id: 3, nom: "Diallo", prenom: "Fatou", nationalite: "Sénégal", dateEnregistrement: "2024-01-13", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", pointOperation: "agence_centrale" },
  { id: 4, nom: "El Mansouri", prenom: "Youssef", nationalite: "Maroc", dateEnregistrement: "2024-01-12", pointOperation: "aeroport_marrakech" },
  { id: 5, nom: "Trabelsi", prenom: "Leila", nationalite: "Tunisie", dateEnregistrement: "2024-01-11", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", pointOperation: "navire_atlas" },
  { id: 6, nom: "Martin", prenom: "Pierre", nationalite: "France", dateEnregistrement: "2024-01-10", pointOperation: "aeroport_marrakech" },
  { id: 7, nom: "Kone", prenom: "Mamadou", nationalite: "Sénégal", dateEnregistrement: "2024-01-09", pointOperation: "aeroport_casablanca" },
  { id: 8, nom: "Bouchard", prenom: "Sophie", nationalite: "France", dateEnregistrement: "2024-01-08", pointOperation: "agence_centrale" },
];

const baseNationalityData: NationalityData[] = [
  { name: "France", value: 85, color: "#3B82F6" },
  { name: "Algérie", value: 45, color: "#10B981" },
  { name: "Maroc", value: 38, color: "#F59E0B" },
  { name: "Tunisie", value: 25, color: "#EF4444" },
  { name: "Sénégal", value: 20, color: "#8B5CF6" },
  { name: "Autres", value: 34, color: "#6B7280" },
];

const baseRegistrationData: RegistrationData[] = [
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

export const useAgentData = (filters?: AdminFilters) => {
  const { profile } = useAuth();

  return useMemo(() => {
    let filteredClients = mockClients;

    // Si c'est un admin ou superviseur avec des filtres
    if (profile && (profile.role === "admin" || profile.role === "superviseur") && filters) {
      // Filtrer par catégorie
      if (filters.selectedCategory) {
        const categoryPrefixes: Record<string, string[]> = {
          "aeroport": ["aeroport"],
          "navire": ["navire"],
          "agence": ["agence"]
        };
        
        const prefixes = categoryPrefixes[filters.selectedCategory] || [];
        if (prefixes.length > 0) {
          filteredClients = filteredClients.filter(client => 
            prefixes.some(prefix => client.pointOperation.startsWith(prefix))
          );
        }
      }

      // Filtrer par point d'opération spécifique
      if (filters.selectedPoint) {
        filteredClients = filteredClients.filter(
          client => client.pointOperation === filters.selectedPoint
        );
      }
    } 
    // Si c'est un agent, filtrer par son point d'opération
    else if (profile && profile.role === "agent") {
      filteredClients = mockClients.filter(
        client => client.pointOperation === profile.point_operation
      );
    }

    // Calculer les statistiques basées sur les clients filtrés
    const totalClients = filteredClients.length;
    const newThisMonth = Math.ceil(totalClients * 0.2);
    const contractsGenerated = Math.ceil(totalClients * 0.76);

    // Calculer les nationalités pour les clients filtrés
    const nationalityCounts = filteredClients.reduce((acc, client) => {
      acc[client.nationalite] = (acc[client.nationalite] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const nationalityData = Object.entries(nationalityCounts).map(([name, value], index) => ({
      name,
      value,
      color: baseNationalityData[index % baseNationalityData.length]?.color || "#6B7280"
    }));

    // Ajuster les données d'enregistrement proportionnellement
    const registrationMultiplier = totalClients / 247;
    const registrationData = baseRegistrationData.map(item => ({
      ...item,
      clients: Math.round(item.clients * registrationMultiplier)
    }));

    return {
      clients: filteredClients,
      totalClients,
      newThisMonth,
      contractsGenerated,
      nationalities: Object.keys(nationalityCounts).length,
      nationalityData,
      registrationData,
      recentClients: filteredClients.slice(0, 5)
    };
  }, [profile, filters]);
};
