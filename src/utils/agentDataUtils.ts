
import { ClientData, NationalityData, AdminFilters } from "@/types/agentDataTypes";
import { mockClients, baseColors, categoryPrefixes } from "@/constants/agentDataConstants";

export const filterClientsByRole = (
  profileRole: string | undefined,
  profilePointOperation: string | undefined,
  filters?: AdminFilters
): ClientData[] => {
  console.log("=== FILTRAGE ===");
  console.log("🔍 Profile:", { role: profileRole, point: profilePointOperation });
  console.log("🔍 Filters reçus:", filters);
  console.log("🔍 Total mockClients:", mockClients.length);

  let result = [...mockClients];

  // Si c'est un admin ou superviseur avec des filtres
  if (profileRole && (profileRole === "admin" || profileRole === "superviseur") && filters) {
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
  else if (profileRole && profileRole === "agent" && profilePointOperation) {
    console.log("👤 Mode Agent - Filtre pour point:", profilePointOperation);
    const beforeLength = result.length;
    result = mockClients.filter(
      client => client.pointOperation === profilePointOperation
    );
    console.log(`📊 Après filtre agent: ${beforeLength} → ${result.length} clients`);
  }

  console.log("=== RÉSULTAT FINAL ===");
  console.log("✅ Clients filtrés:", result.length);
  console.log("📋 Points représentés:", [...new Set(result.map(c => c.pointOperation))]);
  console.log("🌍 Nationalités:", [...new Set(result.map(c => c.nationalite))]);
  
  return result;
};

export const calculateStatistics = (clients: ClientData[]) => {
  const totalClients = clients.length;
  const newThisMonth = Math.ceil(totalClients * 0.25);
  const contractsGenerated = Math.ceil(totalClients * 0.76);

  console.log("📈 STATISTIQUES CALCULÉES:", { totalClients, newThisMonth, contractsGenerated });
  return { totalClients, newThisMonth, contractsGenerated };
};

export const generateNationalityData = (clients: ClientData[]): NationalityData[] => {
  const nationalityCounts = clients.reduce((acc, client) => {
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
};

export const getRecentClients = (clients: ClientData[]): ClientData[] => {
  return clients
    .sort((a, b) => new Date(b.dateEnregistrement).getTime() - new Date(a.dateEnregistrement).getTime())
    .slice(0, 5);
};

export const getNationalitiesCount = (clients: ClientData[]): number => {
  const count = new Set(clients.map(client => client.nationalite)).size;
  console.log("🌍 NOMBRE DE NATIONALITÉS:", count);
  return count;
};
