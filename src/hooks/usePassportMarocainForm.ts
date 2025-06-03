
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useImageUpload } from "./useClientForm/useImageUpload";

export const usePassportMarocainForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { uploadImage } = useImageUpload();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    nationalite: "Marocaine",
    numero_passeport: "",
    numero_telephone: "",
    code_barre: "",
    code_barre_image_url: "",
    scannedImage: null as string | null,
    observations: "",
    date_enregistrement: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const confirmData = () => {
    console.log("Data confirmed for PassportMarocain");
  };

  const resetConfirmation = () => {
    console.log("Confirmation reset for PassportMarocain");
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour ajouter un client");
      return;
    }

    if (!formData.nom || !formData.prenom || !formData.numero_passeport) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);

    try {
      let photoUrl = null;
      
      // Upload document image if present
      if (formData.scannedImage) {
        photoUrl = await uploadImage(formData.scannedImage);
      }

      // Insert client data with barcode and barcode image URL
      const { error } = await supabase
        .from('clients')
        .insert({
          nom: formData.nom,
          prenom: formData.prenom,
          nationalite: formData.nationalite,
          numero_passeport: formData.numero_passeport,
          numero_telephone: formData.numero_telephone,
          code_barre: formData.code_barre,
          code_barre_image_url: formData.code_barre_image_url, // Inclure l'URL de l'image du code-barres
          photo_url: photoUrl,
          observations: formData.observations,
          date_enregistrement: formData.date_enregistrement,
          agent_id: user.id,
          document_type: 'passport_marocain'
        });

      if (error) {
        console.error('Error inserting client:', error);
        if (error.code === '23505') {
          toast.error("Ce numéro de passeport existe déjà");
        } else {
          toast.error("Erreur lors de l'enregistrement du client");
        }
        return;
      }

      // Construire le message de succès avec les détails de ce qui a été sauvegardé
      const savedItems = ["Client enregistré"];
      if (formData.code_barre) savedItems.push("code-barres");
      if (formData.code_barre_image_url) savedItems.push("image du code-barres");
      if (photoUrl) savedItems.push("photo du document");
      
      toast.success(`${savedItems.join(", ")} avec succès!`);
      navigate("/");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    handleInputChange,
    handleSubmit,
    confirmData,
    resetConfirmation
  };
};
