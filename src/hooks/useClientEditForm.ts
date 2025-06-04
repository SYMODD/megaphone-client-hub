
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Client } from "./useClientData/types";

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

  useEffect(() => {
    if (client) {
      console.log("🔄 useClientEditForm - Initialisation avec client:", {
        id: client.id,
        nom: client.nom,
        prenom: client.prenom,
        code_barre_image_url: client.code_barre_image_url,
        url_presente: client.code_barre_image_url ? "✅ OUI" : "❌ NON"
      });

      setFormData({
        nom: client.nom || "",
        prenom: client.prenom || "",
        nationalite: client.nationalite || "",
        numero_passeport: client.numero_passeport || "",
        numero_telephone: client.numero_telephone || "",
        code_barre: client.code_barre || "",
        date_enregistrement: client.date_enregistrement || "",
        observations: client.observations || "",
        code_barre_image_url: client.code_barre_image_url || ""
      });
    }
  }, [client]);

  const updateFormData = (field: string, value: string) => {
    console.log(`📝 useClientEditForm - Mise à jour ${field}:`, value);
    
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      if (field === 'code_barre_image_url') {
        console.log("🎯 MISE À JOUR URL IMAGE CODE-BARRES:", {
          ancienne_url: prev.code_barre_image_url,
          nouvelle_url: value,
          client_id: client?.id
        });
      }
      
      return newData;
    });
  };

  const handleSave = async (onSuccess?: () => void) => {
    if (!client) {
      console.error("❌ Aucun client à sauvegarder");
      return;
    }

    setLoading(true);

    try {
      console.log("💾 useClientEditForm - SAUVEGARDE CLIENT:", {
        client_id: client.id,
        formData: {
          ...formData,
          code_barre_image_url_present: formData.code_barre_image_url ? "✅ OUI" : "❌ NON"
        }
      });

      const { data, error } = await supabase
        .from('clients')
        .update({
          nom: formData.nom,
          prenom: formData.prenom,
          nationalite: formData.nationalite,
          numero_passeport: formData.numero_passeport,
          numero_telephone: formData.numero_telephone || null,
          code_barre: formData.code_barre || null,
          observations: formData.observations || null,
          date_enregistrement: formData.date_enregistrement,
          code_barre_image_url: formData.code_barre_image_url || null
        })
        .eq('id', client.id)
        .select()
        .single();

      if (error) {
        console.error("❌ Erreur sauvegarde:", error);
        throw error;
      }

      // 🎯 LOG DE CONFIRMATION DEMANDÉ
      if (data?.code_barre_image_url) {
        console.log("🎊 CONFIRMATION EDIT - URL code-barres sauvegardée:", data.code_barre_image_url);
      }

      console.log("✅ Client sauvegardé avec succès");
      toast.success("Client modifié avec succès");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde");
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
