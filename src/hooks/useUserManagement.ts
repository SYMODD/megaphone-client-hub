
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];
type PointOperation = Database["public"]["Enums"]["point_operation"];
type UserStatus = Database["public"]["Enums"]["user_status"];

interface OperationPoint {
  id: string;
  nom: string;
  code: string;
  categorie_id: string;
  actif: boolean;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [operationPoints, setOperationPoints] = useState<OperationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    setUsers(data || []);
  };

  const fetchOperationPoints = async () => {
    const { data, error } = await supabase
      .from("points_operation")
      .select("*")
      .eq("actif", true)
      .order("nom");

    if (error) throw error;
    setOperationPoints(data || []);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUsers(),
        fetchOperationPoints()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      fetchUsers();
      alert("Profil utilisateur supprimé avec succès !");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      setError(error.message || "Erreur lors de la suppression de l'utilisateur");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    users,
    operationPoints,
    loading,
    error,
    setError,
    fetchUsers,
    fetchOperationPoints,
    deleteUser,
    refetch: fetchData
  };
};
