import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin, isAdminClientAvailable } from "@/integrations/supabase/admin-client";
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
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action supprimera complètement l'utilisateur de Supabase.")) return;

    try {
      console.log("🗑️ Deleting user:", userId);

      // Vérifier si le client admin est disponible
      if (!isAdminClientAvailable()) {
        console.warn("⚠️ Client admin non disponible. Seul le profil sera supprimé.");
        alert("⚠️ Configuration incomplète : l'utilisateur ne sera supprimé que de la liste, pas complètement de Supabase. Contactez l'administrateur système.");
      }

      // Étape 1: Supprimer le profil
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (profileError) {
        console.error("Error deleting profile:", profileError);
        throw profileError;
      }

      console.log("✅ Profile deleted successfully");

      // Étape 2: Supprimer l'utilisateur de auth.users (admin API)
      if (isAdminClientAvailable() && supabaseAdmin) {
        try {
          const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

          if (authError) {
            console.error("Error deleting auth user:", authError);
            // Ne pas faire échouer complètement si la suppression auth échoue
            console.warn("Profile deleted but auth user deletion failed:", authError.message);
            alert(`⚠️ Profil supprimé mais problème avec la suppression complète: ${authError.message}`);
          } else {
            console.log("✅ Auth user deleted successfully");
            alert("✅ Utilisateur supprimé complètement avec succès !");
          }
        } catch (adminError) {
          console.error("Admin deletion error:", adminError);
          alert("⚠️ Profil supprimé mais erreur lors de la suppression auth. Vérifiez la configuration admin.");
        }
      }

      fetchUsers();
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
