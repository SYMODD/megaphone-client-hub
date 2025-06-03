
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ClientFormData } from "./types";

interface UseFormSubmissionProps {
  formData: ClientFormData;
}

export const useFormSubmission = ({ formData }: UseFormSubmissionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour enregistrer un client.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.nom || !formData.prenom) {
      toast({
        title: "Erreur de validation",
        description: "Le nom et le prénom sont obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("=== DÉBUT SAUVEGARDE CLIENT ===");
      console.log("Données à sauvegarder:", {
        ...formData,
        code_barre_image_url: formData.code_barre_image_url || "NON DÉFINIE"
      });

      // CORRECTION: Nettoyer et valider les données avant sauvegarde
      const clientData = {
        agent_id: user.id, // CORRECTION CRUCIALE: Ajouter l'agent_id requis
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        nationalite: formData.nationalite?.trim() || null,
        numero_passeport: formData.numero_passeport?.trim() || null,
        numero_telephone: formData.numero_telephone?.trim() || null,
        code_barre: formData.code_barre?.trim() || null,
        // CORRECTION CRUCIALE: S'assurer que l'URL de l'image est bien transmise
        code_barre_image_url: formData.code_barre_image_url?.trim() || null,
        observations: formData.observations?.trim() || null,
        date_enregistrement: formData.date_enregistrement,
        document_type: formData.document_type || null
      };

      console.log("Données nettoyées pour sauvegarde:", clientData);

      // CORRECTION: Passer l'objet directement, pas dans un tableau
      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select();

      if (error) {
        console.error("❌ Erreur Supabase lors de la sauvegarde:", error);
        throw error;
      }

      console.log("✅ Client sauvegardé avec succès:", data);
      
      // Vérifier que l'image du code-barres a bien été sauvegardée
      if (clientData.code_barre_image_url) {
        console.log("✅ URL de l'image du code-barres sauvegardée:", clientData.code_barre_image_url);
      } else {
        console.warn("⚠️ Aucune URL d'image du code-barres à sauvegarder");
      }

      toast({
        title: "Client enregistré",
        description: `${clientData.prenom} ${clientData.nom} a été ajouté avec succès.`,
      });

      navigate("/clients");
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Une erreur est survenue lors de l'enregistrement du client.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSubmit
  };
};
