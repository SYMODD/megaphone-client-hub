
-- Vérifier si la clé publique reCAPTCHA est présente dans la table security_settings
SELECT 
  id,
  setting_key,
  setting_value,
  is_encrypted,
  description,
  created_at,
  updated_at,
  updated_by
FROM public.security_settings 
WHERE setting_key = 'recaptcha_public_key';

-- Vérifier aussi tous les paramètres de sécurité pour avoir une vue d'ensemble
SELECT 
  setting_key,
  CASE 
    WHEN is_encrypted THEN '[ENCRYPTED]'
    ELSE LEFT(setting_value, 20) || '...'
  END as value_preview,
  is_encrypted,
  description,
  updated_at
FROM public.security_settings 
ORDER BY setting_key;
