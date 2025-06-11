
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
      console.log('💾 [SAVE] DÉBUT sauvegarde clés reCAPTCHA');
      
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

      console.log('✅ [SAVE] Clés reCAPTCHA sauvegardées - DÉCLENCHEMENT SYNCHRONISATION');
      
      // CORRECTION MAJEURE : Synchronisation en 3 étapes avec attente
      
      // 1. Toast immédiat
      toast.success('✅ Clés reCAPTCHA sauvegardées');
      
      // 2. Refresh local immédiat
      setTimeout(() => {
        refreshSettings();
      }, 100);
      
      // 3. Notification globale FORCÉE
      setTimeout(() => {
        console.log('📢 [SAVE] NOTIFICATION GLOBALE FORCÉE');
        notifyRecaptchaSettingsUpdate();
      }, 200);
      
      // 4. Deuxième vague de notifications pour s'assurer
      setTimeout(() => {
        console.log('📢 [SAVE] DEUXIÈME VAGUE de notifications');
        notifyRecaptchaSettingsUpdate();
      }, 500);
      
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
      console.log('🗑️ [CLEAR] DÉBUT suppression clés reCAPTCHA');
      
      const { error } = await supabase
        .from('security_settings')
        .delete()
        .in('setting_key', ['recaptcha_site_key', 'recaptcha_secret_key']);

      if (error) throw error;

      console.log('✅ [CLEAR] Clés supprimées - DÉCLENCHEMENT SYNCHRONISATION');
      
      // Synchronisation similaire à la sauvegarde
      toast.success('🗑️ Clés reCAPTCHA supprimées');
      
      setTimeout(() => {
        refreshSettings();
      }, 100);
      
      setTimeout(() => {
        notifyRecaptchaSettingsUpdate();
      }, 200);
      
      setTimeout(() => {
        notifyRecaptchaSettingsUpdate();
      }, 500);
      
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
