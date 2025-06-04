
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";

interface PassportEtrangerFormData {
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  numero_telephone: string;
  code_barre: string;
  scannedImage: string | null;
  observations: string;
  date_enregistrement: string;
}

export const usePassportEtrangerForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { uploadClientPhoto } = useImageUpload();
  
  const [formData, setFormData] = useState<PassportEtrangerFormData>({
    nom: "",
    prenom: "",
    nationalite: "",
    numero_passeport: "",
    numero_telephone: "",
    code_barre: "",
    scannedImage: null,
    observations: "",
    date_enregistrement: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (field: keyof PassportEtrangerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageScanned = (imageData: string) => {
    console.log("🖼️ Image passeport étranger scannée reçue");
    setFormData(prev => ({ ...prev, scannedImage: imageData }));
  };

  const handlePassportDataExtracted = (extractedData: any) => {
    console.log("📄 Données passeport étranger extraites:", extractedData);
    
    setFormData(prev => ({
      ...prev,
      nom: extractedData.nom || prev.nom,
      prenom: extractedData.prenom || prev.prenom,
      nationalite: extractedData.nationalite || prev.nationalite,
      numero_passeport: extractedData.numero_passeport || prev.numero_passeport,
    }));

    const extractionInfo = `Données extraites automatiquement via OCR le ${new Date().toLocaleString('fr-FR')} - Type de document: Passeport étranger`;
    setFormData(prev => ({
      ...prev,
      observations: prev.observations ? `${prev.observations}\n\n${extractionInfo}` : extractionInfo
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour ajouter un client");
      return;
    }

    if (!formData.nom || !formData.prenom || !formData.numero_passeport) {
      toast.error("Veuillez remplir tous les champs obligatoires (nom, prénom, numéro de passeport)");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🚀 SOUMISSION PASSEPORT ÉTRANGER - Début avec données:", {
        nom: formData.nom,
        prenom: formData.prenom,
        numero_passeport: formData.numero_passeport,
        nationalite: formData.nationalite,
        scannedImage: formData.scannedImage ? "✅ PRÉSENTE" : "❌ ABSENTE"
      });
      
      let photoUrl = null;
      
      // 🔥 UPLOAD AUTOMATIQUE DE L'IMAGE SCANNÉE vers client-photos
      if (formData.scannedImage) {
        console.log("📤 UPLOAD IMAGE PASSEPORT ÉTRANGER vers client-photos");
        photoUrl = await uploadClientPhoto(formData.scannedImage, 'passeport_etranger');
        
        if (!photoUrl) {
          toast.error("Erreur lors du téléchargement de l'image. Enregistrement sans photo.");
        } else {
          console.log("✅ Image passeport étranger uploadée:", photoUrl);
        }
      }

      const clientData = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        nationalite: formData.nationalite.trim(),
        numero_passeport: formData.numero_passeport.trim(),
        numero_telephone: formData.numero_telephone.trim() || null,
        code_barre: formData.code_barre?.trim() || null,
        photo_url: photoUrl || null,
        observations: formData.observations?.trim() || null,
        date_enregistrement: formData.date_enregistrement,
        document_type: 'passeport_etranger',
        agent_id: user.id
      };

      console.log("💾 INSERTION CLIENT PASSEPORT ÉTRANGER - Données finales:", {
        ...clientData,
        photo_incluse: clientData.photo_url ? "✅ INCLUSE" : "❌ MANQUANTE"
      });

      const { error } = await supabase
        .from('clients')
        .insert(clientData);

      if (error) {
        console.error('❌ Erreur insertion client passeport étranger:', error);
        if (error.code === '23505') {
          toast.error("Ce numéro de passeport existe déjà dans la base de données");
        } else {
          toast.error(`Erreur lors de l'enregistrement du client: ${error.message}`);
        }
        return;
      }

      toast.success(`Client passeport étranger ${formData.prenom} ${formData.nom} enregistré avec succès!`);
      navigate("/base-clients");
    } catch (error) {
      console.error('❌ Erreur:', error);
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
    handlePassportDataExtracted,
    handleSubmit
  };
};

export type { PassportEtrangerFormData };
