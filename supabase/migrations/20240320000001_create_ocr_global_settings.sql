-- Création de la table ocr_global_settings
CREATE TABLE IF NOT EXISTS public.ocr_global_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    api_key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Insérer une ligne par défaut
INSERT INTO public.ocr_global_settings (api_key)
VALUES ('helloworld')
ON CONFLICT DO NOTHING;

-- Politiques RLS
ALTER TABLE public.ocr_global_settings ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire la clé
CREATE POLICY "Allow all users to read OCR global settings"
ON public.ocr_global_settings
FOR SELECT
TO authenticated
USING (true);

-- Seuls les admins peuvent modifier la clé
CREATE POLICY "Allow admins to update OCR global settings"
ON public.ocr_global_settings
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Seuls les admins peuvent insérer une nouvelle clé
CREATE POLICY "Allow admins to insert OCR global settings"
ON public.ocr_global_settings
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Seuls les admins peuvent supprimer la clé
CREATE POLICY "Allow admins to delete OCR global settings"
ON public.ocr_global_settings
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
); 