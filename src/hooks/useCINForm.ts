
import { useState } from "react";
import { useFormSubmission } from "./useClientForm/useFormSubmission";
import { useImageUpload } from "./useImageUpload";

export const useCINForm = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    nationalite: "",
    numero_passeport: "",
    numero_telephone: "",
    code_barre: "",
    date_enregistrement: new Date().toISOString().split('T')[0],
    observations: "",
    scannedImage: null as string | null,
    photo_url: "",
    code_barre_image_url: "",
    document_type: "cin"
  });

  const { isLoading, handleSubmit: submitForm } = useFormSubmission({ formData });

  const handleInputChange = (field: string, value: string) => {
    console.log(`🔄 CIN FORM - Mise à jour champ ${field}:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageScanned = (image: string, photoUrl?: string) => {
    console.log("📷 CIN FORM - Image scannée:", {
      image_presente: !!image,
      photo_url: photoUrl
    });
    
    setFormData(prev => ({
      ...prev,
      scannedImage: image,
      ...(photoUrl && { photo_url: photoUrl })
    }));
  };

  const handleCINDataExtracted = (data: any) => {
    console.log("📋 CIN FORM - Réception données CIN AVEC VÉRIFICATION URL:", {
      ...data,
      code_barre_present: data.code_barre ? "✅ OUI" : "❌ NON",
      image_url_presente: data.code_barre_image_url ? "✅ OUI" : "❌ NON",
      url_recue: data.code_barre_image_url,
      verification_critique: data.code_barre_image_url ? "✅ URL PRÉSENTE!" : "❌ AUCUNE URL!"
    });

    // 🎯 MISE À JOUR COMPLÈTE des données CIN sans soumission automatique
    setFormData(prev => {
      const updatedData = {
        ...prev,
        nom: data.nom || prev.nom,
        prenom: data.prenom || prev.prenom,
        nationalite: data.nationalite || prev.nationalite,
        numero_passeport: data.numero_cin || data.numero_passeport || prev.numero_passeport,
        // 🚨 CRITIQUE : Préserver l'URL de l'image code-barres
        code_barre: data.code_barre || prev.code_barre,
        code_barre_image_url: data.code_barre_image_url || prev.code_barre_image_url,
        // Mise à jour des observations automatiques
        observations: `=== EXTRACTION CIN AUTOMATIQUE ===
Date: ${new Date().toLocaleString('fr-FR')}
Type: Carte d'Identité Nationale
Champs extraits: ${Object.keys(data).join(', ')}
Image code-barres: ${data.code_barre_image_url ? "✅ Disponible" : "❌ Non disponible"}`
      };

      console.log("💾 CIN FORM - MISE À JOUR FINALE avec URL VÉRIFIÉE:", {
        code_barre: updatedData.code_barre,
        code_barre_image_url: updatedData.code_barre_image_url,
        url_preservee: updatedData.code_barre_image_url ? "✅ CONSERVÉE!" : "❌ PERDUE!",
        donnees_completes: updatedData.code_barre_image_url ? "✅ PARFAIT" : "⚠️ MANQUANTES"
      });

      return updatedData;
    });
  };

  // 🎯 NOUVELLE FONCTION : Soumission manuelle uniquement
  const handleSubmit = () => {
    console.log("📝 CIN FORM - SOUMISSION FINALE avec vérification COMPLÈTE:", {
      nom: formData.nom,
      prenom: formData.prenom,
      code_barre: formData.code_barre,
      numero_telephone: formData.numero_telephone,
      photo_client_url: formData.photo_url,
      code_barre_image_url: formData.code_barre_image_url,
      url_image_presente: formData.code_barre_image_url ? "✅ PRÉSENTE" : "❌ MANQUANTE - PROBLÈME!",
      validation_finale: formData.code_barre_image_url ? "✅ DONNÉES COMPLÈTES" : "⚠️ DONNÉES INCOMPLÈTES"
    });

    console.log("💾 INSERTION EN BASE - Données FINALES pour insertion:", {
      nom_complet: `${formData.prenom} ${formData.nom}`,
      code_barre: formData.code_barre || "NON",
      telephone: formData.numero_telephone || "NON", 
      photo_client: formData.photo_url ? "✅ Présente" : "❌ Manquante",
      image_barcode: formData.code_barre_image_url ? "✅ Présente" : "❌ MANQUANTE",
      url_finale: formData.code_barre_image_url || null,
      insertion_status: formData.code_barre_image_url ? "✅ COMPLÈTE" : "⚠️ URL MANQUANTE"
    });

    // Appel de la soumission réelle
    submitForm();
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
