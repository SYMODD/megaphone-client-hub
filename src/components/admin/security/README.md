
# Gestion de la sécurité - Module reCAPTCHA

## Vue d'ensemble

Ce module fournit une interface sécurisée pour la gestion des clés reCAPTCHA avec les fonctionnalités suivantes :

### Fonctionnalités principales

1. **Gestion des clés reCAPTCHA**
   - Configuration de la clé publique (non chiffrée)
   - Configuration de la clé secrète (automatiquement chiffrée)
   - Interface utilisateur intuitive avec masquage des valeurs sensibles

2. **Sécurité renforcée**
   - Chiffrement automatique des clés secrètes
   - Masquage des valeurs dans l'interface après sauvegarde
   - Accès restreint aux administrateurs uniquement
   - Audit complet de toutes les modifications

3. **Journal d'audit**
   - Traçabilité complète des modifications
   - Hash des valeurs pour éviter l'exposition des données sensibles
   - Informations sur l'utilisateur, l'IP et l'agent utilisateur
   - Historique horodaté des actions

### Architecture de sécurité

#### Tables de base de données

- `security_settings` : Stockage sécurisé des paramètres avec chiffrement
- `security_audit_log` : Journal d'audit complet des modifications
- `security_settings_view` : Vue sécurisée qui masque automatiquement les valeurs chiffrées

#### Fonctions de sécurité

- `upsert_security_setting()` : Gestion sécurisée des paramètres avec audit automatique
- `is_admin()` : Vérification des droits d'administration

#### Politiques RLS (Row Level Security)

- Accès restreint aux administrateurs uniquement
- Isolation des données par utilisateur
- Protection contre les accès non autorisés

### Utilisation

#### Pour les administrateurs

1. Accéder à la section "Sécurité" dans le menu d'administration
2. Configurer les clés reCAPTCHA dans l'onglet "Configuration reCAPTCHA"
3. Consulter l'historique des modifications dans l'onglet "Journal d'audit"

#### Pour les développeurs

```typescript
import { useSecuritySettings } from "@/hooks/useSecuritySettings";

const { upsertSecuritySetting, getSecuritySettings } = useSecuritySettings();

// Sauvegarder une clé publique
await upsertSecuritySetting(
  'recaptcha_public_key',
  '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  false,
  'Clé publique reCAPTCHA'
);

// Sauvegarder une clé secrète (chiffrée automatiquement)
await upsertSecuritySetting(
  'recaptcha_secret_key',
  '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
  true,
  'Clé secrète reCAPTCHA'
);
```

### Conformité et sécurité

- **RGPD** : Chiffrement des données sensibles et audit complet
- **SOC 2** : Traçabilité et contrôle d'accès rigoureux
- **PCI DSS** : Sécurisation des clés et données critiques
- **ISO 27001** : Gestion des accès et protection des informations

### Avertissements de sécurité

⚠️ **Important** : 
- Les clés secrètes sont automatiquement chiffrées et ne peuvent plus être visualisées après sauvegarde
- Toutes les modifications sont auditées et tracées
- L'accès est restreint aux administrateurs uniquement
- Ne jamais partager les clés secrètes ou les copier dans des environnements non sécurisés

### Support et maintenance

Pour toute question ou problème relatif à ce module :

1. Vérifier les logs d'audit pour identifier les problèmes
2. Consulter la documentation Supabase pour les fonctions de chiffrement
3. Contacter l'équipe de développement pour les problèmes critiques

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024  
**Auteur** : Équipe Sud Megaphone
