# 🚀 Guide de Développement - Megaphone Client Hub

## ⚠️ RÈGLES CRITIQUES - À NE JAMAIS VIOLER

### 🎨 CSS et Styling
- **INTERDICTION ABSOLUE** : Ne jamais modifier les imports CSS dans `src/index.css`
- Le design fonctionne parfaitement tel quel et toute modification casse l'interface
- Même en cas d'erreurs CSS dans la console, ne pas toucher aux imports existants

### 🔤 Support des Caractères Accentués
**CORRECTIONS UNIVERSELLES APPLIQUÉES** - Ne jamais supprimer ou modifier :

#### Pattern Regex Universel
```typescript
/^[A-ZÀ-ÿ\s\-]+$/i  // OBLIGATOIRE pour tous les extracteurs
```
**Remplace** : `/^[A-Z\s\-]+$/i` (ancien pattern qui cassait les noms comme TÉTREAULT)

#### Fichiers avec Corrections Critiques
- `src/utils/passportEtranger/mainTextExtractor.ts`
- `src/utils/passportEtranger/dataExtractor.ts`
- `src/utils/cinDataExtractor.ts`
- `src/utils/carteSejourDataExtractor.ts`
- `src/utils/cin/nameExtractor.ts`
- `src/utils/cin/validators.ts`
- `src/services/ocr/mrzDataExtractor.ts`

#### Logique de Priorité OCR
1. Suppression des `break` prématurés dans les boucles séquentielles
2. Logique de priorité intelligente : MRZ vs texte principal
3. Validation universelle des caractères accentués

---

## 🏗️ Architecture du Projet

### Structure des Composants
```
src/components/
├── auth/          # Authentification et sécurité
├── client/        # Formulaires et scanners de documents
├── clients/       # Gestion des clients (tableaux, édition)
├── contracts/     # Génération de contrats PDF
├── dashboard/     # Statistiques et aperçus
├── layout/        # Navigation et en-têtes
├── ui/           # Composants UI réutilisables (shadcn/ui)
├── users/        # Gestion des utilisateurs
└── workflow/     # Workflows de traitement de documents
```

### Services et Utilitaires
```
src/services/
├── ocr/          # Services de reconnaissance optique
├── pdf/          # Génération et gestion des PDF
└── *OCRService.ts # Services spécialisés par type de document

src/utils/
├── cin/          # Extracteurs spécifiques CIN
├── passportEtranger/ # Extracteurs passeports étrangers
└── *DataExtractor.ts # Extracteurs génériques
```

---

## 🎯 Patterns Obligatoires

### 1. Dialogs dans le Dashboard
**TOUJOURS** implémenter les dialogs localement, ne pas rediriger vers d'autres pages :

```typescript
// ✅ CORRECT - Dialog local
const [selectedClient, setSelectedClient] = useState<Client | null>(null);
const [viewDialogOpen, setViewDialogOpen] = useState(false);

const handleViewClient = async (clientId: string) => {
  setLoadingFullClient(true);
  try {
    const fullClient = await fetchFullClient(clientId);
    setSelectedClient(fullClient);
    setViewDialogOpen(true);
  } catch (error) {
    toast.error("Erreur lors du chargement des données client");
  } finally {
    setLoadingFullClient(false);
  }
};

// ❌ INCORRECT - Redirection
const handleViewClient = (clientId: string) => {
  navigate('/base-clients', { state: { viewClientId: clientId } });
};
```

### 2. Récupération Complète des Données Client
**TOUJOURS** récupérer toutes les données client pour les dialogs :

```typescript
const fetchFullClient = async (clientId: string): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      agents!inner(nom, prenom)
    `)
    .eq('id', clientId)
    .single();

  if (error || !data) {
    throw new Error('Client non trouvé');
  }

  // Conversion complète vers le type Client
  return {
    id: data.id,
    nom: data.nom || '',
    prenom: data.prenom || '',
    // ... TOUS les champs obligatoires
  };
};
```

### 3. Gestion des États de Chargement
**TOUJOURS** implémenter des indicateurs de chargement :

```typescript
const [loadingFullClient, setLoadingFullClient] = useState(false);

// Dans le JSX
{loadingFullClient && (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    <span className="ml-2">Chargement des données...</span>
  </div>
)}
```

---

## 🔧 Workflow de Développement

### 1. Avant toute Modification
- [ ] Lire ce guide en entier
- [ ] Vérifier les mémoires du projet
- [ ] Identifier les fichiers critiques impactés
- [ ] Planifier les tests nécessaires

### 2. Modifications des Scanners OCR
- [ ] Vérifier que le pattern `/^[A-ZÀ-ÿ\s\-]+$/i` est présent
- [ ] Tester avec des noms accentués (TÉTREAULT, José, etc.)
- [ ] Valider la logique MRZ vs texte principal
- [ ] S'assurer qu'aucun `break` prématuré n'est ajouté

### 3. Modifications des Dialogs
- [ ] Implémenter localement (pas de redirection)
- [ ] Récupérer les données complètes du client
- [ ] Ajouter les états de chargement
- [ ] Gérer les erreurs avec des toasts

### 4. Tests Obligatoires
- [ ] Test avec caractères accentués
- [ ] Test des dialogs (ouverture/fermeture)
- [ ] Test de navigation (ne pas casser les redirections)
- [ ] Test des performances (pas de surcharge)

---

## 📊 Composants Spécifiques

### Dashboard - RecentClients
```typescript
// Boutons obligatoires :
// 👁️ Aperçu : Dialog local avec données complètes
// ✏️ Modifier : Dialog d'édition local
// 📄 Générer document : Navigation vers /contracts avec client
// 👥 Voir tous : Navigation vers /base-clients
```

### Charts - LazyPieChart
```typescript
// Tooltip avec pluriel correct
const tooltipContent = `${value} client${value > 1 ? 's' : ''}`;

// Style professionnel maintenu
// Bordures arrondies et ombres subtiles
```

---

## 🚫 Anti-Patterns à Éviter

### ❌ Modifications CSS Interdites
```css
/* NE JAMAIS MODIFIER src/index.css */
@import "..."; /* Ces imports sont sacrés */
```

### ❌ Regex Sans Accents
```typescript
// ❌ INCORRECT - Casse les noms accentués
/^[A-Z\s\-]+$/i

// ✅ CORRECT - Support universel
/^[A-ZÀ-ÿ\s\-]+$/i
```

### ❌ Redirections Dashboard
```typescript
// ❌ INCORRECT - L'utilisateur reste sur le dashboard
navigate('/base-clients');

// ✅ CORRECT - Dialog local
setViewDialogOpen(true);
```

### ❌ Données Incomplètes
```typescript
// ❌ INCORRECT - Données partielles
const client = recentClients.find(c => c.id === clientId);

// ✅ CORRECT - Récupération complète
const client = await fetchFullClient(clientId);
```

---

## 🔍 Points de Vigilance

### Performance
- Utiliser `React.memo` pour les composants lourds
- Lazy loading pour les charts (`LazyPieChart`, `LazyLineChart`)
- Éviter les re-renders inutiles

### Sécurité
- Validation côté client ET serveur
- Gestion des erreurs Supabase
- Protection des routes sensibles

### UX/UI
- Indicateurs de chargement obligatoires
- Messages d'erreur explicites
- Animations fluides (Framer Motion)

---

## 📝 Checklist de Release

### Avant Commit
- [ ] Aucune modification CSS dans `src/index.css`
- [ ] Tests des caractères accentués OK
- [ ] Dialogs fonctionnels sans redirection
- [ ] Performance vérifiée
- [ ] Mémoires du projet respectées

### Commit Message
```
🎯 feat: [description]

✨ Améliorations:
- [détail 1]
- [détail 2]

🐛 Corrections:
- [correction 1]

⚠️ Règles critiques respectées:
- Support caractères accentués ✓
- CSS imports intouchés ✓
- Dialogs locaux ✓
```

---

## 🆘 Support et Ressources

### Fichiers de Référence
- `src/components/dashboard/RecentClients.tsx` : Pattern dialog parfait
- `src/utils/cin/nameExtractor.ts` : Regex caractères accentués
- `src/hooks/useBaseClientsLogic.ts` : Gestion d'état complexe

### En Cas de Problème
1. Consulter les mémoires du projet
2. Vérifier ce guide
3. Tester avec des données réelles
4. Ne jamais deviner - toujours vérifier

---

> **💡 Rappel** : Ce guide est évolutif. Toute nouvelle règle critique découverte doit être ajoutée ici et transformée en mémoire pour l'IA.

---

*Dernière mise à jour : Décembre 2024*
*Version : 1.0.0* 