-- 🔐 Script de correction des policies MFA manquantes
-- À exécuter dans l'interface Supabase SQL Editor

-- 🔧 Correction des policies RLS pour le système MFA
-- Ajout des policies INSERT manquantes

-- 🔐 Policies INSERT pour security_events
CREATE POLICY "Users can insert their own security events"
    ON security_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert security events"
    ON security_events FOR INSERT
    WITH CHECK (true);

-- 📊 Policies INSERT pour user_mfa_status  
CREATE POLICY "Users can insert their own MFA status"
    ON user_mfa_status FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can insert MFA status"
    ON user_mfa_status FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'superviseur')
        )
    );

-- 🔄 Policies UPSERT pour user_mfa_status (nécessaire pour upsert)
CREATE POLICY "Users can upsert their own MFA status"
    ON user_mfa_status FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ✅ Vérification des policies existantes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('security_events', 'user_mfa_status')
ORDER BY tablename, policyname;

-- Vérifier que les policies ont été créées
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('user_mfa_status', 'security_events', 'user_devices')
ORDER BY tablename, cmd; 