# 🔧 Guide de Correction MFA - Megaphone Client Hub

## 🚨 Problème Identifié

Les erreurs `400` et `406` dans la console indiquent que les **policies RLS** (Row Level Security) manquent pour les opérations d'insertion sur les tables `security_events` et `user_mfa_status`.

### Erreurs Observées :
- `Failed to load resource: the server responded with a status of 400` pour `security_events`
- `Failed to load resource: the server responded with a status of 406` pour `user_mfa_status`

## ✅ Solution Appliquée

### 1. Correction du Hook `useSecuritySystem.ts`
- ✅ Gestion robuste des erreurs avec try/catch
- ✅ Requêtes simplifiées avec `maybeSingle()`
- ✅ Utilisation d'`upsert` pour éviter les conflits
- ✅ Logs détaillés pour diagnostic

### 2. Script de Correction SQL Créé
Le fichier `fix_mfa_policies.sql` contient les policies RLS manquantes.

## 🔧 Étapes de Correction

### Étape 1 : Exécuter le Script SQL dans Supabase

1. **Aller dans l'interface Supabase :**
   - Connectez-vous à votre projet Supabase
   - Allez dans **SQL Editor**

2. **Exécuter le script de correction :**
   ```sql
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
   ```

3. **Vérifier les policies créées :**
   ```sql
   -- ✅ Vérification des policies existantes
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
   FROM pg_policies 
   WHERE tablename IN ('security_events', 'user_mfa_status')
   ORDER BY tablename, policyname;
   ```

### Étape 2 : Vérifier la Création des Tables

Si les erreurs persistent, vérifiez que les tables existent :

```sql
-- Vérifier l'existence des tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('security_events', 'user_mfa_status');

-- Si les tables n'existent pas, exécuter les migrations
-- Voir les fichiers dans supabase/migrations/
```

### Étape 3 : Tester l'Interface

1. **Rafraîchir l'application** (F5)
2. **Aller sur /security** en tant qu'admin
3. **Tenter d'activer le MFA**
4. **Vérifier les logs de console** pour confirmer la résolution

## 🔍 Diagnostic des Logs

### Logs de Succès Attendus :
```
🔐 Chargement stats sécurité pour: e15f44ac-784a-4659-8243-acbf5b468809
✅ Statut MFA récupéré: false
✅ Événements sécurité récupérés: 0
✅ Stats sécurité chargées avec succès
🔐 Activation MFA pour utilisateur: e15f44ac-784a-4659-8243-acbf5b468809
✅ MFA activé avec succès
```

### Si les Erreurs Persistent :

1. **Vérifier les permissions utilisateur :**
   ```sql
   SELECT id, email, role FROM profiles WHERE email = 'votre-email@domain.com';
   ```

2. **Vérifier que l'utilisateur est admin/superviseur :**
   ```sql
   SELECT * FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superviseur');
   ```

3. **Créer manuellement un enregistrement MFA pour test :**
   ```sql
   INSERT INTO user_mfa_status (user_id, enabled, enrolled_at, updated_at)
   VALUES (auth.uid(), true, now(), now());
   ```

## 🎯 Fonctionnalités Testées

Après correction, l'interface /security devrait permettre :

- ✅ **Affichage du score de sécurité** (65% par défaut)
- ✅ **Configuration MFA** avec bouton Configurer/Inactif
- ✅ **Simulation de vérification** avec code à 6 chiffres
- ✅ **Activation/désactivation** du MFA
- ✅ **Logs d'événements** de sécurité

## 🚀 Améliorations Futures

1. **Intégration vraie MFA** avec TOTP (Google Authenticator)
2. **Détection de nouveaux appareils**
3. **Alertes de sécurité en temps réel**
4. **Dashboard monitoring avancé**

## 📞 Support

Si le problème persiste après ces étapes :

1. Vérifier les logs détaillés dans la console
2. Confirmer que les migrations ont été appliquées
3. Vérifier les permissions RLS dans Supabase
4. Contacter le support technique avec les logs d'erreur

---

✅ **Cette correction devrait résoudre définitivement les erreurs MFA !** 