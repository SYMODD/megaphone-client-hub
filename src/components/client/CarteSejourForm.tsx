
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { RegistrationSection } from "./RegistrationSection";
import { FormActions } from "./FormActions";
import { CarteSejourScanner } from "./CarteSejourScanner";

interface CarteSejourFormData {
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
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

  const uploadImage = async (imageBase64: string): Promise<string | null> => {
    try {
      const response = await fetch(imageBase64);
      const blob = await response.blob();
      const filename = `carte-sejour-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('client-photos')
        .upload(filename, blob, { contentType: 'image/jpeg' });

      if (error) {
        console.error('Error uploading image:', error);
        toast.error("Erreur lors du téléchargement de l'image");
        return null;
      }

      const { data: publicURL } = supabase.storage
        .from('client-photos')
        .getPublicUrl(data.path);

      return publicURL.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Erreur lors du téléchargement de l'image");
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour ajouter un client");
      return;
    }

    setIsLoading(true);

    try {
      let photoUrl = null;
      
      if (formData.scannedImage) {
        photoUrl = await uploadImage(formData.scannedImage);
      }

      const { error } = await supabase
        .from('clients')
        .insert({
          nom: formData.nom,
          prenom: formData.prenom,
          nationalite: formData.nationalite,
          numero_passeport: formData.numero_passeport,
          photo_url: photoUrl,
          observations: formData.observations,
          date_enregistrement: formData.date_enregistrement,
          agent_id: user.id,
          document_type: formData.document_type
        });

      if (error) {
        console.error('Error inserting client:', error);
        if (error.code === '23505') {
          toast.error("Ce numéro de document existe déjà");
        } else {
          toast.error("Erreur lors de l'enregistrement du client");
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
