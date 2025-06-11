
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useRecaptchaSettings } from './useRecaptchaSettings';
import { notifyRecaptchaSettingsUpdate } from './recaptcha/RecaptchaNotifications';

interface RecaptchaFormData {
  siteKey: string;
  secretKey: string;
}

export const useRecaptchaManagement = () => {
  const { profile } = useAuth();
  const { refreshSettings } = useRecaptchaSettings();
  const [saving, setSaving] = useState(false);

  const saveSettings = async (formData: RecaptchaFormData) => {
    if (!formData.siteKey.trim() || !formData.secretKey.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (!profile?.id) {
      toast.error('Utilisateur non identifié');
      return;
    }

    setSaving(true);
    
    try {
      console.log('💾 [CORRECTED_MANAGEMENT] Sauvegarde avec synchronisation');
      
      // Supprimer les anciennes clés
      await supabase
        .from('security_settings')
        .delete()
        .in('setting_key', ['recaptcha_site_key', 'recaptcha_secret_key']);

      // Insérer la clé publique
      const { error: siteKeyError } = await supabase
        .from('security_settings')
        .insert({
          setting_key: 'recaptcha_site_key',
          setting_value: formData.siteKey.trim(),
          updated_by: profile.id
        });

      if (siteKeyError) throw siteKeyError;

      // Insérer la clé secrète
      const { error: secretKeyError } = await supabase
        .from('security_settings')
        .insert({
          setting_key: 'recaptcha_secret_key',
          setting_value: formData.secretKey.trim(),
          updated_by: profile.id
        });

      if (secretKeyError) throw secretKeyError;

      console.log('✅ [CORRECTED_MANAGEMENT] Clés sauvegardées - déclenchement synchronisation');
      toast.success('✅ Clés reCAPTCHA sauvegardées');
      
      // Synchronisation automatique IMMÉDIATE
      setTimeout(() => {
        console.log('🔄 [CORRECTED_MANAGEMENT] Déclenchement actualisation globale');
        notifyRecaptchaSettingsUpdate();
        refreshSettings();
      }, 300);
      
    } catch (error) {
      console.error('❌ [CORRECTED_MANAGEMENT] Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde des clés');
    } finally {
      setSaving(false);
    }
  };

  const clearSettings = async () => {
    setSaving(true);
    
    try {
      console.log('🗑️ [CORRECTED_MANAGEMENT] Suppression avec synchronisation');
      
      const { error } = await supabase
        .from('security_settings')
        .delete()
        .in('setting_key', ['recaptcha_site_key', 'recaptcha_secret_key']);

      if (error) throw error;

      console.log('✅ [CORRECTED_MANAGEMENT] Clés supprimées - déclenchement synchronisation');
      toast.success('🗑️ Clés reCAPTCHA supprimées');
      
      // Synchronisation automatique IMMÉDIATE
      setTimeout(() => {
        console.log('🔄 [CORRECTED_MANAGEMENT] Déclenchement actualisation globale');
        notifyRecaptchaSettingsUpdate();
        refreshSettings();
      }, 300);
      
    } catch (error) {
      console.error('❌ [CORRECTED_MANAGEMENT] Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression des clés');
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    saveSettings,
    clearSettings
  };
};
