
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ClientFormData } from "./types";

interface UseFormSubmissionProps {
  formData: ClientFormData;
}

export const useFormSubmission = ({ formData }: UseFormSubmissionProps) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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
      scannedImage_present: formData.scannedImage ? "✅ OUI (base64)" : "❌ NON",
      photo_url_present: formData.photo_url ? "✅ OUI (déjà uploadée)" : "❌ NON",
      photo_url_value: formData.photo_url,
      code_barre_image_url_present: formData.code_barre_image_url ? "✅ OUI (image barcode)" : "❌ NON",
      code_barre_image_url_value: formData.code_barre_image_url,
      upload_automatique: "✅ Photo client déjà dans client-photos"
    });

    setIsLoading(true);

    try {
      // 🎉 PLUS BESOIN D'UPLOAD MANUEL - la photo est déjà uploadée automatiquement !
      console.log("🚀 Photo client déjà uploadée automatiquement:", formData.photo_url);

      // Préparation des données avec LES DEUX IMAGES déjà uploadées
      const clientData = {
        nom: formData.nom,
        prenom: formData.prenom,
        nationalite: formData.nationalite,
        numero_passeport: formData.numero_passeport,
        numero_telephone: formData.numero_telephone,
        code_barre: formData.code_barre,
        // 🎯 Image du code-barres (uploadée automatiquement par le scanner)
        code_barre_image_url: formData.code_barre_image_url || null,
        // 🎯 Photo du client (uploadée automatiquement dès le scan)
        photo_url: formData.photo_url || null,
        observations: formData.observations,
        date_enregistrement: formData.date_enregistrement,
        agent_id: user.id,
        document_type: formData.document_type
      };

      console.log("💾 INSERTION CLIENT - Données finales avec DEUX IMAGES AUTOMATIQUES:", {
        nom_complet: `${clientData.prenom} ${clientData.nom}`,
        code_barre: clientData.code_barre || "NON",
        telephone: clientData.numero_telephone || "NON",
        photo_client: clientData.photo_url ? "✅ client-photos (AUTO)" : "❌ NON UPLOADÉE",
        image_barcode: clientData.code_barre_image_url ? "✅ barcode-images (AUTO)" : "❌ NON",
        photo_client_url: clientData.photo_url,
        image_barcode_url: clientData.code_barre_image_url,
        uploads_automatiques: "✅ Les deux images uploadées automatiquement"
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

      console.log("🎉 Client enregistré avec succès avec LES DEUX IMAGES AUTOMATIQUES!");
      
      // Message de succès adaptatif avec détails des deux images
      let successMessage = "Client enregistré avec succès";
      const elements = [];
      if (clientData.photo_url) {
        elements.push("photo du document");
        console.log("✅ Photo client sauvegardée (AUTO):", clientData.photo_url);
      }
      if (clientData.code_barre_image_url) {
        elements.push("image de code-barres");
        console.log("✅ Image barcode sauvegardée (AUTO):", clientData.code_barre_image_url);
      }
      
      if (elements.length > 0) {
        successMessage += ` avec ${elements.join(" et ")} uploadées automatiquement !`;
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
