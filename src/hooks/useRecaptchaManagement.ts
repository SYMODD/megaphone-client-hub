
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

      console.log('✅ [SAVE] Clés reCAPTCHA sauvegardées - SYNCHRONISATION IMMÉDIATE');
      
      // Toast immédiat
      toast.success('✅ Clés reCAPTCHA sauvegardées');
      
      // SYNCHRONISATION SUPER AGRESSIVE - 6 étapes
      console.log('📢 [SAVE] DÉMARRAGE synchronisation super agressive');
      
      // Étape 1 : Refresh local immédiat
      setTimeout(() => {
        console.log('📢 [SAVE] Étape 1 - Refresh local');
        refreshSettings();
      }, 50);
      
      // Étape 2 : Première notification globale
      setTimeout(() => {
        console.log('📢 [SAVE] Étape 2 - Première notification');
        notifyRecaptchaSettingsUpdate();
      }, 100);
      
      // Étape 3 : Deuxième vague
      setTimeout(() => {
        console.log('📢 [SAVE] Étape 3 - Deuxième vague');
        notifyRecaptchaSettingsUpdate();
      }, 300);
      
      // Étape 4 : Troisième vague
      setTimeout(() => {
        console.log('📢 [SAVE] Étape 4 - Troisième vague');
        notifyRecaptchaSettingsUpdate();
      }, 600);
      
      // Étape 5 : Dernière vague pour être sûr
      setTimeout(() => {
        console.log('📢 [SAVE] Étape 5 - Dernière vague');
        notifyRecaptchaSettingsUpdate();
      }, 1000);
      
      // Étape 6 : Notification finale après 2 secondes
      setTimeout(() => {
        console.log('📢 [SAVE] Étape 6 - Notification finale');
        notifyRecaptchaSettingsUpdate();
      }, 2000);
      
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

      console.log('✅ [CLEAR] Clés supprimées - SYNCHRONISATION IMMÉDIATE');
      
      toast.success('🗑️ Clés reCAPTCHA supprimées');
      
      // Synchronisation similaire à la sauvegarde
      setTimeout(() => refreshSettings(), 50);
      setTimeout(() => notifyRecaptchaSettingsUpdate(), 100);
      setTimeout(() => notifyRecaptchaSettingsUpdate(), 300);
      setTimeout(() => notifyRecaptchaSettingsUpdate(), 600);
      
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
