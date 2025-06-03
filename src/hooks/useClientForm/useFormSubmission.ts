
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

    console.log("📝 SOUMISSION FORMULAIRE - Analyse des données:", {
      nom: formData.nom,
      prenom: formData.prenom,
      code_barre: formData.code_barre,
      numero_telephone: formData.numero_telephone,
      scannedImage_present: formData.scannedImage ? "✅ OUI (photo client)" : "❌ NON",
      code_barre_image_url_present: formData.code_barre_image_url ? "✅ OUI (image barcode)" : "❌ NON",
      buckets_separes: "✅ client-photos + barcode-images"
    });

    setIsLoading(true);

    try {
      let photoUrl = null;
      
      // Upload UNIQUEMENT de la photo du client (document d'identité)
      // Cette image va vers client-photos et devient photo_url
      if (formData.scannedImage) {
        console.log("📤 Upload photo CLIENT vers client-photos...");
        console.log("🎯 Type: Photo du document d'identité du client");
        photoUrl = await uploadClientPhoto(formData.scannedImage);
        console.log("✅ Photo client uploadée:", photoUrl);
      }

      // Préparation des données avec SÉPARATION TOTALE des images
      const clientData = {
        nom: formData.nom,
        prenom: formData.prenom,
        nationalite: formData.nationalite,
        numero_passeport: formData.numero_passeport,
        numero_telephone: formData.numero_telephone,
        code_barre: formData.code_barre,
        // 🎯 Image du code-barres (déjà uploadée dans barcode-images par le scanner)
        code_barre_image_url: formData.code_barre_image_url || null,
        // 🎯 Photo du client (uploadée maintenant dans client-photos)
        photo_url: photoUrl,
        observations: formData.observations,
        date_enregistrement: formData.date_enregistrement,
        agent_id: user.id,
        document_type: formData.document_type
      };

      console.log("💾 INSERTION CLIENT - Données finales avec séparation complète:", {
        nom_complet: `${clientData.prenom} ${clientData.nom}`,
        code_barre: clientData.code_barre || "NON",
        telephone: clientData.numero_telephone || "NON",
        photo_client: clientData.photo_url ? "✅ client-photos" : "❌ NON",
        image_barcode: clientData.code_barre_image_url ? "✅ barcode-images" : "❌ NON",
        buckets_utilises: [
          clientData.photo_url ? "client-photos" : null,
          clientData.code_barre_image_url ? "barcode-images" : null
        ].filter(Boolean).join(" + ") || "Aucun"
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

      console.log("🎉 Client enregistré avec succès!");
      
      // Message de succès adaptatif
      let successMessage = "Client enregistré avec succès";
      const elements = [];
      if (clientData.photo_url) elements.push("photo du document");
      if (clientData.code_barre_image_url) elements.push("image de code-barres");
      
      if (elements.length > 0) {
        successMessage += ` avec ${elements.join(" et ")}!`;
      } else {
        successMessage += "!";
      }
      
      toast.success(successMessage);
      navigate("/base-clients");
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
