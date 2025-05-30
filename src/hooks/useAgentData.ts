
import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useCallback } from "react";

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

// Données simulées avec points d'opération - mémorisées pour éviter les recréations
const mockClients: ClientData[] = [
  { id: 1, nom: "Dubois", prenom: "Marie", nationalite: "France", dateEnregistrement: "2024-01-15", photo: "https://images.unsplash.com/photo-1494790108755-2616b332c8a5?w=100&h=100&fit=crop&crop=face", pointOperation: "aeroport_marrakech" },
  { id: 2, nom: "Benali", prenom: "Ahmed", nationalite: "Algérie", dateEnregistrement: "2024-01-14", pointOperation: "aeroport_casablanca" },
  { id: 3, nom: "Diallo", prenom: "Fatou", nationalite: "Sénégal", dateEnregistrement: "2024-01-13", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", pointOperation: "agence_centrale" },
  { id: 4, nom: "El Mansouri", prenom: "Youssef", nationalite: "Maroc", dateEnregistrement: "2024-01-12", pointOperation: "aeroport_marrakech" },
  { id: 5, nom: "Trabelsi", prenom: "Leila", nationalite: "Tunisie", dateEnregistrement: "2024-01-11", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", pointOperation: "navire_atlas" },
  { id: 6, nom: "Martin", prenom: "Pierre", nationalite: "France", dateEnregistrement: "2024-01-10", pointOperation: "aeroport_marrakech" },
  { id: 7, nom: "Kone", prenom: "Mamadou", nationalite: "Sénégal", dateEnregistrement: "2024-01-09", pointOperation: "aeroport_casablanca" },
  { id: 8, nom: "Bouchard", prenom: "Sophie", nationalite: "France", dateEnregistrement: "2024-01-08", pointOperation: "agence_centrale" },
  { id: 9, nom: "Hassan", prenom: "Omar", nationalite: "Maroc", dateEnregistrement: "2024-01-07", pointOperation: "aeroport_agadir" },
  { id: 10, nom: "Ngozi", prenom: "Amara", nationalite: "Nigeria", dateEnregistrement: "2024-01-06", pointOperation: "navire_meridien" },
  { id: 11, nom: "Laurent", prenom: "Jean", nationalite: "France", dateEnregistrement: "2024-01-05", pointOperation: "aeroport_marrakech" },
  { id: 12, nom: "Abdellah", prenom: "Karim", nationalite: "Algérie", dateEnregistrement: "2024-01-04", pointOperation: "aeroport_casablanca" },
];

const baseColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#6B7280", "#EC4899", "#14B8A6", "#F97316", "#84CC16"];

// Mappings préfixe catégorie mis en cache
const categoryPrefixes: Record<string, string[]> = {
  "aeroport": ["aeroport"],
  "navire": ["navire"],
  "agence": ["agence"]
};

export const useAgentData = (filters?: AdminFilters) => {
  const { profile } = useAuth();

  // Mémorisation des clients filtrés avec optimisation des dépendances
  const filteredClients = useMemo(() => {
    let result = mockClients;

    console.log("Filtering clients with:", { filters, profile: profile?.role });

    // Si c'est un admin ou superviseur avec des filtres
    if (profile && (profile.role === "admin" || profile.role === "superviseur") && filters) {
      console.log("Admin/Superviseur filters applied:", filters);
      
      // Filtrer par catégorie
      if (filters.selectedCategory) {
        const prefixes = categoryPrefixes[filters.selectedCategory] || [];
        if (prefixes.length > 0) {
          result = result.filter(client => 
            prefixes.some(prefix => client.pointOperation.startsWith(prefix))
          );
          console.log("After category filter:", result.length, "clients");
        }
      }

      // Filtrer par point d'opération spécifique
      if (filters.selectedPoint) {
        result = result.filter(
          client => client.pointOperation === filters.selectedPoint
        );
        console.log("After point filter:", result.length, "clients");
      }
    } 
    // Si c'est un agent, filtrer par son point d'opération
    else if (profile && profile.role === "agent") {
      result = mockClients.filter(
        client => client.pointOperation === profile.point_operation
      );
      console.log("Agent filter applied:", result.length, "clients");
    }

    return result;
  }, [profile?.role, profile?.point_operation, filters?.selectedCategory, filters?.selectedPoint]);

  // Mémorisation des statistiques calculées
  const statistics = useMemo(() => {
    const totalClients = filteredClients.length;
    const newThisMonth = Math.ceil(totalClients * 0.2);
    const contractsGenerated = Math.ceil(totalClients * 0.76);

    console.log("Statistics calculated:", { totalClients, newThisMonth, contractsGenerated });

    return { totalClients, newThisMonth, contractsGenerated };
  }, [filteredClients.length]);

  // Mémorisation des données de nationalités
  const nationalityData = useMemo(() => {
    const nationalityCounts = filteredClients.reduce((acc, client) => {
      acc[client.nationalite] = (acc[client.nationalite] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(nationalityCounts).map(([name, value], index) => ({
      name,
      value,
      color: baseColors[index % baseColors.length]
    }));

    console.log("Nationality data calculated:", data);
    return data;
  }, [filteredClients]);

  // Mémorisation des données d'enregistrement
  const registrationData = useMemo(() => {
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

    const registrationMultiplier = Math.max(0.1, statistics.totalClients / 247);
    const data = baseRegistrationData.map(item => ({
      ...item,
      clients: Math.round(item.clients * registrationMultiplier)
    }));

    console.log("Registration data calculated:", data);
    return data;
  }, [statistics.totalClients]);

  // Mémorisation des clients récents
  const recentClients = useMemo(() => {
    const recent = filteredClients
      .sort((a, b) => new Date(b.dateEnregistrement).getTime() - new Date(a.dateEnregistrement).getTime())
      .slice(0, 5);
    
    console.log("Recent clients calculated:", recent);
    return recent;
  }, [filteredClients]);

  // Mémorisation du nombre de nationalités
  const nationalitiesCount = useMemo(() => {
    const count = new Set(filteredClients.map(client => client.nationalite)).size;
    console.log("Nationalities count:", count);
    return count;
  }, [filteredClients]);

  return useMemo(() => ({
    clients: filteredClients,
    totalClients: statistics.totalClients,
    newThisMonth: statistics.newThisMonth,
    contractsGenerated: statistics.contractsGenerated,
    nationalities: nationalitiesCount,
    nationalityData,
    registrationData,
    recentClients
  }), [filteredClients, statistics, nationalitiesCount, nationalityData, registrationData, recentClients]);
};
