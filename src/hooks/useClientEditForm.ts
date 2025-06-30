import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/hooks/useClientData/types";

interface FormData {
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  numero_telephone: string;
  code_barre: string;
  date_enregistrement: string;
  observations: string;
  code_barre_image_url: string;
}

export const useClientEditForm = (client: Client | null) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nom: "",
    prenom: "",
    nationalite: "",
    numero_passeport: "",
    numero_telephone: "",
    code_barre: "",
    date_enregistrement: "",
    observations: "",
    code_barre_image_url: ""
  });

  // Update form data when client changes, but preserve uploaded image URL
  useEffect(() => {
    if (client) {
      setFormData(prev => {
        // 🎯 CORRECTION: Toujours mettre à jour avec les données du client
        // Si c'est la même URL, pas de problème, sinon on prend la nouvelle
        const newFormData = {
          nom: client.nom,
          prenom: client.prenom,
          nationalite: client.nationalite,
          numero_passeport: client.numero_passeport,
          numero_telephone: client.numero_telephone || "",
          code_barre: client.code_barre || "",
          date_enregistrement: client.date_enregistrement,
          observations: client.observations || "",
          code_barre_image_url: client.code_barre_image_url || "",
        };
        
        console.log('🔄 useClientEditForm - Mise à jour formData:', {
          client_id: client.id,
          prev_code_barre_image_url: prev.code_barre_image_url,
          new_code_barre_image_url: newFormData.code_barre_image_url,
          updated_at: client.updated_at
        });
        
        return newFormData;
      });
    }
  }, [client]);

  const updateFormData = (field: keyof FormData, value: string) => {
    console.log(`🔄 useClientEditForm - updateFormData: ${field} = ${value}`);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (onSuccess: () => void) => {
    if (!client) return;

    try {
      setLoading(true);
      console.log('🚀 useClientEditForm - DÉBUT handleSave:', {
        client_id: client.id,
        formData_code_barre_image_url: formData.code_barre_image_url,
        client_code_barre_image_url: client.code_barre_image_url,
        all_formData: formData
      });

      // 🔍 DIAGNOSTIC: Vérifier les données avant la sauvegarde
      const updateData = {
        nom: formData.nom,
        prenom: formData.prenom,
        nationalite: formData.nationalite,
        numero_passeport: formData.numero_passeport,
        numero_telephone: formData.numero_telephone || null,
        code_barre: formData.code_barre || null,
        code_barre_image_url: formData.code_barre_image_url || null,
        observations: formData.observations || null,
        updated_at: new Date().toISOString()
      };
      
      console.log('🔍 useClientEditForm - Données à sauvegarder:', {
        client_id: client.id,
        updateData: updateData
      });

      const { error, data } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', client.id)
        .select('*'); // Récupérer les données après mise à jour

      if (error) {
        console.error('❌ useClientEditForm - Erreur lors de la sauvegarde:', error);
        toast({
          title: "Erreur",
          description: "Erreur lors de la sauvegarde",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ useClientEditForm - Sauvegarde réussie en base de données');
      console.log('📊 useClientEditForm - URL sauvegardée:', formData.code_barre_image_url);
      console.log('🔍 useClientEditForm - Données retournées par Supabase:', data);

      toast({
        title: "Succès",
        description: "Client modifié avec succès",
      });

      console.log('🔄 useClientEditForm - Appel onSuccess...');
      onSuccess();
    } catch (error) {
      console.error('❌ useClientEditForm - Erreur inattendue:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log('🏁 useClientEditForm - FIN handleSave');
    }
  };

  return {
    formData,
    loading,
    updateFormData,
    handleSave
  };
};
