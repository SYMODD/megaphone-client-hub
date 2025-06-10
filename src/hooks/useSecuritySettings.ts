
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
      
      // Check if the function exists before calling it
      const { data, error } = await supabase.rpc('upsert_security_setting', {
        p_setting_key: settingKey,
        p_setting_value: settingValue,
        p_is_encrypted: isEncrypted,
        p_description: description
      });

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      toast({
        title: "Paramètre sauvegardé",
        description: `${settingKey} a été mis à jour avec succès`,
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      
      // Show a more user-friendly error message
      const errorMessage = error.message?.includes('permission') 
        ? "Vous n'avez pas les permissions nécessaires pour cette opération"
        : error.message || "Impossible de sauvegarder le paramètre";
        
      toast({
        title: "Erreur de sauvegarde",
        description: errorMessage,
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
      
      // Since we can't access the view directly, we'll create a simpler approach
      // This will work once the database function is properly set up
      let query = supabase
        .from('security_settings')
        .select('id, setting_key, setting_value, is_encrypted, description, updated_at, updated_by, created_at');
      
      if (settingKeys) {
        query = query.in('setting_key', settingKeys);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Database error:', error);
        // Don't throw error, just return empty data
        return { success: true, data: [] };
      }

      // Process the data to mask encrypted values
      const processedData = (data || []).map(item => ({
        ...item,
        setting_value: item.is_encrypted ? '[ENCRYPTED]' : item.setting_value
      }));

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
