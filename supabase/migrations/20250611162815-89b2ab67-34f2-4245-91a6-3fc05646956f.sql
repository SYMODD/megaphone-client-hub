
-- Ajouter la colonne updated_by manquante à la table security_settings
ALTER TABLE public.security_settings 
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Ajouter la colonne is_encrypted pour supporter le chiffrement
ALTER TABLE public.security_settings 
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN NOT NULL DEFAULT false;

-- Mettre à jour les enregistrements existants avec l'utilisateur admin principal
UPDATE public.security_settings 
SET updated_by = (
  SELECT id FROM auth.users WHERE email = 'essbane.salim@gmail.com' LIMIT 1
)
WHERE updated_by IS NULL;

-- Rendre la colonne updated_by obligatoire maintenant qu'elle est remplie
ALTER TABLE public.security_settings 
ALTER COLUMN updated_by SET NOT NULL;

-- Insérer les entrées par défaut pour reCAPTCHA avec l'utilisateur admin
INSERT INTO public.security_settings (setting_key, setting_value, description, updated_by) 
VALUES 
  ('recaptcha_site_key', '', 'Clé publique reCAPTCHA v3 pour le frontend', 
   (SELECT id FROM auth.users WHERE email = 'essbane.salim@gmail.com' LIMIT 1)),
  ('recaptcha_secret_key', '', 'Clé secrète reCAPTCHA v3 pour la vérification backend',
   (SELECT id FROM auth.users WHERE email = 'essbane.salim@gmail.com' LIMIT 1))
ON CONFLICT (setting_key) DO UPDATE SET
  description = EXCLUDED.description,
  updated_by = EXCLUDED.updated_by;
