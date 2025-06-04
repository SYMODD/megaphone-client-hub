
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
        const newFormData = {
          nom: client.nom,
          prenom: client.prenom,
          nationalite: client.nationalite,
          numero_passeport: client.numero_passeport,
          numero_telephone: client.numero_telephone || "",
          code_barre: client.code_barre || "",
          date_enregistrement: client.date_enregistrement,
          observations: client.observations || "",
          // 🎯 CRUCIAL: Préserver l'URL uploadée si elle existe, sinon utiliser celle du client
          code_barre_image_url: prev.code_barre_image_url || client.code_barre_image_url || ""
        };

        console.log("🔄 useClientEditForm - Mise à jour formData:", {
          client_url: client.code_barre_image_url,
          previous_form_url: prev.code_barre_image_url,
          final_url: newFormData.code_barre_image_url,
          preservation: prev.code_barre_image_url ? "✅ URL PRÉSERVÉE" : "📥 URL CLIENT UTILISÉE"
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
      console.log('Mise à jour du client:', client.id, formData);

      const { error } = await supabase
        .from('clients')
        .update({
          nom: formData.nom,
          prenom: formData.prenom,
          nationalite: formData.nationalite,
          numero_passeport: formData.numero_passeport,
          numero_telephone: formData.numero_telephone || null,
          code_barre: formData.code_barre || null,
          code_barre_image_url: formData.code_barre_image_url || null,
          date_enregistrement: formData.date_enregistrement,
          observations: formData.observations,
          updated_at: new Date().toISOString()
        })
        .eq('id', client.id);

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        throw error;
      }

      toast({
        title: "Client mis à jour",
        description: `Les informations de ${formData.prenom} ${formData.nom} ont été mises à jour avec succès.`,
      });

      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le client. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    updateFormData,
    handleSave
  };
};
