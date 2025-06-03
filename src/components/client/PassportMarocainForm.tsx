
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { RegistrationSection } from "./RegistrationSection";
import { FormActions } from "./FormActions";
import { PassportOCRScanner } from "./PassportOCRScanner";
import { uploadClientPhoto } from "@/utils/storageUtils";
import { usePassportMarocainConfirmation } from "@/hooks/usePassportMarocainConfirmation";

interface PassportMarocainFormData {
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

export const PassportMarocainForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { confirmedData, isConfirmed, confirmData, resetConfirmation } = usePassportMarocainConfirmation();
  
  const [formData, setFormData] = useState<PassportMarocainFormData>({
    nom: "",
    prenom: "",
    nationalite: "Maroc",
    numero_passeport: "",
    numero_telephone: "",
    code_barre: "",
    scannedImage: null,
    observations: "",
    date_enregistrement: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (field: keyof PassportMarocainFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Reset confirmation when data changes
    if (isConfirmed) {
      resetConfirmation();
    }
  };

  const handleMRZDataExtracted = (extractedData: any) => {
    console.log("Données MRZ extraites:", extractedData);
    
    // Mapper les données extraites vers les champs du formulaire
    const updatedData: Partial<PassportMarocainFormData> = {};
    
    if (extractedData.nom) {
      updatedData.nom = extractedData.nom;
    }
    if (extractedData.prenom) {
      updatedData.prenom = extractedData.prenom;
    }
    if (extractedData.nationalite) {
      updatedData.nationalite = extractedData.nationalite;
    }
    if (extractedData.numero_passeport) {
      updatedData.numero_passeport = extractedData.numero_passeport;
    }
    if (extractedData.numero_telephone) {
      updatedData.numero_telephone = extractedData.numero_telephone;
    }
    if (extractedData.code_barre) {
      updatedData.code_barre = extractedData.code_barre;
    }

    setFormData(prev => ({ ...prev, ...updatedData }));

    // Ajouter l'information d'extraction aux observations
    const scanInfo = `Données extraites automatiquement via OCR le ${new Date().toLocaleString('fr-FR')} - Type de document: Passeport Marocain`;
    setFormData(prev => ({
      ...prev,
      observations: prev.observations ? `${prev.observations}\n\n${scanInfo}` : scanInfo
    }));

    // Reset confirmation when new data is extracted
    resetConfirmation();
  };

  const handleConfirmMRZData = () => {
    console.log("Bouton de confirmation cliqué");
    
    // Vérifier que nous avons des données à confirmer
    if (!formData.nom || !formData.prenom || !formData.numero_passeport) {
      toast.error("Veuillez extraire les données du passeport avant de confirmer");
      return;
    }

    const dataToConfirm = {
      nom: formData.nom,
      prenom: formData.prenom,
      nationalite: formData.nationalite,
      numero_passeport: formData.numero_passeport,
      numero_telephone: formData.numero_telephone,
      code_barre: formData.code_barre
    };

    confirmData(dataToConfirm);
    toast.success("Données confirmées et appliquées au formulaire");
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour ajouter un client");
      return;
    }

    // Validation des champs obligatoires
    if (!formData.nom || !formData.prenom || !formData.numero_passeport) {
      toast.error("Veuillez remplir tous les champs obligatoires (nom, prénom, numéro de passeport)");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Données du formulaire à enregistrer:", formData);
      
      let photoUrl = null;
      
      if (formData.scannedImage) {
        photoUrl = await uploadClientPhoto(formData.scannedImage, 'passeport_marocain');
        if (!photoUrl) {
          toast.error("Erreur lors du téléchargement de l'image. Enregistrement sans photo.");
        }
      }

      // Préparer les données pour l'insertion
      const clientData = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        nationalite: formData.nationalite,
        numero_passeport: formData.numero_passeport.trim(),
        numero_telephone: formData.numero_telephone.trim(),
        code_barre: formData.code_barre.trim(),
        photo_url: photoUrl,
        observations: formData.observations,
        date_enregistrement: formData.date_enregistrement,
        agent_id: user.id
      };

      console.log("Données client à insérer:", clientData);

      const { error } = await supabase
        .from('clients')
        .insert(clientData);

      if (error) {
        console.error('Error inserting client:', error);
        if (error.code === '23505') {
          toast.error("Ce numéro de passeport existe déjà dans la base de données");
        } else {
          toast.error(`Erreur lors de l'enregistrement du client: ${error.message}`);
        }
        return;
      }

      toast.success("Client avec passeport marocain enregistré avec succès!");
      navigate("/");
    } catch (error) {
      console.error('Error:', error);
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
      <PassportOCRScanner 
        scannedImage={formData.scannedImage}
        onImageScanned={(image) => handleInputChange("scannedImage", image)}
        onDataExtracted={handleMRZDataExtracted}
        onConfirmData={handleConfirmMRZData}
        isDataConfirmed={isConfirmed}
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
