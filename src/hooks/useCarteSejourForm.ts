
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useImageUpload } from "@/hooks/useImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  numero_telephone: string;
  code_barre: string;
  date_enregistrement: string;
  observations: string;
  scannedImage: string | null;
  code_barre_image_url: string; // 🎯 AJOUT: URL de l'image du code-barres
}

export const useCarteSejourForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { uploadClientPhoto } = useImageUpload();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    nom: "",
    prenom: "",
    nationalite: "",
    numero_passeport: "",
    numero_telephone: "",
    code_barre: "",
    date_enregistrement: new Date().toISOString().split('T')[0],
    observations: "",
    scannedImage: null,
    code_barre_image_url: "" // 🎯 AJOUT: Initialisation
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageScanned = (imageData: string) => {
    setFormData(prev => ({ ...prev, scannedImage: imageData }));
  };

  const handleCarteDataExtracted = (barcode: string, phone?: string, barcodeImageUrl?: string) => {
    console.log("🎯 CARTE SÉJOUR - Données extraites:", {
      barcode,
      phone,
      barcodeImageUrl,
      barcodeImageUrl_present: barcodeImageUrl ? "✅ OUI" : "❌ NON"
    });

    setFormData(prev => ({
      ...prev,
      code_barre: barcode || "",
      numero_telephone: phone || "",
      code_barre_image_url: barcodeImageUrl || "", // 🎯 CRUCIAL: Sauvegarder l'URL
      observations: prev.observations || `Données extraites automatiquement via OCR le ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')} - Type de document: Carte de séjour`
    }));
  };

  const handleSubmit = async () => {
    console.log("🚀 SOUMISSION CARTE SÉJOUR - Début avec données:", {
      nom: formData.nom,
      prenom: formData.prenom,
      numero_passeport: formData.numero_passeport,
      nationalite: formData.nationalite,
      scannedImage: formData.scannedImage ? "✅ PRÉSENTE" : "❌ ABSENTE",
      code_barre_image_url: formData.code_barre_image_url || "❌ ABSENTE" // 🎯 LOG pour debug
    });

    if (!formData.nom || !formData.prenom || !formData.numero_passeport || !formData.nationalite) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Upload de l'image de la carte si présente
      let photoUrl = null;
      if (formData.scannedImage) {
        console.log("📤 UPLOAD IMAGE CARTE SÉJOUR vers client-photos");
        
        // 🎯 FIX: Utiliser uploadClientPhoto avec l'image base64 et le type de document
        photoUrl = await uploadClientPhoto(formData.scannedImage, 'carte_sejour');
        console.log("✅ Image carte séjour uploadée:", photoUrl);
      }

      // Récupérer l'ID de l'agent connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      // 🎯 CRUCIAL: S'assurer que l'URL du code-barres est bien présente
      console.log("💾 VÉRIFICATION AVANT INSERTION - URL code-barres:", {
        code_barre_image_url_from_form: formData.code_barre_image_url,
        is_valid: formData.code_barre_image_url ? "✅ VALIDE" : "❌ MANQUANTE"
      });

      // Préparer les données finales pour l'insertion
      const finalData = {
        nom: formData.nom,
        prenom: formData.prenom,
        nationalite: formData.nationalite,
        numero_passeport: formData.numero_passeport,
        numero_telephone: formData.numero_telephone || null,
        code_barre: formData.code_barre || null,
        photo_url: photoUrl,
        observations: formData.observations || `Données extraites automatiquement via OCR le ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')} - Type de document: Carte de séjour`,
        date_enregistrement: formData.date_enregistrement,
        document_type: 'carte_sejour',
        agent_id: user.id,
        code_barre_image_url: formData.code_barre_image_url || null // 🎯 CRUCIAL: Inclure l'URL
      };

      console.log("💾 INSERTION CLIENT CARTE SÉJOUR - Données finales:", {
        ...finalData,
        photo_incluse: photoUrl ? "✅ INCLUSE" : "❌ ABSENTE",
        code_barre_image_incluse: finalData.code_barre_image_url ? "✅ INCLUSE" : "❌ ABSENTE" // 🎯 LOG pour debug
      });

      // Insertion en base de données
      const { error } = await supabase
        .from('clients')
        .insert([finalData]);

      if (error) {
        console.error('❌ Erreur insertion:', error);
        throw error;
      }

      toast({
        title: "Client enregistré avec succès",
        description: `${formData.prenom} ${formData.nom} a été ajouté à la base de données.`,
      });

      navigate('/base-clients');
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le client. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    handleInputChange,
    handleImageScanned,
    handleCarteDataExtracted,
    handleSubmit
  };
};
