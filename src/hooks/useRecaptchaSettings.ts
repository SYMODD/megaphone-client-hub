
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RecaptchaSettings {
  siteKey: string | null;
  secretKey: string | null;
  isLoaded: boolean;
}

export const useRecaptchaSettings = () => {
  const [settings, setSettings] = useState<RecaptchaSettings>({
    siteKey: null,
    secretKey: null,
    isLoaded: false
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      console.log("🔑 Récupération des paramètres reCAPTCHA depuis security_settings");
      
      const { data, error } = await supabase
        .from('security_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['recaptcha_site_key', 'recaptcha_secret_key']);

      if (error) {
        console.error("❌ Erreur récupération paramètres reCAPTCHA:", error);
        return;
      }

      const siteKey = data?.find(s => s.setting_key === 'recaptcha_site_key')?.setting_value || null;
      const secretKey = data?.find(s => s.setting_key === 'recaptcha_secret_key')?.setting_value || null;

      setSettings({
        siteKey,
        secretKey,
        isLoaded: !!(siteKey && secretKey)
      });

      console.log("✅ Paramètres reCAPTCHA chargés:", {
        siteKey: siteKey ? "✅ Configuré" : "❌ Manquant",
        secretKey: secretKey ? "✅ Configuré" : "❌ Manquant"
      });
    } catch (error) {
      console.error("❌ Erreur lors du chargement des paramètres reCAPTCHA:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSiteKey = async (siteKey: string) => {
    try {
      console.log("💾 Mise à jour clé site reCAPTCHA");
      
      const { error } = await supabase.rpc('upsert_security_setting', {
        p_setting_key: 'recaptcha_site_key',
        p_setting_value: siteKey,
        p_is_encrypted: false,
        p_description: 'Clé publique reCAPTCHA v3 pour la validation côté client'
      });

      if (error) {
        console.error("❌ Erreur mise à jour clé site:", error);
        toast.error("Erreur lors de la sauvegarde de la clé site");
        return false;
      }

      await fetchSettings();
      toast.success("✅ Clé site reCAPTCHA mise à jour avec succès");
      return true;
    } catch (error) {
      console.error("❌ Erreur:", error);
      toast.error("Erreur lors de la mise à jour");
      return false;
    }
  };

  const updateSecretKey = async (secretKey: string) => {
    try {
      console.log("💾 Mise à jour clé secrète reCAPTCHA");
      
      const { error } = await supabase.rpc('upsert_security_setting', {
        p_setting_key: 'recaptcha_secret_key',
        p_setting_value: secretKey,
        p_is_encrypted: true,
        p_description: 'Clé secrète reCAPTCHA v3 pour la validation côté serveur'
      });

      if (error) {
        console.error("❌ Erreur mise à jour clé secrète:", error);
        toast.error("Erreur lors de la sauvegarde de la clé secrète");
        return false;
      }

      await fetchSettings();
      toast.success("✅ Clé secrète reCAPTCHA mise à jour avec succès");
      return true;
    } catch (error) {
      console.error("❌ Erreur:", error);
      toast.error("Erreur lors de la mise à jour");
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    updateSiteKey,
    updateSecretKey,
    refreshSettings: fetchSettings
  };
};
