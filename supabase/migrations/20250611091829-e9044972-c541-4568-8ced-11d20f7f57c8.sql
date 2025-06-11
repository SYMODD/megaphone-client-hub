
-- Vérifier l'état actuel de la table security_settings
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
ORDER BY created_at DESC;

-- Vérifier si la fonction upsert_security_setting existe et fonctionne
SELECT routine_name, routine_type, data_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'upsert_security_setting';

-- Test manuel d'insertion d'une clé de test pour diagnostiquer le problème
INSERT INTO public.security_settings (
  setting_key,
  setting_value,
  is_encrypted,
  description,
  updated_by
) VALUES (
  'test_key',
  'test_value',
  false,
  'Clé de test pour diagnostic',
  (SELECT id FROM auth.users LIMIT 1)
) 
ON CONFLICT (setting_key) 
DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now(),
  updated_by = EXCLUDED.updated_by;
