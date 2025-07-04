-- 🔍 DIAGNOSTIC COMPLET DES POLICIES MFA
-- À exécuter dans l'interface Supabase SQL Editor

-- 1️⃣ Vérifier l'existence des tables
SELECT 'Tables existantes:' as diagnostic;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('security_events', 'user_mfa_status');

-- 2️⃣ Vérifier les policies actuelles
SELECT 'Policies existantes:' as diagnostic;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('security_events', 'user_mfa_status')
ORDER BY tablename, policyname;

-- 3️⃣ Vérifier le profil utilisateur actuel
SELECT 'Profil utilisateur actuel:' as diagnostic;
SELECT id, email, role, point_operation
FROM profiles 
WHERE id = auth.uid();

-- 4️⃣ CORRECTION : Ajouter les policies INSERT manquantes

-- 🔐 Policies INSERT pour security_events
DROP POLICY IF EXISTS "Users can insert their own security events" ON security_events;
CREATE POLICY "Users can insert their own security events"
    ON security_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert security events" ON security_events;
CREATE POLICY "System can insert security events"
    ON security_events FOR INSERT
    WITH CHECK (true);

-- 📊 Policies INSERT pour user_mfa_status
DROP POLICY IF EXISTS "Users can insert their own MFA status" ON user_mfa_status;
CREATE POLICY "Users can insert their own MFA status"
    ON user_mfa_status FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can insert MFA status" ON user_mfa_status;
CREATE POLICY "Admins can insert MFA status"
    ON user_mfa_status FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'superviseur')
        )
    );

-- 🔄 Policy ALL pour user_mfa_status (nécessaire pour upsert)
DROP POLICY IF EXISTS "Users can upsert their own MFA status" ON user_mfa_status;
CREATE POLICY "Users can upsert their own MFA status"
    ON user_mfa_status FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5️⃣ Vérifier les policies après correction
SELECT 'Policies après correction:' as diagnostic;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('security_events', 'user_mfa_status')
ORDER BY tablename, policyname;

-- 6️⃣ Test d'insertion pour vérifier que ça fonctionne
SELECT 'Test d''insertion:' as diagnostic;

-- Test insert security_events
INSERT INTO security_events (
    user_id, 
    event_type, 
    ip_address, 
    user_agent, 
    metadata
) VALUES (
    auth.uid(),
    'login',
    '127.0.0.1',
    'Test Browser',
    '{"test": true}'
);

-- Test upsert user_mfa_status
INSERT INTO user_mfa_status (
    user_id, 
    enabled, 
    enrolled_at, 
    updated_at
) VALUES (
    auth.uid(),
    true,
    now(),
    now()
) ON CONFLICT (user_id) DO UPDATE SET
    enabled = EXCLUDED.enabled,
    enrolled_at = EXCLUDED.enrolled_at,
    updated_at = EXCLUDED.updated_at;

SELECT 'Tests réussis ! Le système MFA devrait maintenant fonctionner.' as diagnostic; 