
-- Activer RLS sur la table security_settings si ce n'est pas déjà fait
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Admins can read security settings" ON public.security_settings;
DROP POLICY IF EXISTS "Admins can manage security settings" ON public.security_settings;

-- Créer des politiques RLS pour permettre aux admins d'accéder aux paramètres de sécurité
CREATE POLICY "Admins can read security settings" 
  ON public.security_settings 
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "Admins can manage security settings" 
  ON public.security_settings 
  FOR ALL 
  USING (public.is_admin()) 
  WITH CHECK (public.is_admin());

-- Activer RLS sur la table security_audit_log aussi
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour permettre aux admins de voir les logs d'audit
CREATE POLICY "Admins can read audit logs" 
  ON public.security_audit_log 
  FOR SELECT 
  USING (public.is_admin());
