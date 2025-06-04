
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ClientFormData } from "@/hooks/useClientForm/types";

export const useCINForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { uploadClientPhoto } = useImageUpload();
  
  const [formData, setFormData] = useState<ClientFormData>({
    nom: "",
    prenom: "",
    nationalite: "Marocaine", // Default for CIN
    numero_passeport: "", // Will store CIN number
    numero_telephone: "",
    code_barre: "",
    code_barre_image_url: "",
    observations: "",
    date_enregistrement: new Date().toISOString().split('T')[0],
    document_type: "cin",
    photo_url: "",
    scannedImage: null
  });

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageScanned = (imageData: string) => {
    console.log("🖼️ Image CIN scannée reçue");
    setFormData(prev => ({ ...prev, scannedImage: imageData }));
  };

  const handleCINDataExtracted = (extractedData: any) => {
    console.log("📄 Données CIN extraites:", extractedData);
    
    setFormData(prev => ({
      ...prev,
      nom: extractedData.nom || prev.nom,
      prenom: extractedData.prenom || prev.prenom,
      numero_passeport: extractedData.cin || extractedData.numero_cin || prev.numero_passeport,
      code_barre: extractedData.code_barre || prev.code_barre,
      code_barre_image_url: extractedData.code_barre_image_url || prev.code_barre_image_url
    }));

    const extractionInfo = `Données extraites automatiquement via OCR le ${new Date().toLocaleString('fr-FR')} - Type de document: CIN`;
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
      toast.error("Veuillez remplir tous les champs obligatoires (nom, prénom, CIN)");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🚀 SOUMISSION CIN - Début avec données:", {
        nom: formData.nom,
        prenom: formData.prenom,
        cin: formData.numero_passeport,
        scannedImage: formData.scannedImage ? "✅ PRÉSENTE" : "❌ ABSENTE"
      });
      
      let photoUrl = formData.photo_url;
      
      // 🔥 UPLOAD AUTOMATIQUE DE L'IMAGE SCANNÉE vers client-photos
      if (formData.scannedImage && !photoUrl) {
        console.log("📤 UPLOAD IMAGE CIN vers client-photos");
        photoUrl = await uploadClientPhoto(formData.scannedImage, 'cin');
        
        if (!photoUrl) {
          toast.error("Erreur lors du téléchargement de l'image. Enregistrement sans photo.");
        } else {
          console.log("✅ Image CIN uploadée:", photoUrl);
        }
      }

      const clientData = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        nationalite: formData.nationalite,
        numero_passeport: formData.numero_passeport.trim(),
        numero_telephone: formData.numero_telephone.trim() || null,
        code_barre: formData.code_barre?.trim() || null,
        code_barre_image_url: formData.code_barre_image_url || null,
        photo_url: photoUrl || null,
        observations: formData.observations?.trim() || null,
        date_enregistrement: formData.date_enregistrement,
        document_type: formData.document_type,
        agent_id: user.id
      };

      console.log("💾 INSERTION CLIENT CIN - Données finales:", {
        ...clientData,
        photo_incluse: clientData.photo_url ? "✅ INCLUSE" : "❌ MANQUANTE"
      });

      const { error } = await supabase
        .from('clients')
        .insert(clientData);

      if (error) {
        console.error('❌ Erreur insertion client CIN:', error);
        if (error.code === '23505') {
          toast.error("Ce numéro CIN existe déjà dans la base de données");
        } else {
          toast.error(`Erreur lors de l'enregistrement du client: ${error.message}`);
        }
        return;
      }

      toast.success(`Client CIN ${formData.prenom} ${formData.nom} enregistré avec succès!`);
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
    handleCINDataExtracted,
    handleSubmit
  };
};
