
import { useMemo } from "react";
import { ClientData } from "@/types/agentDataTypes";

export const useAgentFiltering = (clients: any[], profile: any) => {
  // Les clients sont déjà filtrés par la base de données, pas besoin de filtrage côté client
  const filteredClients = useMemo(() => {
    if (!profile) return [];

    // Les agents n'ont accès à aucun client
    if (profile.role === "agent") {
      console.log("👤 Agent - Aucun accès aux clients");
      return [];
    }

    console.log("📊 Clients depuis la base de données (déjà filtrés):", clients.length);
    return clients;
  }, [clients, profile?.role]);

  // Clients récents basés sur les données filtrées
  const recentClients = useMemo(() => {
    return clients
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(client => ({
        id: client.id,
        nom: client.nom,
        prenom: client.prenom,
        nationalite: client.nationalite,
        dateEnregistrement: client.date_enregistrement,
        pointOperation: client.point_operation || "Non défini",
        numeroPasseport: client.numero_passeport || "Non spécifié"
      } as ClientData));
  }, [clients]);

  return {
    filteredClients,
    recentClients
  };
};
