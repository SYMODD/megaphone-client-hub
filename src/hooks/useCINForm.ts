
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ClientFormData } from "@/hooks/useClientForm/types";

// Extend ClientFormData with CIN-specific fields
interface CINFormData extends ClientFormData {
  cin: string;
  date_naissance: string;
  lieu_naissance: string;
  adresse: string;
}

export const useCINForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { uploadClientPhoto } = useImageUpload();
  
  const [formData, setFormData] = useState<CINFormData>({
    nom: "",
    prenom: "",
    nationalite: "Marocaine", // Default for CIN
    numero_passeport: "", // Will store CIN number
    numero_telephone: "",
    code_barre: "",
    code_barre_image_url: "",
    scannedImage: null,
    photo_url: "",
    observations: "",
    date_enregistrement: new Date().toISOString().split('T')[0],
    document_type: 'cin',
    // CIN-specific fields
    cin: "",
    date_naissance: "",
    lieu_naissance: "",
    adresse: ""
  });

  const handleInputChange = (field: keyof CINFormData, value: string) => {
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
      cin: extractedData.cin || prev.cin,
      numero_passeport: extractedData.cin || prev.numero_passeport, // Store CIN in passport field
      date_naissance: extractedData.date_naissance || prev.date_naissance,
      lieu_naissance: extractedData.lieu_naissance || prev.lieu_naissance,
      adresse: extractedData.adresse || prev.adresse
    }));

    // Ajouter info d'extraction automatique dans les observations
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

    // Validation des champs obligatoires
    if (!formData.nom || !formData.prenom || !formData.cin) {
      toast.error("Veuillez remplir tous les champs obligatoires (nom, prénom, CIN)");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🚀 SOUMISSION CIN - Début avec données:", {
        nom: formData.nom,
        prenom: formData.prenom,
        cin: formData.cin,
        scannedImage: formData.scannedImage ? "✅ PRÉSENTE" : "❌ ABSENTE"
      });
      
      let photoUrl = null;
      
      // 🔥 UPLOAD AUTOMATIQUE DE L'IMAGE SCANNÉE
      if (formData.scannedImage) {
        console.log("📤 UPLOAD IMAGE CIN vers client-photos");
        photoUrl = await uploadClientPhoto(formData.scannedImage, 'cin');
        
        if (!photoUrl) {
          toast.error("Erreur lors du téléchargement de l'image. Enregistrement sans photo.");
        } else {
          console.log("✅ Image CIN uploadée:", photoUrl);
        }
      }

      // Préparer les données pour l'insertion
      const clientData = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        nationalite: "Marocaine", // Par défaut pour CIN
        numero_passeport: formData.cin.trim(), // CIN dans le champ passeport
        numero_telephone: formData.numero_telephone.trim(),
        photo_url: photoUrl, // 🔥 PHOTO UPLOADÉE
        observations: formData.observations,
        date_enregistrement: formData.date_enregistrement,
        document_type: 'cin',
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
