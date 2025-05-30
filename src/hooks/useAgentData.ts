
import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useCallback, useEffect } from "react";

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
  { id: 9, nom: "Hassan", prenom: "Omar", nationalite: "Maroc", dateEnregistrement: "2024-01-07", pointOperation: "aeroport_agadir" },
  { id: 10, nom: "Ngozi", prenom: "Amara", nationalite: "Nigeria", dateEnregistrement: "2024-01-06", pointOperation: "navire_meridien" },
  { id: 11, nom: "Laurent", prenom: "Jean", nationalite: "France", dateEnregistrement: "2024-01-05", pointOperation: "aeroport_marrakech" },
  { id: 12, nom: "Abdellah", prenom: "Karim", nationalite: "Algérie", dateEnregistrement: "2024-01-04", pointOperation: "aeroport_casablanca" },
];

const baseColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#6B7280", "#EC4899", "#14B8A6", "#F97316", "#84CC16"];

// Mappings préfixe catégorie
const categoryPrefixes: Record<string, string[]> = {
  "aeroport": ["aeroport"],
  "navire": ["navire"],
  "agence": ["agence"]
};

export const useAgentData = (filters?: AdminFilters) => {
  const { profile } = useAuth();

  // Force re-render when filters change
  useEffect(() => {
    console.log("🔄 FILTERS CHANGED - Force re-render", filters);
  }, [filters?.selectedCategory, filters?.selectedPoint]);

  // Clients filtrés avec logs de debug améliorés
  const filteredClients = useMemo(() => {
    console.log("=== DEBUT FILTRAGE DÉTAILLÉ ===");
    console.log("🔍 Profile:", { role: profile?.role, point: profile?.point_operation });
    console.log("🔍 Filters reçus:", filters);
    console.log("🔍 Total mockClients:", mockClients.length);

    let result = [...mockClients];

    // Si c'est un admin ou superviseur avec des filtres
    if (profile && (profile.role === "admin" || profile.role === "superviseur") && filters) {
      console.log("👑 Mode Admin/Superviseur - Application des filtres...");
      
      // Filtrer par catégorie
      if (filters.selectedCategory && filters.selectedCategory !== "all") {
        const prefixes = categoryPrefixes[filters.selectedCategory] || [];
        console.log("📂 Filtre catégorie:", filters.selectedCategory, "prefixes:", prefixes);
        if (prefixes.length > 0) {
          const beforeLength = result.length;
          result = result.filter(client => 
            prefixes.some(prefix => client.pointOperation.startsWith(prefix))
          );
          console.log(`📊 Après filtre catégorie: ${beforeLength} → ${result.length} clients`);
        }
      }

      // Filtrer par point d'opération spécifique
      if (filters.selectedPoint && filters.selectedPoint !== "all") {
        console.log("📍 Filtre point appliqué:", filters.selectedPoint);
        const beforeLength = result.length;
        result = result.filter(
          client => client.pointOperation === filters.selectedPoint
        );
        console.log(`📊 Après filtre point: ${beforeLength} → ${result.length} clients`);
      }
    } 
    // Si c'est un agent, filtrer par son point d'opération
    else if (profile && profile.role === "agent" && profile.point_operation) {
      console.log("👤 Mode Agent - Filtre pour point:", profile.point_operation);
      const beforeLength = result.length;
      result = mockClients.filter(
        client => client.pointOperation === profile.point_operation
      );
      console.log(`📊 Après filtre agent: ${beforeLength} → ${result.length} clients`);
    }

    console.log("=== RÉSULTAT FINAL ===");
    console.log("✅ Clients filtrés:", result.length);
    console.log("📋 Points représentés:", [...new Set(result.map(c => c.pointOperation))]);
    console.log("🌍 Nationalités:", [...new Set(result.map(c => c.nationalite))]);
    
    return result;
  }, [profile?.role, profile?.point_operation, filters?.selectedCategory, filters?.selectedPoint]);

  // Statistiques calculées - Force re-calculation
  const statistics = useMemo(() => {
    const totalClients = filteredClients.length;
    const newThisMonth = Math.ceil(totalClients * 0.25);
    const contractsGenerated = Math.ceil(totalClients * 0.76);

    console.log("📈 STATISTIQUES CALCULÉES:", { totalClients, newThisMonth, contractsGenerated });
    return { totalClients, newThisMonth, contractsGenerated };
  }, [filteredClients]);

  // Données de nationalités - Force re-calculation
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

    console.log("🎨 DONNÉES NATIONALITÉS:", data);
    return data;
  }, [filteredClients]);

  // Données d'enregistrement
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

    const registrationMultiplier = Math.max(0.1, statistics.totalClients / 300);
    const data = baseRegistrationData.map(item => ({
      ...item,
      clients: Math.round(item.clients * registrationMultiplier)
    }));

    return data;
  }, [statistics.totalClients]);

  // Clients récents
  const recentClients = useMemo(() => {
    return filteredClients
      .sort((a, b) => new Date(b.dateEnregistrement).getTime() - new Date(a.dateEnregistrement).getTime())
      .slice(0, 5);
  }, [filteredClients]);

  // Nombre de nationalités
  const nationalitiesCount = useMemo(() => {
    const count = new Set(filteredClients.map(client => client.nationalite)).size;
    console.log("🌍 NOMBRE DE NATIONALITÉS:", count);
    return count;
  }, [filteredClients]);

  // Debug final
  console.log("🚀 RETOUR useAgentData:", {
    clientsCount: filteredClients.length,
    totalClients: statistics.totalClients,
    nationalitiesCount
  });

  return {
    clients: filteredClients,
    totalClients: statistics.totalClients,
    newThisMonth: statistics.newThisMonth,
    contractsGenerated: statistics.contractsGenerated,
    nationalities: nationalitiesCount,
    nationalityData,
    registrationData,
    recentClients
  };
};
