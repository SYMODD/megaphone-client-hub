
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

      // 🎯 PRÉPARATION PAYLOAD AVEC VÉRIFICATION ULTRA-RIGOUREUSE
      const dataToInsert = {
        nom: formData.nom,
        prenom: formData.prenom,
        nationalite: formData.nationalite,
        numero_passeport: formData.numero_passeport,
        numero_telephone: formData.numero_telephone,
        code_barre: formData.code_barre,
        code_barre_image_url: formData.code_barre_image_url, // 🔑 INCLUSION EXPLICITE SANS FILTRAGE
        observations: formData.observations,
        date_enregistrement: formData.date_enregistrement,
        photo_url: formData.photo_url,
        document_type: formData.document_type,
        agent_id: user.id
      };

      // 🔥 VALIDATION CRITIQUE AVANT INSERTION
      const isUrlValid = dataToInsert.code_barre_image_url && 
                        typeof dataToInsert.code_barre_image_url === 'string' && 
                        dataToInsert.code_barre_image_url.trim() !== '';

      console.log("🔥 PAYLOAD ENVOYÉ À SUPABASE - Validation finale CRITIQUE:", {
        dataToInsert_complet: dataToInsert,
        champs_critiques: {
          code_barre_image_url: dataToInsert.code_barre_image_url,
          code_barre: dataToInsert.code_barre,
          nom: dataToInsert.nom,
          prenom: dataToInsert.prenom
        },
        validation_finale_url: {
          valeur: dataToInsert.code_barre_image_url,
          type: typeof dataToInsert.code_barre_image_url,
          longueur: dataToInsert.code_barre_image_url?.length || 0,
          sera_null_en_base: dataToInsert.code_barre_image_url === null || dataToInsert.code_barre_image_url === undefined,
          sera_vide_en_base: dataToInsert.code_barre_image_url === "",
          validation_pre_insert: isUrlValid ? "✅ URL VALIDE POUR INSERTION" : "❌ URL NULL/VIDE SERA INSÉRÉE",
          url_status: isUrlValid ? "VALID" : "INVALID_OR_EMPTY"
        },
        aucun_filtrage_appliqué: "✅ Pas de Object.entries().filter() qui pourrait supprimer les valeurs vides",
        timestamp: new Date().toISOString()
      });

      // 🚨 ARRÊT CRITIQUE SI URL INVALIDE
      if (!isUrlValid) {
        console.error("🚨 ARRÊT CRITIQUE: URL invalide détectée avant insertion Supabase", {
          url_dans_payload: dataToInsert.code_barre_image_url,
          type: typeof dataToInsert.code_barre_image_url,
          formData_original: formData.code_barre_image_url,
          action: "ARRÊT DE LA SOUMISSION POUR ÉVITER PERTE DE DONNÉES",
          timestamp: new Date().toISOString()
        });
        
        toast.error("🚨 Erreur critique: Image du code-barres manquante. Veuillez rescanner.");
        setIsSubmitting(false);
        return;
      }

      // 🔥 INSERTION SUPABASE AVEC TRACKING COMPLET
      console.log("🔥 APPEL SUPABASE INSERT - Requête critique avec URL VALIDÉE:", {
        table: "clients",
        action: "insert",
        données_exactes: dataToInsert,
        url_dans_payload: dataToInsert.code_barre_image_url,
        url_confirmée_valide: "✅ URL VALIDÉE AVANT INSERTION",
        payload_size: Object.keys(dataToInsert).length,
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
            analyse_critique: savedClient.code_barre_image_url ? "SUCCESS COMPLET" : "ÉCHEC - URL PERDUE MALGRÉ VALIDATION"
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
          console.log("✅ SUCCÈS COMPLET - URL SAUVÉE AVEC SÉCURITÉ RENFORCÉE:", {
            message: "Client et image sauvegardés avec succès",
            url_confirmée: savedClient.code_barre_image_url,
            résolution: "PROBLÈME RÉSOLU AVEC SÉCURITÉ RENFORCÉE",
            timestamp: new Date().toISOString()
          });
          toast.success("✅ Client et image sauvegardés avec succès !");
        } else {
          console.log("❌ ÉCHEC MYSTÉRIEUX - URL PERDUE MALGRÉ VALIDATION:", {
            message: "URL était valide avant insertion mais nulle après",
            données_client: savedClient,
            investigation_requise: "Problème au niveau de Supabase lui-même",
            urgence: "PROBLÈME SYSTÈME CRITIQUE",
            timestamp: new Date().toISOString()
          });
          toast.error("⚠️ Erreur système: URL perdue lors de la sauvegarde");
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
