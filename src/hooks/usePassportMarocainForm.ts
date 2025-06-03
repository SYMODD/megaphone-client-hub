
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadClientPhoto } from "@/utils/storageUtils";
import { usePassportMarocainConfirmation } from "./usePassportMarocainConfirmation";

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

export const usePassportMarocainForm = () => {
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
        console.log("📤 Upload de l'image scannée en cours...");
        photoUrl = await uploadClientPhoto(formData.scannedImage, 'passeport_marocain');
        
        if (!photoUrl) {
          console.error("❌ Échec de l'upload de l'image");
          toast.error("Erreur lors du téléchargement de l'image. Enregistrement sans photo.");
          // Continue sans photo plutôt que d'arrêter complètement
        } else {
          console.log("✅ Image uploadée avec succès:", photoUrl);
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

  return {
    formData,
    isLoading,
    confirmedData,
    isConfirmed,
    handleInputChange,
    handleSubmit,
    confirmData,
    resetConfirmation
  };
};

export type { PassportMarocainFormData };
