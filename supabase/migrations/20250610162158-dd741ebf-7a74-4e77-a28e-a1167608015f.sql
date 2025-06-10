
-- Activer l'extension pgcrypto si elle n'est pas déjà activée
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Recréer la fonction avec une gestion d'erreur améliorée
CREATE OR REPLACE FUNCTION public.upsert_security_setting(p_setting_key text, p_setting_value text, p_is_encrypted boolean, p_description text)
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
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent modifier les paramètres de sécurité';
  END IF;

  -- Calculer le hash de la nouvelle valeur en utilisant sha256
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
      updated_by = auth.uid()
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
      auth.uid()
    );
  END IF;

  -- Enregistrer dans l'audit log avec gestion d'erreur
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
      auth.uid(),
      COALESCE(current_setting('request.headers', true)::json->>'x-real-ip', 'unknown'),
      COALESCE(current_setting('request.headers', true)::json->>'user-agent', 'unknown')
    );
  EXCEPTION WHEN OTHERS THEN
    -- Si l'audit log échoue, on continue quand même
    RAISE WARNING 'Impossible d''enregistrer dans l''audit log: %', SQLERRM;
  END;
END;
$function$;
