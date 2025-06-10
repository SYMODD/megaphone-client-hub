
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
      
      const { data, error } = await supabase.rpc('upsert_security_setting', {
        p_setting_key: settingKey,
        p_setting_value: settingValue,
        p_is_encrypted: isEncrypted,
        p_description: description
      });

      if (error) throw error;

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
      
      let query = supabase
        .from('security_settings_view')
        .select('*');
      
      if (settingKeys) {
        query = query.in('setting_key', settingKeys);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement:', error);
      toast({
        title: "Erreur de chargement",
        description: error.message || "Impossible de charger les paramètres",
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
