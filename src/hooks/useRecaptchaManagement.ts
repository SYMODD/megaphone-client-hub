
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useRecaptchaSettings, notifyRecaptchaSettingsUpdate } from './useRecaptchaSettings';

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
      console.log('💾 [SAVE] Début de la sauvegarde des clés reCAPTCHA');
      
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

      console.log('✅ [SAVE] Clés reCAPTCHA sauvegardées avec succès');
      toast.success('Clés reCAPTCHA sauvegardées avec succès');
      
      // Déclencher la mise à jour immédiate de tous les hooks
      console.log('🔄 [SAVE] Déclenchement de la mise à jour globale');
      refreshSettings();
      
      // Notifier toutes les autres instances dans l'application
      setTimeout(() => {
        notifyRecaptchaSettingsUpdate();
      }, 100); // Petit délai pour s'assurer que la DB est mise à jour
      
    } catch (error) {
      console.error('❌ [SAVE] Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde des clés');
    } finally {
      setSaving(false);
    }
  };

  const clearSettings = async () => {
    setSaving(true);
    
    try {
      console.log('🗑️ [CLEAR] Début de la suppression des clés reCAPTCHA');
      
      const { error } = await supabase
        .from('security_settings')
        .delete()
        .in('setting_key', ['recaptcha_site_key', 'recaptcha_secret_key']);

      if (error) throw error;

      console.log('✅ [CLEAR] Clés reCAPTCHA supprimées avec succès');
      toast.success('Clés reCAPTCHA supprimées');
      
      // Déclencher la mise à jour immédiate
      refreshSettings();
      
      // Notifier toutes les autres instances
      setTimeout(() => {
        notifyRecaptchaSettingsUpdate();
      }, 100);
      
    } catch (error) {
      console.error('❌ [CLEAR] Erreur lors de la suppression:', error);
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
