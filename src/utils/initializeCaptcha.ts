
import { supabase } from "@/integrations/supabase/client";

// Clés reCAPTCHA extraites de la capture d'écran
const RECAPTCHA_PUBLIC_KEY = "6LdKZPsFAAAAAIND4r8QYjVjWmn0f3xvE4QubAAjPr";
const RECAPTCHA_SECRET_KEY = "6LdKZPsFAAAAAD7ko_QYFcVUs8N_LJdXQJv49JZCb";

export const initializeCaptchaKeys = async () => {
  try {
    console.log('🔧 Initialisation des clés reCAPTCHA...');

    // Insérer la clé publique (non chiffrée)
    const { error: publicKeyError } = await supabase.rpc('upsert_security_setting', {
      p_setting_key: 'recaptcha_public_key',
      p_setting_value: RECAPTCHA_PUBLIC_KEY,
      p_is_encrypted: false,
      p_description: 'Clé publique reCAPTCHA pour la vérification côté client'
    });

    if (publicKeyError) {
      console.error('❌ Erreur lors de l\'insertion de la clé publique:', publicKeyError);
      throw publicKeyError;
    }

    // Insérer la clé secrète (chiffrée)
    const { error: secretKeyError } = await supabase.rpc('upsert_security_setting', {
      p_setting_key: 'recaptcha_secret_key',
      p_setting_value: RECAPTCHA_SECRET_KEY,
      p_is_encrypted: true,
      p_description: 'Clé secrète reCAPTCHA pour la vérification côté serveur'
    });

    if (secretKeyError) {
      console.error('❌ Erreur lors de l\'insertion de la clé secrète:', secretKeyError);
      throw secretKeyError;
    }

    console.log('✅ Clés reCAPTCHA configurées avec succès');
    return { success: true };

  } catch (error) {
    console.error('🚨 Erreur lors de l\'initialisation des clés reCAPTCHA:', error);
    return { success: false, error };
  }
};
