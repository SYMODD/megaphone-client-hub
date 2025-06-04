
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
    console.log("📤 CIN FORM - Image scannée avec URL photo reçue:", {
      image_presente: !!image,
      photo_url_recue: !!photoUrl,
      photo_url: photoUrl
    });
    
    // 1. Sauvegarder l'image scannée
    setFormData(prev => ({ ...prev, scannedImage: image }));
    
    // 2. Si une URL photo est fournie, l'utiliser directement
    if (photoUrl) {
      console.log("✅ CIN FORM - URL photo reçue directement du scanner:", photoUrl);
      setFormData(prev => ({ 
        ...prev, 
        scannedImage: image,
        photo_url: photoUrl 
      }));
      toast.success("📷 Photo CIN reçue et sauvegardée automatiquement !");
      return;
    }
    
    // 3. Sinon, upload automatique vers client-photos (fallback)
    if (image && !photoUrl) {
      console.log("📤 CIN FORM - Fallback: Upload automatique image CIN vers client-photos");
      const uploadedPhotoUrl = await uploadClientPhoto(image, 'cin');
      
      if (uploadedPhotoUrl) {
        console.log("✅ CIN FORM - Fallback upload réussi:", uploadedPhotoUrl);
        setFormData(prev => ({ 
          ...prev, 
          scannedImage: image,
          photo_url: uploadedPhotoUrl 
        }));
        toast.success("📷 Photo CIN uploadée automatiquement via fallback !");
      } else {
        console.error("❌ CIN FORM - Échec fallback upload image CIN");
        setFormData(prev => ({ 
          ...prev, 
          scannedImage: image
        }));
        toast.error("⚠️ Image scannée mais échec upload automatique");
      }
    }
  };

  const handleCINDataExtracted = (data: any) => {
    console.log("📄 CIN FORM - Données CIN extraites avec photo URL:", {
      data,
      photo_url_dans_data: data.photo_url
    });
    
    setFormData(prev => ({
      ...prev,
      nom: data.nom || prev.nom,
      prenom: data.prenom || prev.prenom,
      nationalite: data.nationalite || prev.nationalite,
      numero_passeport: data.numero_cin || prev.numero_passeport,
      numero_telephone: data.numero_telephone || prev.numero_telephone,
      code_barre: data.code_barre || prev.code_barre,
      // 🔥 PRIORITÉ À L'URL PHOTO DES DONNÉES EXTRAITES
      photo_url: data.photo_url || prev.photo_url
    }));
    
    console.log("✅ CIN FORM - Données appliquées avec photo URL:", {
      photo_url_finale: data.photo_url || formData.photo_url
    });
    
    toast.success("Données CIN extraites et appliquées avec photo !");
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour enregistrer un client");
      return;
    }

    // 🔥 VÉRIFICATION OBLIGATOIRE DE LA PHOTO URL
    if (!formData.photo_url) {
      console.error("❌ CIN FORM - AUCUNE PHOTO URL DISPONIBLE POUR L'ENREGISTREMENT");
      toast.error("❌ Erreur: Aucune photo disponible. Veuillez rescanner le document.");
      return;
    }

    setIsLoading(true);
    console.log("🚀 SOUMISSION CIN CLIENT - Début avec VÉRIFICATION photo obligatoire:", {
      nom: formData.nom,
      prenom: formData.prenom,
      photo_url: formData.photo_url,
      photo_url_presente: !!formData.photo_url,
      verification_critique: formData.photo_url ? "✅ PHOTO URL CONFIRMÉE" : "❌ PHOTO URL MANQUANTE"
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
        photo_url: formData.photo_url, // 🔥 PHOTO URL OBLIGATOIRE VÉRIFIÉE
        observations: formData.observations?.trim() || null,
        date_enregistrement: formData.date_enregistrement,
        document_type: 'cin',
        agent_id: user.id
      };

      console.log("💾 INSERTION CLIENT CIN - Données finales avec VÉRIFICATION photo obligatoire:", {
        ...clientData,
        verification_finale_photo_url: clientData.photo_url ? "✅ CONFIRMÉE POUR INSERTION" : "❌ CRITIQUE: MANQUANTE"
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

      console.log("✅ CLIENT CIN ENREGISTRÉ AVEC PHOTO URL VÉRIFIÉE:", {
        id: data.id,
        nom: data.nom,
        prenom: data.prenom,
        photo_url: data.photo_url,
        verification_finale: data.photo_url ? "✅ PHOTO SAUVEGARDÉE AVEC SUCCÈS" : "❌ CRITIQUE: PHOTO MANQUANTE EN BASE"
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
