
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadClientPhoto } from "@/utils/storageUtils";
import { ClientFormData } from "./types";

interface UseFormSubmissionProps {
  formData: ClientFormData;
  navigate: (path: string) => void;
}

export const useFormSubmission = ({ formData, navigate }: UseFormSubmissionProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour ajouter un client");
      return;
    }

    // Validation des champs obligatoires
    if (!formData.nom || !formData.prenom || !formData.numero_passeport) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);

    try {
      console.log("💾 FORM SUBMISSION - Données à sauvegarder:", {
        ...formData,
        code_barre_image_url_presente: formData.code_barre_image_url ? "✅ OUI" : "❌ NON",
        url_length: formData.code_barre_image_url?.length || 0
      });
      
      let photoUrl = null;
      
      if (formData.scannedImage) {
        photoUrl = await uploadClientPhoto(formData.scannedImage, 'cin');
        if (!photoUrl) {
          toast.error("Erreur lors du téléchargement de l'image. Enregistrement sans photo.");
        }
      }

      // Préparer les données pour l'insertion
      const clientData = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        nationalite: formData.nationalite,
        numero_passeport: formData.numero_passeport.trim(),
        numero_telephone: formData.numero_telephone.trim() || null,
        code_barre: formData.code_barre.trim() || null,
        code_barre_image_url: formData.code_barre_image_url || null, // 🎯 CRUCIAL
        photo_url: photoUrl,
        observations: formData.observations || null,
        date_enregistrement: formData.date_enregistrement,
        agent_id: user.id
      };

      console.log("💾 CLIENT DATA FINAL - Données finales à insérer:", {
        ...clientData,
        code_barre_image_url_finale: clientData.code_barre_image_url ? "✅ PRÉSENTE" : "❌ ABSENTE"
      });

      const { error } = await supabase
        .from('clients')
        .insert(clientData);

      if (error) {
        console.error('❌ Erreur insertion client:', error);
        if (error.code === '23505') {
          toast.error("Ce numéro de passeport existe déjà dans la base de données");
        } else {
          toast.error(`Erreur lors de l'enregistrement du client: ${error.message}`);
        }
        return;
      }

      toast.success("Client enregistré avec succès!");
      navigate("/");
    } catch (error) {
      console.error('❌ Erreur inattendue:', error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSubmit
  };
};
