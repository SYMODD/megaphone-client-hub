
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { RegistrationSection } from "./RegistrationSection";
import { FormActions } from "./FormActions";
import { PassportEtrangerScanner } from "./PassportEtrangerScanner";
import { uploadClientPhoto } from "@/utils/storageUtils";

interface PassportEtrangerFormData {
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
  document_type: 'passeport_etranger';
}

export const PassportEtrangerForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<PassportEtrangerFormData>({
    nom: "",
    prenom: "",
    nationalite: "",
    numero_passeport: "",
    numero_telephone: "",
    code_barre: "",
    scannedImage: null,
    photo_url: "",
    observations: "",
    date_enregistrement: new Date().toISOString().split('T')[0],
    document_type: 'passeport_etranger'
  });

  const handleInputChange = (field: keyof PassportEtrangerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageScanned = async (image: string) => {
    console.log("📤 PASSEPORT ETRANGER FORM - Image scannée, upload automatique vers client-photos");
    
    // 1. Sauvegarder l'image scannée
    setFormData(prev => ({ ...prev, scannedImage: image }));
    
    // 2. Upload automatique IMMÉDIAT vers client-photos
    if (image) {
      const uploadedPhotoUrl = await uploadClientPhoto(image, 'passeport-etranger');
      
      if (uploadedPhotoUrl) {
        console.log("✅ PASSEPORT ETRANGER FORM - Image uploadée automatiquement:", uploadedPhotoUrl);
        setFormData(prev => ({ 
          ...prev, 
          photo_url: uploadedPhotoUrl 
        }));
        toast.success("📷 Photo passeport uploadée automatiquement !");
      } else {
        console.error("❌ PASSEPORT ETRANGER FORM - Échec upload automatique image");
        toast.error("⚠️ Image scannée mais échec upload automatique");
      }
    }
  };

  const handlePassportDataExtracted = (extractedData: any) => {
    console.log("📄 PASSEPORT ETRANGER FORM - Données extraites:", extractedData);
    
    setFormData(prev => ({
      ...prev,
      nom: extractedData.nom || prev.nom,
      prenom: extractedData.prenom || prev.prenom,
      nationalite: extractedData.nationalite || prev.nationalite,
      numero_passeport: extractedData.numero_passeport || prev.numero_passeport,
    }));

    const scanInfo = `Données extraites automatiquement via OCR le ${new Date().toLocaleString('fr-FR')} - Type de document: Passeport Étranger`;
    setFormData(prev => ({
      ...prev,
      observations: prev.observations ? `${prev.observations}\n\n${scanInfo}` : scanInfo
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour ajouter un client");
      return;
    }

    // 🔥 VÉRIFICATION OBLIGATOIRE DE LA PHOTO URL
    if (!formData.photo_url) {
      console.error("❌ PASSEPORT ETRANGER FORM - AUCUNE PHOTO URL DISPONIBLE");
      toast.error("❌ Erreur: Aucune photo disponible. Veuillez rescanner le document.");
      return;
    }

    // Validation des champs obligatoires
    if (!formData.nom || !formData.prenom || !formData.numero_passeport) {
      toast.error("Veuillez remplir tous les champs obligatoires (nom, prénom, numéro de passeport)");
      return;
    }

    setIsLoading(true);
    console.log("🚀 SOUMISSION PASSEPORT ETRANGER - Début avec photo URL vérifiée:", {
      nom: formData.nom,
      prenom: formData.prenom,
      photo_url: formData.photo_url,
      verification: formData.photo_url ? "✅ PHOTO URL CONFIRMÉE" : "❌ PHOTO URL MANQUANTE"
    });

    try {
      // Préparer les données pour l'insertion avec photo_url déjà uploadée
      const clientData = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        nationalite: formData.nationalite,
        numero_passeport: formData.numero_passeport.trim(),
        numero_telephone: formData.numero_telephone.trim(),
        code_barre: formData.code_barre.trim(),
        photo_url: formData.photo_url, // 🔥 PHOTO URL DÉJÀ UPLOADÉE AUTOMATIQUEMENT
        observations: formData.observations,
        date_enregistrement: formData.date_enregistrement,
        document_type: 'passeport_etranger',
        agent_id: user.id
      };

      console.log("💾 INSERTION PASSEPORT ETRANGER - Données finales avec photo vérifiée:", {
        ...clientData,
        verification_finale: clientData.photo_url ? "✅ PHOTO INCLUSE" : "❌ PHOTO MANQUANTE"
      });

      const { error } = await supabase
        .from('clients')
        .insert(clientData);

      if (error) {
        console.error('❌ Erreur insertion passeport étranger:', error);
        if (error.code === '23505') {
          toast.error("Ce numéro de passeport existe déjà dans la base de données");
        } else {
          toast.error(`Erreur lors de l'enregistrement du client: ${error.message}`);
        }
        return;
      }

      console.log("✅ PASSEPORT ETRANGER ENREGISTRÉ AVEC PHOTO UPLOADÉE AUTOMATIQUEMENT");
      toast.success("Client avec passeport étranger enregistré avec succès et photo sauvegardée !");
      navigate("/base-clients");
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
      <PassportEtrangerScanner 
        scannedImage={formData.scannedImage}
        onImageScanned={handleImageScanned}
        onDataExtracted={handlePassportDataExtracted}
      />

      <PersonalInfoSection 
        formData={formData}
        onInputChange={handleInputChange}
      />

      <ContactInfoSection 
        formData={formData}
        onInputChange={handleInputChange}
      />

      <RegistrationSection 
        formData={formData}
        onInputChange={handleInputChange}
      />

      <FormActions 
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />
    </form>
  );
};
