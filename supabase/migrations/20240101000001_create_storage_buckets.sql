
-- Créer les buckets de stockage pour les images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('client-photos', 'client-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('barcode-images', 'barcode-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[])
ON CONFLICT (id) DO NOTHING;

-- Politiques pour client-photos
CREATE POLICY "Allow public access to client photos" ON storage.objects
FOR SELECT USING (bucket_id = 'client-photos');

CREATE POLICY "Allow authenticated users to upload client photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'client-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their client photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'client-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to delete their client photos" ON storage.objects
FOR DELETE USING (bucket_id = 'client-photos' AND auth.role() = 'authenticated');

-- Politiques pour barcode-images  
CREATE POLICY "Allow public access to barcode images" ON storage.objects
FOR SELECT USING (bucket_id = 'barcode-images');

CREATE POLICY "Allow authenticated users to upload barcode images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'barcode-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their barcode images" ON storage.objects
FOR UPDATE USING (bucket_id = 'barcode-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to delete their barcode images" ON storage.objects
FOR DELETE USING (bucket_id = 'barcode-images' AND auth.role() = 'authenticated');
