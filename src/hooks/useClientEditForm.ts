import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/hooks/useClientData/types";
import { validateDocumentNumber, DocumentType } from "@/utils/documentTypeUtils";

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
  document_type: string;
  categorie: string;
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
    code_barre_image_url: "",
    document_type: "cin",
    categorie: "agence"
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
          document_type: client.document_type || "cin",
          categorie: client.categorie || "agence",
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

      // 🔍 VALIDATION: Vérifier le format du numéro de document
      const documentType = formData.document_type as DocumentType || 'cin';
      if (formData.numero_passeport && !validateDocumentNumber(formData.numero_passeport, documentType)) {
        toast({
          title: "Erreur de validation",
          description: `Le format du numéro de document est invalide pour le type "${documentType}".`,
          variant: "destructive",
        });
        return;
      }

      // 🔍 VALIDATION: Vérifier si le numéro de document est déjà utilisé par un autre client
      if (formData.numero_passeport && formData.numero_passeport !== client.numero_passeport) {
        const { data: existingClient, error: checkError } = await supabase
          .from('clients')
          .select('id, nom, prenom')
          .eq('numero_passeport', formData.numero_passeport)
          .neq('id', client.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = pas de résultat trouvé
          console.error('❌ useClientEditForm - Erreur lors de la vérification:', checkError);
        } else if (existingClient) {
          toast({
            title: "Numéro de document déjà utilisé",
            description: `Le numéro "${formData.numero_passeport}" est déjà utilisé par ${existingClient.prenom} ${existingClient.nom}.`,
            variant: "destructive",
          });
          return;
        }
      }

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
        document_type: formData.document_type,
        categorie: formData.categorie,
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
        
        // 🔍 Gestion spécifique des erreurs de contrainte unique
        if (error.code === '23505' && error.message.includes('clients_numero_passeport_key')) {
          toast({
            title: "Numéro de document déjà utilisé",
            description: `Le numéro "${formData.numero_passeport}" est déjà utilisé par un autre client. Veuillez vérifier ou utiliser un numéro différent.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur",
            description: `Erreur lors de la sauvegarde: ${error.message}`,
            variant: "destructive",
          });
        }
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
