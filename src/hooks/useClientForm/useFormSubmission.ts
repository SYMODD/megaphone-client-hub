
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ClientFormData } from "./types";

interface UseFormSubmissionProps {
  formData: ClientFormData;
  resetForm: () => void;
}

export const useFormSubmission = ({ formData, resetForm }: UseFormSubmissionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log("🔥 FORM SUBMISSION - DÉBUT avec données complètes:", {
      code_barre: formData.code_barre,
      code_barre_image_url: formData.code_barre_image_url,
      url_présente: formData.code_barre_image_url ? "✅ OUI" : "❌ NON",
      url_longueur: formData.code_barre_image_url?.length,
      toutes_données: formData
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Erreur: Utilisateur non authentifié");
        return;
      }

      // 🎯 TRANSMISSION DIRECTE - Pas de validation qui peut bloquer
      const dataToInsert = {
        nom: formData.nom,
        prenom: formData.prenom,
        nationalite: formData.nationalite,
        numero_passeport: formData.numero_passeport,
        numero_telephone: formData.numero_telephone,
        code_barre: formData.code_barre,
        code_barre_image_url: formData.code_barre_image_url, // 🔑 TRANSMISSION DIRECTE
        observations: formData.observations,
        date_enregistrement: formData.date_enregistrement,
        photo_url: formData.photo_url,
        document_type: formData.document_type,
        agent_id: user.id
      };

      console.log("🔥 INSERTION EN BASE - Données exactes à insérer:", {
        code_barre_image_url: dataToInsert.code_barre_image_url,
        code_barre: dataToInsert.code_barre,
        verification_url: dataToInsert.code_barre_image_url ? "✅ URL PRÉSENTE POUR INSERTION" : "⚠️ URL VIDE MAIS TRANSMISE",
        transmission_directe: "✅ Pas de nettoyage qui peut supprimer l'URL"
      });

      const { data, error } = await supabase
        .from('clients')
        .insert([dataToInsert])
        .select();

      if (error) {
        console.error("❌ Erreur insertion:", error);
        toast.error(`Erreur: ${error.message}`);
        return;
      }

      console.log("🔥 RÉSULTAT INSERTION:", data);

      if (data && data[0]) {
        const savedClient = data[0];
        console.log("🔥 VÉRIFICATION POST-INSERTION:", {
          client_id: savedClient.id,
          code_barre_image_url_sauvé: savedClient.code_barre_image_url,
          succès_sauvegarde: savedClient.code_barre_image_url ? "✅ URL SAUVÉE" : "⚠️ URL VIDE EN BASE",
          correspondance: savedClient.code_barre_image_url === dataToInsert.code_barre_image_url ? "✅ CORRESPONDANCE" : "❌ DIVERGENCE"
        });

        if (savedClient.code_barre_image_url) {
          toast.success("✅ Client et image sauvegardés avec succès !");
        } else {
          toast.success("✅ Client enregistré !");
        }
      }

      resetForm();
    } catch (error) {
      console.error("❌ Erreur générale:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
