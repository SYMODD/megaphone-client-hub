
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

    console.log("🔥 FORM SUBMISSION - VALIDATION PAYLOAD CRITIQUE:", {
      formData_complet: formData,
      validation_url_critique: {
        code_barre_image_url: formData.code_barre_image_url,
        type: typeof formData.code_barre_image_url,
        longueur: formData.code_barre_image_url?.length || 0,
        truthy: !!formData.code_barre_image_url,
        non_vide: formData.code_barre_image_url && formData.code_barre_image_url.trim() !== "",
        preview: formData.code_barre_image_url ? formData.code_barre_image_url.substring(0, 100) + "..." : "AUCUNE URL",
        status_critique: formData.code_barre_image_url ? "✅ URL DÉTECTÉE POUR INSERTION" : "❌ URL MANQUANTE - ARRÊT NÉCESSAIRE"
      },
      autres_données_importantes: {
        code_barre: formData.code_barre,
        nom: formData.nom,
        prenom: formData.prenom
      }
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("❌ ERREUR AUTH: Utilisateur non authentifié");
        toast.error("Erreur: Utilisateur non authentifié");
        return;
      }

      console.log("✅ UTILISATEUR AUTHENTIFIÉ:", user.id);

      // 🎯 PAYLOAD SUPABASE AVEC VALIDATION FINALE
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

      // 🚨 VALIDATION FINALE CRITIQUE AVANT INSERTION
      console.log("🔥 PAYLOAD FINAL ENVOYÉ À SUPABASE:", {
        dataToInsert_complet: dataToInsert,
        validation_finale_url: {
          valeur_exacte: dataToInsert.code_barre_image_url,
          type: typeof dataToInsert.code_barre_image_url,
          longueur: dataToInsert.code_barre_image_url?.length || 0,
          sera_null: dataToInsert.code_barre_image_url === null || dataToInsert.code_barre_image_url === undefined,
          sera_vide: dataToInsert.code_barre_image_url === "",
          validation: dataToInsert.code_barre_image_url ? "✅ URL VALIDE POUR INSERTION" : "❌ URL NULLE/VIDE",
          preview: dataToInsert.code_barre_image_url ? dataToInsert.code_barre_image_url.substring(0, 150) + "..." : "AUCUNE URL"
        },
        payload_size: Object.keys(dataToInsert).length,
        insertion_imminente: "DANS 3...2...1..."
      });

      // 🔥 INSERTION SUPABASE AVEC SUIVI COMPLET
      console.log("🔥 APPEL SUPABASE INSERT IMMÉDIAT:", {
        table: "clients",
        action: "insert",
        url_dans_payload: dataToInsert.code_barre_image_url,
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from('clients')
        .insert([dataToInsert])
        .select();

      if (error) {
        console.error("❌ ERREUR INSERTION SUPABASE:", {
          error_details: error,
          payload_tenté: dataToInsert,
          url_dans_payload: dataToInsert.code_barre_image_url
        });
        toast.error(`Erreur: ${error.message}`);
        return;
      }

      console.log("🔥 INSERTION RÉUSSIE - VÉRIFICATION RÉSULTAT:", {
        data_retournée: data,
        nombre_enregistrements: data?.length || 0
      });

      if (data && data[0]) {
        const savedClient = data[0];
        
        console.log("🔥 VÉRIFICATION POST-INSERTION CRITIQUE:", {
          client_id: savedClient.id,
          validation_url_sauvée: {
            code_barre_image_url_en_base: savedClient.code_barre_image_url,
            url_envoyée: dataToInsert.code_barre_image_url,
            url_form: formData.code_barre_image_url,
            correspondance_parfaite: savedClient.code_barre_image_url === dataToInsert.code_barre_image_url,
            statut_final: savedClient.code_barre_image_url ? "✅ URL SAUVÉE EN BASE" : "❌ URL PERDUE",
            analyse: savedClient.code_barre_image_url ? "SUCCESS COMPLET" : "ÉCHEC MYSTÉRIEUX"
          },
          données_complètes: savedClient
        });

        if (savedClient.code_barre_image_url) {
          console.log("✅ SUCCÈS TOTAL - URL SAUVÉE:", savedClient.code_barre_image_url);
          toast.success("✅ Client et image sauvegardés avec succès !");
        } else {
          console.error("❌ PROBLÈME SYSTÈME - URL PERDUE:", {
            expected: dataToInsert.code_barre_image_url,
            actual: savedClient.code_barre_image_url,
            issue: "URL était présente avant insertion mais absente après"
          });
          toast.error("⚠️ Client sauvé mais problème avec l'image");
        }
      }

      resetForm();

    } catch (error) {
      console.error("❌ ERREUR GÉNÉRALE:", error);
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
