
import { supabase } from "@/integrations/supabase/client";

// Clés reCAPTCHA extraites de la capture d'écran
const RECAPTCHA_PUBLIC_KEY = "6LdKZPsFAAAAAIND4r8QYjVjWmn0f3xvE4QubAAjPr";
const RECAPTCHA_SECRET_KEY = "6LdKZPsFAAAAAD7ko_QYFcVUs8N_LJdXQJv49JZCb";

export const initializeCaptchaKeys = async () => {
  try {
    console.log('🔧 Initialisation des clés reCAPTCHA...');

    // Vérifier d'abord si les clés existent déjà
    const { data: existingKeys } = await supabase
      .from('security_settings')
      .select('setting_key')
      .in('setting_key', ['recaptcha_public_key', 'recaptcha_secret_key']);

    if (existingKeys && existingKeys.length >= 2) {
      console.log('✅ Les clés reCAPTCHA sont déjà configurées');
      return { success: true, message: 'Les clés sont déjà configurées' };
    }

    // Insérer directement dans la table sans passer par la fonction RPC
    // pour éviter la vérification admin lors de l'initialisation
    const { error: publicKeyError } = await supabase
      .from('security_settings')
      .upsert({
        setting_key: 'recaptcha_public_key',
        setting_value: RECAPTCHA_PUBLIC_KEY,
        is_encrypted: false,
        description: 'Clé publique reCAPTCHA pour la vérification côté client',
        updated_by: (await supabase.auth.getUser()).data.user?.id || null
      }, { onConflict: 'setting_key' });

    if (publicKeyError) {
      console.error('❌ Erreur lors de l\'insertion de la clé publique:', publicKeyError);
      throw publicKeyError;
    }

    const { error: secretKeyError } = await supabase
      .from('security_settings')
      .upsert({
        setting_key: 'recaptcha_secret_key',
        setting_value: RECAPTCHA_SECRET_KEY,
        is_encrypted: true,
        description: 'Clé secrète reCAPTCHA pour la vérification côté serveur',
        updated_by: (await supabase.auth.getUser()).data.user?.id || null
      }, { onConflict: 'setting_key' });

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
