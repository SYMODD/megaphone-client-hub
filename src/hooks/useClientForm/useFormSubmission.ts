
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ClientFormData } from "./types";
import { useImageUpload } from "@/hooks/useImageUpload";

interface UseFormSubmissionProps {
  formData: ClientFormData;
}

export const useFormSubmission = ({ formData }: UseFormSubmissionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { uploadClientPhoto } = useImageUpload();

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!user) {
      toast.error("Vous devez être connecté pour enregistrer un client");
      return;
    }

    setIsLoading(true);
    console.log("🚀 SOUMISSION CLIENT - Début avec données complètes:", {
      nom: formData.nom,
      prenom: formData.prenom,
      code_barre: formData.code_barre,
      code_barre_image_url: formData.code_barre_image_url,
      photo_url: formData.photo_url,
      scannedImage: formData.scannedImage ? "✅ PRÉSENTE" : "❌ ABSENTE",
      url_barcode_presente: formData.code_barre_image_url ? "✅ OUI" : "❌ NON",
      url_photo_presente: formData.photo_url ? "✅ OUI" : "❌ NON"
    });

    try {
      let finalPhotoUrl = formData.photo_url;

      // 🔥 UPLOAD AUTOMATIQUE DE L'IMAGE SCANNÉE
      if (formData.scannedImage && !finalPhotoUrl) {
        console.log("📤 UPLOAD IMAGE SCANNÉE - Début upload vers client-photos");
        
        const uploadedPhotoUrl = await uploadClientPhoto(
          formData.scannedImage, 
          formData.document_type || 'cin'
        );
        
        if (uploadedPhotoUrl) {
          finalPhotoUrl = uploadedPhotoUrl;
          console.log("✅ IMAGE SCANNÉE UPLOADÉE:", uploadedPhotoUrl);
        } else {
          console.warn("⚠️ Échec upload image scannée, continuons sans photo");
        }
      }

      // 🎯 DONNÉES COMPLÈTES POUR INSERTION - INCLUANT L'URL DU CODE-BARRES
      const clientData = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        nationalite: formData.nationalite,
        numero_passeport: formData.numero_passeport.trim(),
        numero_telephone: formData.numero_telephone?.trim() || null,
        code_barre: formData.code_barre?.trim() || null,
        code_barre_image_url: formData.code_barre_image_url || null, // 🔥 CRUCIAL
        photo_url: finalPhotoUrl || null,
        observations: formData.observations?.trim() || null,
        date_enregistrement: formData.date_enregistrement,
        document_type: formData.document_type || 'cin',
        agent_id: user.id
      };

      console.log("💾 INSERTION CLIENT - Données finales:", {
        ...clientData,
        confirmation_barcode_url: clientData.code_barre_image_url ? "✅ INCLUSE" : "❌ MANQUANTE",
        confirmation_photo_url: clientData.photo_url ? "✅ INCLUSE" : "❌ MANQUANTE",
        photo_source: formData.scannedImage && !formData.photo_url ? "📤 UPLOADÉE" : "🔗 EXISTANTE"
      });

      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) {
        console.error("❌ Erreur insertion client:", error);
        throw error;
      }

      console.log("✅ CLIENT ENREGISTRÉ AVEC SUCCÈS:", {
        id: data.id,
        nom: data.nom,
        prenom: data.prenom,
        code_barre: data.code_barre,
        code_barre_image_url: data.code_barre_image_url,
        photo_url: data.photo_url,
        verification_urls: {
          barcode_ok: data.code_barre_image_url ? "✅ SAUVÉE" : "❌ MANQUANTE",
          photo_ok: data.photo_url ? "✅ SAUVÉE" : "❌ MANQUANTE"
        }
      });

      toast.success(`Client ${data.prenom} ${data.nom} enregistré avec succès!`);
      
      // Rediriger vers la liste des clients
      navigate("/base-clients");
      
    } catch (error: any) {
      console.error("❌ Erreur lors de l'enregistrement:", error);
      toast.error(error.message || "Erreur lors de l'enregistrement du client");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSubmit
  };
};
