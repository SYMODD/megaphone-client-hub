import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { RegistrationSection } from "./RegistrationSection";
import { FormActions } from "./FormActions";
import { CarteSejourScanner } from "./CarteSejourScanner";
import { uploadClientPhoto } from "@/utils/storageUtils";

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
  document_type: 'carte_sejour';
}

export const CarteSejourForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<CarteSejourFormData>({
    nom: "",
    prenom: "",
    nationalite: "",
    numero_passeport: "",
    numero_telephone: "",
    code_barre: "",
    scannedImage: null,
    observations: "",
    date_enregistrement: new Date().toISOString().split('T')[0],
    document_type: 'carte_sejour'
  });

  const handleInputChange = (field: keyof CarteSejourFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCarteSejourDataExtracted = (extractedData: any) => {
    console.log("Données carte de séjour extraites:", extractedData);
    
    setFormData(prev => ({
      ...prev,
      nom: extractedData.nom || prev.nom,
      prenom: extractedData.prenom || prev.prenom,
      nationalite: extractedData.nationalite || prev.nationalite,
      numero_passeport: extractedData.numero_carte || prev.numero_passeport,
    }));

    const scanInfo = `Données extraites automatiquement via OCR le ${new Date().toLocaleString('fr-FR')} - Type de document: Carte de Séjour`;
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

    // Validation des champs obligatoires
    if (!formData.nom || !formData.prenom || !formData.numero_passeport) {
      toast.error("Veuillez remplir tous les champs obligatoires (nom, prénom, numéro de document)");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Données du formulaire à enregistrer:", formData);
      
      let photoUrl = null;
      
      if (formData.scannedImage) {
        photoUrl = await uploadClientPhoto(formData.scannedImage, 'carte-sejour');
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
          toast.error("Ce numéro de document existe déjà dans la base de données");
        } else {
          toast.error(`Erreur lors de l'enregistrement du client: ${error.message}`);
        }
        return;
      }

      toast.success("Client avec carte de séjour enregistré avec succès!");
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
      <CarteSejourScanner 
        scannedImage={formData.scannedImage}
        onImageScanned={(image) => handleInputChange("scannedImage", image)}
        onDataExtracted={handleCarteSejourDataExtracted}
      />

      <PersonalInfoSection 
        formData={formData}
        onInputChange={handleInputChange}
      />

      <ContactInfoSection 
        formData={formData}
        onInputChange={handleInputChange}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />

      <RegistrationSection 
        formData={formData}
        onInputChange={handleInputChange}
      />
    </form>
  );
};
