
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useCaptchaSettings = () => {
  const [publicKey, setPublicKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCaptchaSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 [useCaptchaSettings] Récupération des paramètres CAPTCHA...');
      
      // Récupérer directement depuis la table security_settings
      const { data, error: dbError } = await supabase
        .from('security_settings')
        .select('setting_key, setting_value, is_encrypted')
        .eq('setting_key', 'recaptcha_public_key')
        .single();

      if (dbError) {
        console.error('❌ [useCaptchaSettings] Erreur base de données:', dbError);
        
        if (dbError.code === 'PGRST116') {
          setError('Aucune clé CAPTCHA configurée');
        } else {
          setError(`Erreur de récupération: ${dbError.message}`);
        }
        setPublicKey("");
        return;
      }

      if (!data) {
        console.warn('⚠️ [useCaptchaSettings] Aucune clé publique trouvée');
        setError('Aucune clé CAPTCHA configurée');
        setPublicKey("");
        return;
      }

      console.log('✅ [useCaptchaSettings] Clé publique récupérée:', {
        setting_key: data.setting_key,
        is_encrypted: data.is_encrypted,
        value_length: data.setting_value?.length || 0
      });

      // Pour la clé publique, elle ne devrait pas être chiffrée
      if (data.setting_value) {
        setPublicKey(data.setting_value);
        setError(null);
        console.log('🔑 [useCaptchaSettings] Clé publique définie avec succès');
      } else {
        setError('Clé publique vide');
        setPublicKey("");
      }

    } catch (error: any) {
      console.error('❌ [useCaptchaSettings] Erreur générale:', error);
      setError(error.message || 'Erreur inconnue');
      setPublicKey("");
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    console.log('🔄 [useCaptchaSettings] Refetch demandé');
    fetchCaptchaSettings();
  };

  useEffect(() => {
    fetchCaptchaSettings();
  }, []);

  // Debug des valeurs actuelles
  useEffect(() => {
    console.log('📊 [useCaptchaSettings] État actuel:', {
      publicKey: publicKey || '[VIDE]',
      isLoading,
      error: error || '[AUCUNE]'
    });
  }, [publicKey, isLoading, error]);

  return {
    publicKey,
    isLoading,
    error,
    refetch
  };
};
