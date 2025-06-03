
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ClientFormData } from "./types";
import { useImageUpload } from "../useImageUpload";

interface UseFormSubmissionProps {
  formData: ClientFormData;
}

export const useFormSubmission = ({ formData }: UseFormSubmissionProps) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { uploadClientPhoto } = useImageUpload();

  const handleSubmit = async () => {
    if (!user || !profile) {
      toast.error("Vous devez être connecté pour ajouter un client");
      return;
    }

    console.log("📝 SOUMISSION FORMULAIRE - Données à sauvegarder:", {
      nom: formData.nom,
      prenom: formData.prenom,
      code_barre: formData.code_barre,
      code_barre_image_url: formData.code_barre_image_url,
      numero_telephone: formData.numero_telephone,
      scannedImage: formData.scannedImage ? "présent" : "absent"
    });

    setIsLoading(true);

    try {
      let photoUrl = null;
      
      // Upload de la photo du client seulement si on a une image scannée ET pas déjà d'URL d'image de code-barres
      // Cela évite de dupliquer l'image
      if (formData.scannedImage && !formData.code_barre_image_url) {
        console.log("📤 Upload de l'image scannée comme photo client...");
        photoUrl = await uploadClientPhoto(formData.scannedImage);
        console.log("✅ Photo client uploadée:", photoUrl);
      }

      // Préparer les données client
      const clientData = {
        nom: formData.nom,
        prenom: formData.prenom,
        nationalite: formData.nationalite,
        numero_passeport: formData.numero_passeport,
        numero_telephone: formData.numero_telephone,
        code_barre: formData.code_barre,
        code_barre_image_url: formData.code_barre_image_url || null,
        photo_url: photoUrl,
        observations: formData.observations,
        date_enregistrement: formData.date_enregistrement,
        agent_id: user.id,
        document_type: formData.document_type
      };

      console.log("💾 INSERTION CLIENT - Données complètes:", {
        ...clientData,
        code_barre_image_url: clientData.code_barre_image_url ? "PRÉSENT" : "ABSENT",
        photo_url: clientData.photo_url ? "PRÉSENT" : "ABSENT"
      });

      const { error } = await supabase
        .from('clients')
        .insert(clientData);

      if (error) {
        console.error('❌ Erreur insertion client:', error);
        if (error.code === '23505') {
          toast.error("Ce numéro de passeport existe déjà");
        } else {
          toast.error("Erreur lors de l'enregistrement du client");
        }
        return;
      }

      console.log("✅ Client enregistré avec succès!");
      
      const successMessage = formData.code_barre_image_url 
        ? "Client enregistré avec succès avec image de code-barres!"
        : "Client enregistré avec succès!";
      
      toast.success(successMessage);
      navigate("/base-clients");
    } catch (error) {
      console.error('❌ Erreur:', error);
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
