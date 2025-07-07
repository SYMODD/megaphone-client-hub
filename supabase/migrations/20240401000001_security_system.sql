-- 🔐 SUPABASE PRO - Migration pour sécurité renforcée admin/superviseur
-- Création des tables pour MFA, devices, événements de sécurité et alertes

-- 📱 Table des appareils utilisateur
CREATE TABLE IF NOT EXISTS user_devices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fingerprint text NOT NULL,
    name text NOT NULL,
    user_agent text NOT NULL,
    ip text NOT NULL,
    location jsonb,
    first_seen timestamp with time zone DEFAULT now(),
    last_seen timestamp with time zone DEFAULT now(),
    trusted boolean DEFAULT false,
    approved boolean DEFAULT false,
    risk_score integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 🔐 Table des événements de sécurité
CREATE TABLE IF NOT EXISTS security_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email text,
    user_role text,
    event_type text NOT NULL,
    device_fingerprint text,
    ip_address text NOT NULL,
    user_agent text NOT NULL,
    location jsonb,
    metadata jsonb DEFAULT '{}',
    risk_score integer DEFAULT 0,
    blocked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- 🚨 Table des alertes de sécurité
CREATE TABLE IF NOT EXISTS security_alerts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type text NOT NULL,
    severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email text,
    user_role text,
    message text NOT NULL,
    details jsonb DEFAULT '{}',
    resolved boolean DEFAULT false,
    resolved_at timestamp with time zone,
    resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 🔄 Table des tentatives de connexion pour rate limiting
CREATE TABLE IF NOT EXISTS login_attempts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address text NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email text,
    success boolean DEFAULT false,
    blocked boolean DEFAULT false,
    user_agent text,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now()
);

-- 🚫 Table des IP bannies
CREATE TABLE IF NOT EXISTS banned_ips (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address text NOT NULL UNIQUE,
    reason text NOT NULL,
    banned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    active boolean DEFAULT true,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- 📊 Table des statuts MFA
CREATE TABLE IF NOT EXISTS user_mfa_status (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    enabled boolean DEFAULT false,
    secret_key text, -- Secret TOTP chiffré
    enrolled_at timestamp with time zone,
    last_verified timestamp with time zone,
    backup_codes text[], -- Codes de récupération chiffrés
    device_name text,
    grace_period_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 🔧 Table de configuration de sécurité
CREATE TABLE IF NOT EXISTS security_config (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    mfa_enabled boolean DEFAULT true,
    mfa_required boolean DEFAULT false,
    mfa_enforce_roles text[] DEFAULT '{"admin", "superviseur"}',
    mfa_grace_period_days integer DEFAULT 7,
    device_tracking_enabled boolean DEFAULT true,
    device_max_per_user integer DEFAULT 3,
    device_require_approval boolean DEFAULT true,
    device_notify_new boolean DEFAULT true,
    rate_limiting_enabled boolean DEFAULT true,
    rate_limit_attempts integer DEFAULT 5,
    rate_limit_window_minutes integer DEFAULT 15,
    rate_limit_ban_minutes integer DEFAULT 30,
    monitoring_enabled boolean DEFAULT true,
    monitoring_actions text[] DEFAULT '{"login", "logout", "mfa_setup", "device_trust", "password_change"}',
    alert_failed_logins integer DEFAULT 3,
    alert_suspicious_activity integer DEFAULT 5,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 🔍 Indexes pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_fingerprint ON user_devices(fingerprint);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_risk_score ON security_events(risk_score);
CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON security_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_resolved ON security_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_banned_ips_active ON banned_ips(active);
CREATE INDEX IF NOT EXISTS idx_user_mfa_status_user_id ON user_mfa_status(user_id);

-- 🔐 Row Level Security (RLS) Policies
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mfa_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_config ENABLE ROW LEVEL SECURITY;

-- 👤 Policies pour user_devices
CREATE POLICY "Users can view their own devices"
    ON user_devices FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices"
    ON user_devices FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all devices"
    ON user_devices FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'superviseur')
        )
    );

-- 👤 Policies pour security_events
CREATE POLICY "Users can view their own security events"
    ON security_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all security events"
    ON security_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'superviseur')
        )
    );

-- 👤 Policies pour security_alerts
CREATE POLICY "Users can view their own alerts"
    ON security_alerts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view and manage all alerts"
    ON security_alerts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'superviseur')
        )
    );

-- 👤 Policies pour user_mfa_status
CREATE POLICY "Users can view their own MFA status"
    ON user_mfa_status FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own MFA status"
    ON user_mfa_status FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all MFA status"
    ON user_mfa_status FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'superviseur')
        )
    );

-- 👤 Policies pour security_config
CREATE POLICY "Admins can manage security config"
    ON security_config FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 🔧 Triggers pour automatiser certaines actions
CREATE OR REPLACE FUNCTION update_user_device_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_device_timestamp
    BEFORE UPDATE ON user_devices
    FOR EACH ROW
    EXECUTE FUNCTION update_user_device_last_seen();

-- 📊 Fonction pour nettoyer les anciennes données
CREATE OR REPLACE FUNCTION cleanup_old_security_data()
RETURNS void AS $$
BEGIN
    -- Nettoyer les tentatives de connexion anciennes (> 30 jours)
    DELETE FROM login_attempts 
    WHERE created_at < now() - interval '30 days';
    
    -- Nettoyer les événements de sécurité anciens (> 90 jours)
    DELETE FROM security_events 
    WHERE created_at < now() - interval '90 days' 
    AND risk_score < 30;
    
    -- Nettoyer les alertes résolues anciennes (> 60 jours)
    DELETE FROM security_alerts 
    WHERE resolved = true 
    AND resolved_at < now() - interval '60 days';
    
    -- Désactiver les IP bannies expirées
    UPDATE banned_ips 
    SET active = false 
    WHERE expires_at < now() 
    AND active = true;
END;
$$ LANGUAGE plpgsql;

-- 🌐 Insérer la configuration par défaut
INSERT INTO security_config (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING; 