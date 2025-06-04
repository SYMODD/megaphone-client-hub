
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

    console.log("🔥 FORM SUBMISSION - DÉBUT SOUMISSION - Validation complète:", {
      formData_complet: formData,
      validation_url: {
        code_barre_image_url: formData.code_barre_image_url,
        type: typeof formData.code_barre_image_url,
        longueur: formData.code_barre_image_url?.length || 0,
        truthy: !!formData.code_barre_image_url,
        non_vide: formData.code_barre_image_url && formData.code_barre_image_url.trim() !== "",
        est_string_valide: typeof formData.code_barre_image_url === 'string' && formData.code_barre_image_url.length > 0,
        preview: formData.code_barre_image_url ? formData.code_barre_image_url.substring(0, 100) + "..." : "AUCUNE URL"
      },
      autres_données: {
        code_barre: formData.code_barre,
        nom: formData.nom,
        prenom: formData.prenom,
        numero_telephone: formData.numero_telephone
      },
      timestamp: new Date().toISOString()
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("❌ ERREUR AUTH:", {
          message: "Utilisateur non authentifié",
          timestamp: new Date().toISOString()
        });
        toast.error("Erreur: Utilisateur non authentifié");
        return;
      }

      console.log("✅ UTILISATEUR AUTHENTIFIÉ:", {
        user_id: user.id,
        email: user.email,
        timestamp: new Date().toISOString()
      });

      // 🎯 TRANSMISSION DIRECTE AVEC VALIDATION RIGOUREUSE
      const dataToInsert = {
        nom: formData.nom,
        prenom: formData.prenom,
        nationalite: formData.nationalite,
        numero_passeport: formData.numero_passeport,
        numero_telephone: formData.numero_telephone,
        code_barre: formData.code_barre,
        code_barre_image_url: formData.code_barre_image_url, // 🔑 TRANSMISSION DIRECTE SANS MODIFICATION
        observations: formData.observations,
        date_enregistrement: formData.date_enregistrement,
        photo_url: formData.photo_url,
        document_type: formData.document_type,
        agent_id: user.id
      };

      console.log("🔥 PRÉPARATION INSERTION - Validation finale avant base:", {
        dataToInsert_complet: dataToInsert,
        validation_finale_url: {
          code_barre_image_url: dataToInsert.code_barre_image_url,
          source_formData: formData.code_barre_image_url,
          correspondance_exacte: formData.code_barre_image_url === dataToInsert.code_barre_image_url,
          type: typeof dataToInsert.code_barre_image_url,
          longueur: dataToInsert.code_barre_image_url?.length || 0,
          validation_pre_insert: dataToInsert.code_barre_image_url ? "✅ URL PRÊTE POUR INSERTION" : "❌ URL VIDE SERA INSÉRÉE",
          verification_transmission: "✅ Transmission directe sans altération"
        },
        timestamp: new Date().toISOString()
      });

      // 🔍 VÉRIFICATION FINALE CRITIQUE
      if (!dataToInsert.code_barre_image_url || dataToInsert.code_barre_image_url.trim() === '') {
        console.warn("⚠️ ALERTE CRITIQUE: URL vide avant insertion en base", {
          formData_url: formData.code_barre_image_url,
          dataToInsert_url: dataToInsert.code_barre_image_url,
          possible_cause: "L'URL s'est perdue quelque part dans le flux",
          timestamp: new Date().toISOString()
        });
      }

      console.log("🔥 APPEL SUPABASE INSERT - Requête finale avec URL:", {
        table: "clients",
        données_envoyées: dataToInsert,
        url_envoyée: dataToInsert.code_barre_image_url,
        statut_url: dataToInsert.code_barre_image_url ? "✅ URL PRÉSENTE POUR INSERTION" : "❌ URL VIDE POUR INSERTION",
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from('clients')
        .insert([dataToInsert])
        .select();

      if (error) {
        console.error("❌ ERREUR INSERTION SUPABASE:", {
          error_details: error,
          error_message: error.message,
          error_code: error.code,
          données_tentées: dataToInsert,
          url_dans_données: dataToInsert.code_barre_image_url,
          timestamp: new Date().toISOString()
        });
        toast.error(`Erreur: ${error.message}`);
        return;
      }

      console.log("🔥 INSERTION RÉUSSIE - Vérification du résultat:", {
        data_retournée: data,
        nombre_enregistrements: data?.length || 0,
        timestamp: new Date().toISOString()
      });

      if (data && data[0]) {
        const savedClient = data[0];
        
        console.log("🔥 VÉRIFICATION POST-INSERTION - Analyse critique finale:", {
          client_id: savedClient.id,
          données_sauvées: savedClient,
          validation_url_sauvée: {
            code_barre_image_url_en_base: savedClient.code_barre_image_url,
            url_envoyée_originale: dataToInsert.code_barre_image_url,
            url_du_formulaire: formData.code_barre_image_url,
            correspondance_envoi_base: savedClient.code_barre_image_url === dataToInsert.code_barre_image_url ? "✅ CORRESPONDANCE PARFAITE" : "❌ DIVERGENCE DÉTECTÉE",
            correspondance_form_base: savedClient.code_barre_image_url === formData.code_barre_image_url ? "✅ FORM = BASE" : "❌ FORM ≠ BASE",
            statut_final: savedClient.code_barre_image_url ? "✅ URL SAUVÉE EN BASE" : "❌ URL VIDE EN BASE",
            analyse_critique: savedClient.code_barre_image_url ? "SUCCESS COMPLET" : "ÉCHEC - URL PERDUE"
          },
          autres_champs_sauvés: {
            code_barre: savedClient.code_barre,
            nom: savedClient.nom,
            prenom: savedClient.prenom,
            numero_telephone: savedClient.numero_telephone
          },
          timestamp: new Date().toISOString()
        });

        if (savedClient.code_barre_image_url) {
          console.log("✅ SUCCÈS COMPLET - URL SAUVÉE:", {
            message: "Client et image sauvegardés avec succès",
            url_confirmée: savedClient.code_barre_image_url,
            résolution: "PROBLÈME RÉSOLU",
            timestamp: new Date().toISOString()
          });
          toast.success("✅ Client et image sauvegardés avec succès !");
        } else {
          console.log("❌ ÉCHEC CRITIQUE - URL PERDUE:", {
            message: "Client enregistré mais URL image nulle en base",
            données_client: savedClient,
            investigation_requise: "URL s'est perdue lors de l'insertion Supabase",
            urgence: "PROBLÈME NON RÉSOLU",
            timestamp: new Date().toISOString()
          });
          toast.error("⚠️ Client enregistré mais image non sauvegardée");
        }
      }

      console.log("🔥 RESET FORMULAIRE - Nettoyage des données:", {
        action: "resetForm() appelée",
        timestamp: new Date().toISOString()
      });

      resetForm();

    } catch (error) {
      console.error("❌ ERREUR GÉNÉRALE SUBMISSION:", {
        error_détails: error,
        error_message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "Pas de stack",
        context: "useFormSubmission.handleSubmit",
        timestamp: new Date().toISOString()
      });
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
      console.log("🔥 SUBMISSION TERMINÉE:", {
        isSubmitting: false,
        timestamp: new Date().toISOString()
      });
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
