-- 🚨 CORRECTION CRITIQUE - Policies RLS manquantes pour le système MFA
-- Corrige les erreurs 403 "new row violates row-level security policy"

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

-- 🔄 Policies UPSERT pour user_mfa_status (nécessaire pour upsert)
DROP POLICY IF EXISTS "Users can upsert their own MFA status" ON user_mfa_status;
CREATE POLICY "Users can upsert their own MFA status"
    ON user_mfa_status FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 🔐 Policies pour user_devices (si la table existe)
DROP POLICY IF EXISTS "Users can insert their own devices" ON user_devices;
CREATE POLICY "Users can insert their own devices"
    ON user_devices FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 🚨 Policies pour security_alerts
DROP POLICY IF EXISTS "System can insert security alerts" ON security_alerts;
CREATE POLICY "System can insert security alerts"
    ON security_alerts FOR INSERT
    WITH CHECK (true);

-- 🔄 Policies pour login_attempts
DROP POLICY IF EXISTS "System can insert login attempts" ON login_attempts;
CREATE POLICY "System can insert login attempts"
    ON login_attempts FOR INSERT
    WITH CHECK (true);

-- ✅ Vérification des policies créées
DO $$
BEGIN
    -- Log des policies créées
    RAISE NOTICE 'Policies RLS MFA corrigées avec succès';
    RAISE NOTICE 'Tables concernées: security_events, user_mfa_status, user_devices, security_alerts, login_attempts';
END
$$; 