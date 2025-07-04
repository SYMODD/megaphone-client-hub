# 🔐 Guide de Déploiement - Sécurité Renforcée Supabase Pro

## 📋 **Vue d'Ensemble**

Ce guide vous accompagne dans le déploiement complet du système de sécurité renforcée utilisant les fonctionnalités natives Supabase Pro :

- ✅ **Authentification Multi-Facteurs (MFA)** native Supabase
- ✅ **Détection automatique de nouveaux appareils** avec géolocalisation
- ✅ **Rate Limiting intelligent** avec Edge Functions
- ✅ **Monitoring en temps réel** avec triggers de base de données
- ✅ **Dashboard admin** pour surveillance complète
- ✅ **Row Level Security (RLS)** renforcé

---

## 🚀 **Étape 1: Configuration Supabase Dashboard**

### 1.1 Activation du MFA dans Supabase

```bash
# Connectez-vous à votre dashboard Supabase Pro
https://app.supabase.com/project/[PROJECT_ID]

# Naviguez vers Authentication > Settings
# Activez "Enable Multi-Factor Authentication"
# Configurez TOTP (Time-based One-Time Password)
```

### 1.2 Variables d'Environnement

```bash
# Ajoutez ces variables à votre .env.local
VITE_SUPABASE_URL=https://bwljyrhvhumqtsmakavm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 🔑 Service Role Key nécessaire pour les fonctions admin
# Obtenez-la depuis Settings > API > service_role (secret)
```

---

## 🗄️ **Étape 2: Migration de la Base de Données**

### 2.1 Exécution des Migrations

```bash
# Connectez-vous à votre CLI Supabase
npx supabase login

# Liez votre projet
npx supabase link --project-ref bwljyrhvhumqtsmakavm

# Appliquez les migrations
npx supabase db push

# Vérifiez que les tables sont créées
npx supabase db diff
```

### 2.2 Vérification des Tables Créées

Vérifiez dans le dashboard Supabase que ces tables existent :
- ✅ `user_devices` - Appareils utilisateur
- ✅ `security_events` - Événements de sécurité  
- ✅ `security_alerts` - Alertes admin
- ✅ `login_attempts` - Tentatives de connexion
- ✅ `banned_ips` - IPs bannies
- ✅ `user_mfa_status` - Statuts MFA
- ✅ `security_config` - Configuration sécurité

---

## 🌐 **Étape 3: Déploiement des Edge Functions**

### 3.1 Structure des Fonctions

```
supabase/functions/
├── _shared/cors.ts
├── security-monitor/index.ts
└── admin-force-logout/index.ts (optionnel)
```

### 3.2 Déploiement

```bash
# Déployez la fonction de monitoring sécuritaire
npx supabase functions deploy security-monitor

# Vérifiez le déploiement
npx supabase functions list

# Testez la fonction
curl -X POST 'https://bwljyrhvhumqtsmakavm.supabase.co/functions/v1/security-monitor' \
  -H 'Authorization: Bearer [ANON_KEY]' \
  -H 'Content-Type: application/json' \
  -d '{"action": "device_check", "userId": "test"}'
```

### 3.3 Configuration des Secrets

```bash
# Configurez les secrets pour les Edge Functions
npx supabase secrets set IPAPI_KEY=your-ipapi-key
npx supabase secrets set SMTP_HOST=your-smtp-host
npx supabase secrets set SMTP_USER=your-smtp-user
npx supabase secrets set SMTP_PASS=your-smtp-password
```

---

## 📱 **Étape 4: Intégration Frontend**

### 4.1 Wrapper de Sécurité dans App.tsx

```tsx
// src/App.tsx
import { SecurityWrapper } from '@/components/security/SecurityWrapper';

function App() {
  return (
    <SecurityWrapper 
      enforceForRoles={['admin', 'superviseur']}
      showSecurityStatus={true}
    >
      {/* Votre application existante */}
      <YourExistingApp />
    </SecurityWrapper>
  );
}
```

### 4.2 Intégration dans AuthContext

```tsx
// Modifiez src/contexts/AuthContext.tsx
import { useSecurity } from '@/hooks/useSecurity';

// Ajoutez dans le signIn pour déclencher les vérifications
const signIn = async (email: string, password: string) => {
  // ... votre logique existante ...
  
  // Déclencher la vérification de sécurité après connexion
  const deviceInfo = await getDeviceInfo();
  await supabase.functions.invoke('security-monitor', {
    body: {
      action: 'device_check',
      userId: data.user.id,
      userRole: profileData?.role,
      deviceInfo
    }
  });
  
  return { data, error };
};
```

### 4.3 Ajout des Routes de Sécurité

```tsx
// src/App.tsx - Ajoutez ces routes
import { SecuritySettings } from '@/components/security/SecurityWrapper';

<Route path="/security" element={
  <RoleProtectedRoute allowedRoles={['admin', 'superviseur', 'agent']}>
    <SecuritySettings />
  </RoleProtectedRoute>
} />
```

---

## ⚙️ **Étape 5: Configuration Avancée**

### 5.1 Personnalisation des Seuils de Sécurité

```sql
-- Modifiez la configuration par défaut
UPDATE security_config SET 
  mfa_required = true,
  mfa_enforce_roles = '{"admin", "superviseur"}',
  device_max_per_user = 3,
  rate_limit_attempts = 5,
  rate_limit_window_minutes = 15,
  alert_failed_logins = 3;
```

### 5.2 Configuration des Notifications Email

```sql
-- Configurez les paramètres de notification
INSERT INTO security_config (
  device_notify_new,
  monitoring_enabled,
  monitoring_actions
) VALUES (
  true,
  true,
  '{"login", "logout", "mfa_setup", "device_trust", "password_change"}'
);
```

### 5.3 Politique RLS Personnalisée

```sql
-- Exemple de politique RLS stricte pour les admins
CREATE POLICY "Super strict admin access" 
  ON security_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
      AND profiles.statut = 'actif'
    )
    AND 
    EXISTS (
      SELECT 1 FROM user_mfa_status
      WHERE user_mfa_status.user_id = auth.uid()
      AND user_mfa_status.enabled = true
    )
  );
```

---

## 🔍 **Étape 6: Tests et Validation**

### 6.1 Test du MFA

```bash
# 1. Connectez-vous en tant qu'admin/superviseur
# 2. Vérifiez l'alerte MFA dans l'interface
# 3. Configurez le MFA via QR Code
# 4. Testez la vérification du code
```

### 6.2 Test de Détection d'Appareils

```bash
# 1. Connectez-vous depuis un nouvel appareil/navigateur
# 2. Vérifiez l'alerte de nouvel appareil
# 3. Vérifiez l'email de notification
# 4. Approuvez/Refusez l'appareil
```

### 6.3 Test du Rate Limiting

```bash
# Simulation d'attaque par force brute
for i in {1..10}; do
  curl -X POST 'https://your-app.com/api/login' \
    -d '{"email":"test@test.com","password":"wrong"}'
done

# Vérifiez le blocage après 5 tentatives
```

### 6.4 Test du Dashboard Admin

```bash
# 1. Connectez-vous en tant qu'admin
# 2. Naviguez vers /security
# 3. Vérifiez les statistiques en temps réel
# 4. Testez les actions admin (bannir IP, réinitialiser MFA)
```

---

## 📊 **Étape 7: Monitoring et Maintenance**

### 7.1 Surveillance des Performances

```sql
-- Requête pour surveiller les performances
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as events_count,
  AVG(risk_score) as avg_risk,
  COUNT(CASE WHEN blocked THEN 1 END) as blocked_count
FROM security_events 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

### 7.2 Nettoyage Automatique

```sql
-- Exécutez cette fonction périodiquement (cron job)
SELECT cleanup_old_security_data();

-- Ou configurez un trigger automatique
CREATE OR REPLACE FUNCTION schedule_cleanup()
RETURNS void AS $$
BEGIN
  -- Nettoyer tous les dimanche à 2h du matin
  IF EXTRACT(dow FROM NOW()) = 0 AND EXTRACT(hour FROM NOW()) = 2 THEN
    PERFORM cleanup_old_security_data();
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### 7.3 Alertes Critiques

```sql
-- Requête pour identifier les risques élevés
SELECT 
  user_email,
  user_role,
  COUNT(*) as high_risk_events,
  MAX(risk_score) as max_risk
FROM security_events 
WHERE 
  created_at > NOW() - INTERVAL '24 hours'
  AND risk_score > 70
GROUP BY user_email, user_role
HAVING COUNT(*) > 3
ORDER BY max_risk DESC;
```

---

## 🚀 **Étape 8: Mise en Production**

### 8.1 Checklist de Déploiement

- [ ] ✅ Variables d'environnement configurées
- [ ] ✅ Migrations de base de données appliquées
- [ ] ✅ Edge Functions déployées et testées
- [ ] ✅ MFA activé dans Supabase Dashboard
- [ ] ✅ Politiques RLS vérifiées
- [ ] ✅ Tests de sécurité réussis
- [ ] ✅ Monitoring configuré
- [ ] ✅ Notifications email fonctionnelles
- [ ] ✅ Documentation utilisateur créée

### 8.2 Configuration DNS et SSL

```bash
# Si vous utilisez un domaine personnalisé
# Configurez les headers de sécurité
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
```

### 8.3 Sauvegarde de Sécurité

```sql
-- Sauvegardez la configuration de sécurité
pg_dump --table=security_config --table=user_mfa_status --data-only > security_backup.sql

-- Restauration en cas de problème
psql -f security_backup.sql
```

---

## 🛡️ **Fonctionnalités Disponibles**

### Pour les Utilisateurs
- 🔐 **Configuration MFA** volontaire ou obligatoire
- 📱 **Gestion des appareils** de confiance
- 🔍 **Historique sécuritaire** personnel
- 🚨 **Alertes en temps réel** pour activités suspectes

### Pour les Administrateurs
- 📊 **Dashboard de sécurité** en temps réel
- 🚫 **Bannissement d'IPs** temporaire/permanent
- 👤 **Gestion MFA utilisateurs** (réinitialisation)
- 📈 **Rapports de sécurité** détaillés
- 🔄 **Déconnexion forcée** des utilisateurs

### Fonctionnalités Automatiques
- 🔍 **Détection nouveaux appareils** avec géolocalisation
- ⚡ **Rate limiting** intelligent par IP
- 📧 **Notifications email** automatiques
- 🎯 **Scoring de risque** basé sur l'activité
- 🗄️ **Archivage automatique** des anciennes données

---

## 🔧 **Dépannage**

### Problèmes Courants

1. **MFA ne fonctionne pas**
   ```sql
   -- Vérifiez la configuration MFA
   SELECT * FROM auth.mfa_factors WHERE user_id = '[USER_ID]';
   ```

2. **Edge Functions en erreur**
   ```bash
   # Vérifiez les logs
   npx supabase functions logs security-monitor
   ```

3. **RLS bloque les requêtes**
   ```sql
   -- Vérifiez les politiques
   SELECT * FROM pg_policies WHERE tablename = 'security_events';
   ```

4. **Géolocalisation ne fonctionne pas**
   ```bash
   # Vérifiez l'API ipapi.co
   curl https://ipapi.co/json/
   ```

---

## 📞 **Support**

En cas de problème :
1. Consultez les logs Supabase Dashboard
2. Vérifiez les logs des Edge Functions
3. Testez la connectivité aux APIs externes
4. Contactez le support Supabase Pro si nécessaire

---

## 🎯 **Prochaines Étapes**

Fonctionnalités avancées à implémenter :
- 🔐 **WebAuthn/FIDO2** pour authentification biométrique
- 🤖 **ML/AI** pour détection d'anomalies comportementales
- 🌐 **SSO Integration** avec Azure AD, Google Workspace
- 📱 **Push notifications** via service workers
- 🔄 **Audit trail** complet avec signatures cryptographiques

Cette implémentation fournit une base solide et scalable pour la sécurité de votre application, en utilisant pleinement les capacités de Supabase Pro. 