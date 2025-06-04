
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { uploadClientPhoto } from "@/utils/storageUtils";

interface CINFormData {
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  numero_telephone: string;
  code_barre: string;
  scannedImage: string | null;
  photo_url: string;
  observations: string;
  date_enregistrement: string;
}

export const useCINForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CINFormData>({
    nom: "",
    prenom: "",
    nationalite: "",
    numero_passeport: "",
    numero_telephone: "",
    code_barre: "",
    scannedImage: null,
    photo_url: "",
    observations: "",
    date_enregistrement: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (field: keyof CINFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageScanned = async (image: string, photoUrl?: string) => {
    console.log("📤 CIN FORM - Image scannée, upload automatique vers client-photos");
    
    // 1. Sauvegarder l'image scannée
    setFormData(prev => ({ ...prev, scannedImage: image }));
    
    // 2. Upload automatique vers client-photos
    let uploadedPhotoUrl = photoUrl;
    if (!uploadedPhotoUrl && image) {
      console.log("📤 Upload automatique image CIN vers client-photos");
      uploadedPhotoUrl = await uploadClientPhoto(image, 'cin');
      
      if (uploadedPhotoUrl) {
        console.log("✅ Image CIN uploadée automatiquement:", uploadedPhotoUrl);
        toast.success("📷 Photo CIN uploadée automatiquement vers client-photos !");
      } else {
        console.error("❌ Échec upload automatique image CIN");
        toast.error("Erreur lors de l'upload automatique de la photo");
      }
    }
    
    // 3. Sauvegarder l'URL de la photo uploadée
    if (uploadedPhotoUrl) {
      setFormData(prev => ({ 
        ...prev, 
        scannedImage: image,
        photo_url: uploadedPhotoUrl 
      }));
      console.log("✅ URL photo sauvegardée dans formData:", uploadedPhotoUrl);
    }
  };

  const handleCINDataExtracted = (data: any) => {
    console.log("📄 CIN FORM - Données CIN extraites:", data);
    
    setFormData(prev => ({
      ...prev,
      nom: data.nom || prev.nom,
      prenom: data.prenom || prev.prenom,
      nationalite: data.nationalite || prev.nationalite,
      numero_passeport: data.numero_cin || prev.numero_passeport,
      numero_telephone: data.numero_telephone || prev.numero_telephone,
      code_barre: data.code_barre || prev.code_barre,
      // Garder la photo_url déjà uploadée automatiquement
      photo_url: prev.photo_url
    }));
    
    toast.success("Données CIN extraites et appliquées !");
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour enregistrer un client");
      return;
    }

    setIsLoading(true);
    console.log("🚀 SOUMISSION CIN CLIENT - Début avec photo uploadée automatiquement:", {
      nom: formData.nom,
      prenom: formData.prenom,
      photo_url: formData.photo_url,
      photo_uploadee_automatiquement: formData.photo_url ? "✅ OUI" : "❌ NON"
    });

    try {
      const clientData = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        nationalite: formData.nationalite,
        numero_passeport: formData.numero_passeport.trim(),
        numero_telephone: formData.numero_telephone?.trim() || null,
        code_barre: formData.code_barre?.trim() || null,
        code_barre_image_url: null,
        photo_url: formData.photo_url || null, // 🔥 PHOTO UPLOADÉE AUTOMATIQUEMENT
        observations: formData.observations?.trim() || null,
        date_enregistrement: formData.date_enregistrement,
        document_type: 'cin',
        agent_id: user.id
      };

      console.log("💾 INSERTION CLIENT CIN - Données finales avec photo automatique:", {
        ...clientData,
        confirmation_photo_url: clientData.photo_url ? "✅ INCLUSE" : "❌ MANQUANTE"
      });

      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) {
        console.error("❌ Erreur insertion client CIN:", error);
        throw error;
      }

      console.log("✅ CLIENT CIN ENREGISTRÉ AVEC PHOTO AUTOMATIQUE:", {
        id: data.id,
        nom: data.nom,
        prenom: data.prenom,
        photo_url: data.photo_url,
        verification_photo: data.photo_url ? "✅ SAUVÉE AUTOMATIQUEMENT" : "❌ MANQUANTE"
      });

      toast.success(`Client ${data.prenom} ${data.nom} enregistré avec succès et photo sauvegardée !`);
      navigate("/base-clients");
      
    } catch (error: any) {
      console.error("❌ Erreur lors de l'enregistrement client CIN:", error);
      toast.error(error.message || "Erreur lors de l'enregistrement du client");
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
