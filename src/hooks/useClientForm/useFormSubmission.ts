
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

    console.log("📝 FORM SUBMISSION - Début soumission avec données:", {
      code_barre: formData.code_barre,
      code_barre_image_url: formData.code_barre_image_url,
      photo_url: formData.photo_url,
      numero_telephone: formData.numero_telephone
    });

    try {
      // 🔥 VÉRIFICATION CRITIQUE: S'assurer que toutes les URLs sont présentes
      const dataToInsert = {
        nom: formData.nom,
        prenom: formData.prenom,
        nationalite: formData.nationalite,
        numero_passeport: formData.numero_passeport,
        numero_telephone: formData.numero_telephone,
        code_barre: formData.code_barre,
        code_barre_image_url: formData.code_barre_image_url, // 🔥 INCLUSION EXPLICITE
        observations: formData.observations,
        date_enregistrement: formData.date_enregistrement,
        photo_url: formData.photo_url
      };

      console.log("💾 FORM SUBMISSION - Données à insérer en base:", dataToInsert);

      const { data, error } = await supabase
        .from('clients')
        .insert([dataToInsert])
        .select();

      if (error) {
        console.error("❌ Erreur insertion client:", error);
        toast.error(`Erreur lors de l'enregistrement: ${error.message}`);
        return;
      }

      console.log("✅ Client enregistré avec succès:", data);

      // 🔥 VÉRIFICATION POST-INSERTION: Vérifier que l'URL a bien été sauvegardée
      if (data && data[0]) {
        const savedClient = data[0];
        console.log("🔍 VÉRIFICATION POST-INSERTION:", {
          client_id: savedClient.id,
          code_barre_sauvegarde: savedClient.code_barre,
          code_barre_image_url_sauvegarde: savedClient.code_barre_image_url,
          url_correctement_sauvegardee: savedClient.code_barre_image_url ? "✅ OUI" : "❌ NON"
        });

        if (formData.code_barre_image_url && !savedClient.code_barre_image_url) {
          console.error("❌ ERREUR CRITIQUE: URL image perdue lors de la sauvegarde!", {
            url_originale: formData.code_barre_image_url,
            url_sauvegardee: savedClient.code_barre_image_url
          });
        }
      }

      toast.success("✅ Client enregistré avec succès !");
      resetForm();
    } catch (error) {
      console.error("❌ Erreur générale:", error);
      toast.error("Erreur lors de l'enregistrement du client");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
