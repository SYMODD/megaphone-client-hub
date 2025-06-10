
-- Vérifier et activer l'extension pgcrypto avec les bonnes permissions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS public.upsert_security_setting(text, text, boolean, text);

-- Recréer la fonction avec une syntaxe corrigée et une meilleure gestion d'erreur
CREATE OR REPLACE FUNCTION public.upsert_security_setting(
  p_setting_key text, 
  p_setting_value text, 
  p_is_encrypted boolean, 
  p_description text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_old_value_hash TEXT;
  v_new_value_hash TEXT;
  v_action TEXT;
  v_old_record RECORD;
  v_current_user_id UUID;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  v_current_user_id := auth.uid();
  
  -- Vérifier que l'utilisateur est connecté
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;

  -- Vérifier que l'utilisateur est admin (ou email spécial pour l'admin principal)
  IF NOT (
    public.is_admin() OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = v_current_user_id 
      AND email = 'essbane.salim@gmail.com'
    )
  ) THEN
    RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent modifier les paramètres de sécurité';
  END IF;

  -- Calculer le hash de la nouvelle valeur (conversion explicite en bytea)
  v_new_value_hash := encode(digest(p_setting_value::bytea, 'sha256'), 'hex');

  -- Vérifier si le paramètre existe déjà
  SELECT * INTO v_old_record 
  FROM public.security_settings 
  WHERE setting_key = p_setting_key;

  IF FOUND THEN
    -- Mise à jour
    v_action := 'UPDATE';
    v_old_value_hash := encode(digest(v_old_record.setting_value::bytea, 'sha256'), 'hex');
    
    UPDATE public.security_settings 
    SET 
      setting_value = CASE 
        WHEN p_is_encrypted THEN crypt(p_setting_value, gen_salt('bf', 8))
        ELSE p_setting_value
      END,
      is_encrypted = p_is_encrypted,
      description = p_description,
      updated_at = now(),
      updated_by = v_current_user_id
    WHERE setting_key = p_setting_key;
  ELSE
    -- Insertion
    v_action := 'INSERT';
    v_old_value_hash := NULL;
    
    INSERT INTO public.security_settings (
      setting_key, 
      setting_value, 
      is_encrypted, 
      description, 
      updated_by
    ) VALUES (
      p_setting_key,
      CASE 
        WHEN p_is_encrypted THEN crypt(p_setting_value, gen_salt('bf', 8))
        ELSE p_setting_value
      END,
      p_is_encrypted,
      p_description,
      v_current_user_id
    );
  END IF;

  -- Enregistrer dans l'audit log avec gestion d'erreur améliorée
  BEGIN
    INSERT INTO public.security_audit_log (
      setting_key,
      action,
      old_value_hash,
      new_value_hash,
      changed_by,
      ip_address,
      user_agent
    ) VALUES (
      p_setting_key,
      v_action,
      v_old_value_hash,
      v_new_value_hash,
      v_current_user_id,
      COALESCE(
        current_setting('request.headers', true)::json->>'x-real-ip', 
        current_setting('request.headers', true)::json->>'x-forwarded-for',
        'unknown'
      ),
      COALESCE(current_setting('request.headers', true)::json->>'user-agent', 'unknown')
    );
  EXCEPTION WHEN OTHERS THEN
    -- Si l'audit log échoue, on continue quand même mais on log l'erreur
    RAISE WARNING 'Impossible d''enregistrer dans l''audit log: %', SQLERRM;
  END;
  
  -- Log de succès pour debug
  RAISE NOTICE 'Paramètre % sauvegardé avec succès (action: %)', p_setting_key, v_action;
END;
$function$;

-- Donner les permissions appropriées
GRANT EXECUTE ON FUNCTION public.upsert_security_setting(text, text, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_security_setting(text, text, boolean, text) TO service_role;

-- Vérifier que la fonction a été créée correctement
SELECT 
  p.proname as function_name,
  pg_get_function_result(p.oid) as return_type,
  pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'upsert_security_setting';
