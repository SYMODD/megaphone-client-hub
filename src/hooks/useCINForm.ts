
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CINFormData {
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  numero_telephone: string;
  code_barre: string;
  code_barre_image_url: string;
  scannedImage: string | null;
  photo_url: string;
  observations: string;
  date_enregistrement: string;
}

export const useCINForm = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<CINFormData>({
    nom: "",
    prenom: "",
    nationalite: "Maroc",
    numero_passeport: "",
    numero_telephone: "",
    code_barre: "",
    code_barre_image_url: "",
    scannedImage: null,
    photo_url: "",
    observations: "",
    date_enregistrement: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (field: keyof CINFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageScanned = (image: string, photoUrl?: string) => {
    console.log("📸 CIN FORM - Image scannée reçue:", {
      image_presente: image ? "✅ OUI" : "❌ NON",
      photo_url_presente: photoUrl ? "✅ OUI" : "❌ NON",
      photo_url: photoUrl
    });
    
    setFormData(prev => ({
      ...prev,
      scannedImage: image,
      photo_url: photoUrl || prev.photo_url
    }));
  };

  const handleCINDataExtracted = (data: any) => {
    console.log("📋 CIN FORM - Données CIN reçues COMPLÈTES avec URL image:", {
      ...data,
      code_barre_present: data.code_barre ? "✅ OUI" : "❌ NON",
      image_barcode_presente: data.code_barre_image_url ? "✅ OUI" : "❌ NON",
      image_barcode_url: data.code_barre_image_url,
      verification_url: data.code_barre_image_url ? "URL PRÉSENTE" : "PAS D'URL"
    });

    const observations = `=== EXTRACTION CIN AUTOMATIQUE ===
Date: ${new Date().toLocaleString('fr-FR')}
Type: Carte d'Identité Nationale
Champs extraits: ${Object.keys(data).filter(key => data[key] && key !== 'code_barre_image_url').join(', ')}
${data.code_barre_image_url ? 'Image code-barres: Sauvegardée automatiquement' : ''}`;

    // 🚨 CORRECTION ESSENTIELLE : Préserver OBLIGATOIREMENT l'URL de l'image
    const updatedFormData = {
      nom: data.nom || formData.nom,
      prenom: data.prenom || formData.prenom,
      nationalite: data.nationalite || formData.nationalite,
      numero_passeport: data.numero_cin || data.numero_passeport || formData.numero_passeport,
      numero_telephone: data.numero_telephone || formData.numero_telephone,
      code_barre: data.code_barre || formData.code_barre,
      // 🎯 ESSENTIEL : Préserver l'URL de l'image du code-barres
      code_barre_image_url: data.code_barre_image_url || formData.code_barre_image_url,
      observations: observations,
      // Préserver les autres champs
      scannedImage: formData.scannedImage,
      photo_url: formData.photo_url,
      date_enregistrement: formData.date_enregistrement
    };

    console.log("💾 CIN FORM - MISE À JOUR FINALE avec URL image:", {
      code_barre: updatedFormData.code_barre,
      code_barre_image_url: updatedFormData.code_barre_image_url,
      url_bien_preservee: updatedFormData.code_barre_image_url ? "✅ OUI" : "❌ NON PERDUE!"
    });

    // Mettre à jour TOUT le formData avec spread operator pour garantir la préservation
    setFormData(prev => ({
      ...prev,
      ...updatedFormData
    }));
  };

  const handleSubmit = async () => {
    if (!user || !profile) {
      toast.error("Vous devez être connecté pour ajouter un client");
      return;
    }

    console.log("📝 CIN FORM - SOUMISSION FINALE avec vérification URL image:", {
      nom: formData.nom,
      prenom: formData.prenom,
      code_barre: formData.code_barre,
      numero_telephone: formData.numero_telephone,
      photo_client_presente: formData.photo_url ? "✅ OUI" : "❌ NON",
      image_barcode_presente: formData.code_barre_image_url ? "✅ OUI" : "❌ NON",
      photo_url: formData.photo_url,
      code_barre_image_url: formData.code_barre_image_url,
      verification_finale_url: formData.code_barre_image_url ? "URL PRÊTE POUR INSERTION" : "❌ PAS D'URL - ERREUR!"
    });

    setIsLoading(true);

    try {
      // Préparation finale des données avec vérification
      const clientData = {
        nom: formData.nom,
        prenom: formData.prenom,
        nationalite: formData.nationalite,
        numero_passeport: formData.numero_passeport,
        numero_telephone: formData.numero_telephone,
        code_barre: formData.code_barre,
        // 🎯 CRITIQUE : S'assurer que l'URL est BIEN présente
        code_barre_image_url: formData.code_barre_image_url || null,
        photo_url: formData.photo_url || null,
        observations: formData.observations,
        date_enregistrement: formData.date_enregistrement,
        agent_id: user.id,
        document_type: 'cin'
      };

      console.log("💾 INSERTION EN BASE - Données finales:", {
        nom_complet: `${clientData.prenom} ${clientData.nom}`,
        code_barre: clientData.code_barre || "NON",
        telephone: clientData.numero_telephone || "NON",
        photo_client: clientData.photo_url ? "✅ Présente" : "❌ NON",
        image_barcode: clientData.code_barre_image_url ? "✅ PRÉSENTE" : "❌ MANQUANTE",
        url_image_finale: clientData.code_barre_image_url,
        insertion_ok: clientData.code_barre_image_url ? "✅ URL PRÊTE" : "❌ PROBLÈME URL"
      });

      const { error } = await supabase
        .from('clients')
        .insert(clientData);

      if (error) {
        console.error('❌ Erreur insertion client CIN:', error);
        if (error.code === '23505') {
          toast.error("Ce numéro de document existe déjà");
        } else {
          toast.error("Erreur lors de l'enregistrement du client");
        }
        return;
      }

      console.log("🎉 Client CIN enregistré avec succès!");
      
      // Message de succès détaillé
      let successMessage = "Client CIN enregistré avec succès";
      const elements = [];
      if (clientData.photo_url) {
        elements.push("photo CIN");
      }
      if (clientData.code_barre_image_url) {
        elements.push("image code-barres");
        console.log("✅ URL image code-barres CONFIRMÉE en base:", clientData.code_barre_image_url);
      }
      
      if (elements.length > 0) {
        successMessage += ` avec ${elements.join(" et ")} !`;
      } else {
        successMessage += "!";
      }
      
      toast.success(successMessage);
      navigate("/base-clients");
    } catch (error) {
      console.error('❌ Erreur inattendue CIN:', error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    handleInputChange,
    handleImageScanned,
    handleCINDataExtracted,
    handleSubmit
  };
};
