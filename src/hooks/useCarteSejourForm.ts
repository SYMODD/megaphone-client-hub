
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";

interface CarteSejourFormData {
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

export const useCarteSejourForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { uploadClientPhoto } = useImageUpload();
  
  const [formData, setFormData] = useState<CarteSejourFormData>({
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

  const handleInputChange = (field: keyof CarteSejourFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageScanned = (imageData: string) => {
    console.log("🖼️ Image carte de séjour scannée reçue");
    setFormData(prev => ({ ...prev, scannedImage: imageData }));
  };

  const handleCarteDataExtracted = (extractedData: any) => {
    console.log("📄 Données carte de séjour extraites:", extractedData);
    
    setFormData(prev => ({
      ...prev,
      nom: extractedData.nom || prev.nom,
      prenom: extractedData.prenom || prev.prenom,
      nationalite: extractedData.nationalite || prev.nationalite,
      numero_passeport: extractedData.numero_carte || extractedData.numero_passeport || prev.numero_passeport,
    }));

    const extractionInfo = `Données extraites automatiquement via OCR le ${new Date().toLocaleString('fr-FR')} - Type de document: Carte de séjour`;
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
      toast.error("Veuillez remplir tous les champs obligatoires (nom, prénom, numéro de carte)");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🚀 SOUMISSION CARTE DE SÉJOUR - Début avec données:", {
        nom: formData.nom,
        prenom: formData.prenom,
        numero_carte: formData.numero_passeport,
        nationalite: formData.nationalite,
        scannedImage: formData.scannedImage ? "✅ PRÉSENTE" : "❌ ABSENTE"
      });
      
      let photoUrl = null;
      
      // 🔥 UPLOAD AUTOMATIQUE DE L'IMAGE SCANNÉE vers client-photos
      if (formData.scannedImage) {
        console.log("📤 UPLOAD IMAGE CARTE DE SÉJOUR vers client-photos");
        photoUrl = await uploadClientPhoto(formData.scannedImage, 'carte_sejour');
        
        if (!photoUrl) {
          toast.error("Erreur lors du téléchargement de l'image. Enregistrement sans photo.");
        } else {
          console.log("✅ Image carte de séjour uploadée:", photoUrl);
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
        document_type: 'carte_sejour',
        agent_id: user.id
      };

      console.log("💾 INSERTION CLIENT CARTE DE SÉJOUR - Données finales:", {
        ...clientData,
        photo_incluse: clientData.photo_url ? "✅ INCLUSE" : "❌ MANQUANTE"
      });

      const { error } = await supabase
        .from('clients')
        .insert(clientData);

      if (error) {
        console.error('❌ Erreur insertion client carte de séjour:', error);
        if (error.code === '23505') {
          toast.error("Ce numéro de carte existe déjà dans la base de données");
        } else {
          toast.error(`Erreur lors de l'enregistrement du client: ${error.message}`);
        }
        return;
      }

      toast.success(`Client carte de séjour ${formData.prenom} ${formData.nom} enregistré avec succès!`);
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
    handleCarteDataExtracted,
    handleSubmit
  };
};

export type { CarteSejourFormData };
