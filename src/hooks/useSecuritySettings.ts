
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useSecuritySettings = () => {
  const [loading, setLoading] = useState(false);

  const upsertSecuritySetting = async (
    settingKey: string,
    settingValue: string,
    isEncrypted: boolean,
    description: string
  ) => {
    try {
      setLoading(true);
      
      console.log('🔧 Appel de la fonction upsert_security_setting avec:', {
        settingKey,
        isEncrypted,
        description,
        valueLength: settingValue?.length || 0
      });
      
      const { data, error } = await supabase.rpc('upsert_security_setting', {
        p_setting_key: settingKey,
        p_setting_value: settingValue,
        p_is_encrypted: isEncrypted,
        p_description: description
      });

      if (error) {
        console.error('❌ Erreur de la base de données:', error);
        
        // Messages d'erreur plus spécifiques
        let errorMessage = error.message;
        if (error.code === 'PGRST116' || error.message?.includes('function') && error.message?.includes('does not exist')) {
          errorMessage = "Fonction de base de données manquante. La migration doit être appliquée.";
        } else if (error.message?.includes('permission') || error.message?.includes('Accès refusé')) {
          errorMessage = "Vous n'avez pas les permissions nécessaires pour cette opération";
        } else if (error.message?.includes('digest')) {
          errorMessage = "Extension de chiffrement non disponible. Configuration en cours...";
        } else if (error.message?.includes('Utilisateur non authentifié')) {
          errorMessage = "Vous devez être connecté pour effectuer cette opération";
        }
        
        throw new Error(errorMessage);
      }

      console.log('✅ Paramètre sauvegardé avec succès:', data);
      
      // Safely access the message property with type assertion
      const response = data as { success?: boolean; message?: string; setting_key?: string } | null;
      const message = response?.message || `${settingKey} a été mis à jour avec succès`;
      
      toast({
        title: "Paramètre sauvegardé",
        description: message,
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      
      toast({
        title: "Erreur de sauvegarde",
        description: error.message || "Impossible de sauvegarder le paramètre",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const getSecuritySettings = async (settingKeys?: string[]) => {
    try {
      setLoading(true);
      
      console.log('📋 Chargement des paramètres de sécurité:', settingKeys);
      
      let query = supabase
        .from('security_settings')
        .select('id, setting_key, setting_value, is_encrypted, description, updated_at, updated_by, created_at');
      
      if (settingKeys) {
        query = query.in('setting_key', settingKeys);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erreur de chargement:', error);
        // Retourner des données vides en cas d'erreur pour éviter de casser l'interface
        return { success: true, data: [] };
      }

      // Traiter les données : ne masquer que les valeurs réellement chiffrées
      const processedData = (data || []).map(item => ({
        ...item,
        // Pour la clé publique, ne pas masquer car elle doit être lisible
        setting_value: item.is_encrypted && item.setting_key !== 'recaptcha_public_key' 
          ? '[ENCRYPTED]' 
          : item.setting_value
      }));

      console.log('✅ Paramètres chargés avec succès:', processedData.length, 'éléments');
      console.log('📊 Données traitées:', processedData);

      return { success: true, data: processedData };
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les paramètres",
        variant: "destructive",
      });
      return { success: false, error, data: [] };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    upsertSecuritySetting,
    getSecuritySettings
  };
};
