
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClientFormData {
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  scannedImage: string | null;
  observations: string;
  date_enregistrement: string;
}

export const useClientFormLogic = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<ClientFormData>({
    nom: "",
    prenom: "",
    nationalite: "",
    numero_passeport: "",
    scannedImage: null,
    observations: "",
    date_enregistrement: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadImage = async (imageBase64: string): Promise<string | null> => {
    try {
      // Convert base64 to blob
      const response = await fetch(imageBase64);
      const blob = await response.blob();
      
      // Generate unique filename
      const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('client-photos')
        .upload(filename, blob, {
          contentType: 'image/jpeg'
        });

      if (error) {
        console.error('Error uploading image:', error);
        toast.error("Erreur lors du téléchargement de l'image");
        return null;
      }

      // Get public URL
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
    if (!user || !profile) {
      toast.error("Vous devez être connecté pour ajouter un client");
      return;
    }

    setIsLoading(true);

    try {
      let photoUrl = null;
      
      // Upload image if present
      if (formData.scannedImage) {
        photoUrl = await uploadImage(formData.scannedImage);
      }

      // Insert client data - removed point_operation as it doesn't exist in clients table
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
          agent_id: user.id
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

      toast.success("Client enregistré avec succès!");
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
    handleSubmit
  };
};
