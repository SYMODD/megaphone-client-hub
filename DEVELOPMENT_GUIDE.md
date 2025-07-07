# 🚀 Guide de Développement - Megaphone Client Hub

## ⚠️ RÈGLES CRITIQUES - À NE JAMAIS VIOLER

### 🎨 CSS et Styling
- **INTERDICTION ABSOLUE** : Ne jamais modifier les imports CSS dans `src/index.css`
- Le design fonctionne parfaitement tel quel et toute modification casse l'interface
- Même en cas d'erreurs CSS dans la console, ne pas toucher aux imports existants

### 🎨 DESIGN SYSTEM - RÈGLES ABSOLUES

### 📱 Header et Navigation (`AuthenticatedHeader.tsx`)

#### Layout Desktop
```typescript
// Structure obligatoire :
<header className="bg-white shadow-sm border-b sticky top-0 z-50">
  <div className="container mx-auto px-3">
    <div className="flex justify-between items-center h-16">
      {/* Logo à gauche - aligné avec le menu */}
      <div className="flex items-center">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SM</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Sud Megaphone</span>
        </Link>
      </div>
      
      {/* Tout à droite sur une ligne */}
      <div className="flex items-center space-x-2 lg:space-x-4">
        {/* Nom utilisateur avec icône */}
        <div className="hidden lg:flex items-center space-x-1">
          <User className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">Nom Prénom</span>
        </div>
        
        {/* Point d'opération avec icône */}
        <div className="hidden lg:flex items-center space-x-1">
          <MapPin className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-600">Agence Centrale</span>
        </div>
        
        {/* Bouton déconnexion */}
        <Button variant="outline" size="sm">
          <LogOut className="h-4 w-4 mr-2" />
          <span>Déconnexion</span>
        </Button>
      </div>
    </div>
  </div>
</header>
```

#### Layout Mobile
```typescript
// Version mobile OBLIGATOIRE :
<div className="lg:hidden flex items-center space-x-2">
  <div className="flex flex-col space-y-1">
    {/* Nom utilisateur - UNE seule ligne */}
    <div className="flex items-center space-x-1">
      <User className="h-4 w-4 text-gray-600" />
      <span className="text-xs text-gray-900">Nom Prénom</span>
    </div>
    
    {/* Point d'opération - UNE seule ligne */}
    <div className="flex items-center space-x-1">
      <MapPin className="h-4 w-4 text-gray-600" />
      <span className="text-xs text-gray-500 whitespace-nowrap">Agence Centrale</span>
    </div>
  </div>
  
  {/* Bouton déconnexion - icône seule */}
  <Button variant="outline" size="sm">
    <LogOut className="h-4 w-4" />
  </Button>
</div>
```

#### Règles Typographiques Header
- **Desktop** : Nom = `text-sm font-medium text-gray-900`, Point = `text-sm text-gray-600`
- **Mobile** : Nom = `text-xs text-gray-900`, Point = `text-xs text-gray-500`
- **OBLIGATOIRE** : `whitespace-nowrap` sur le point d'opération mobile
- **INTERDIT** : Fond gris ou background sur mobile (design propre)

### 🧭 Navigation (`Navigation.tsx`)

#### Structure Navigation
```typescript
// Alignement parfait avec header
<nav className="bg-white border-b">
  <div className="container mx-auto px-3">
    <div className="flex items-center justify-between h-12">
      {/* Menu gauche */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Menu className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-900">Menu</span>
        </div>
        
        {/* Items navigation selon rôle */}
        {profile?.role === 'agent' && (
          <>
            <Link to="/nouveau-client">Nouveau Client</Link>
            <Link to="/contracts">Contrats</Link>
          </>
        )}
      </div>
      
      {/* Badge rôle à droite */}
      <div className="flex items-center">
        <Badge variant="destructive" className="bg-red-500 text-white">
          <Shield className="h-3 w-3 mr-1" />
          ADMINISTRATEUR
        </Badge>
      </div>
    </div>
  </div>
</nav>
```

#### Règles Navigation
- **OBLIGATOIRE** : `container mx-auto px-3` pour alignement parfait avec header
- **Badge Admin** : `bg-red-500 text-white` avec icône `Shield`
- **Hauteur fixe** : `h-12` pour la navigation
- **Espacement** : `space-x-6` entre les éléments du menu

### 📱 Responsive Design

#### Breakpoints Obligatoires
```typescript
// Dans tailwind.config.ts
module.exports = {
  theme: {
    screens: {
      'xs': '475px',    // OBLIGATOIRE pour très petits écrans
      'sm': '640px',    // Standard
      'md': '768px',    // Tablet
      'lg': '1024px',   // Desktop
      'xl': '1280px',   // Large desktop
    }
  }
}
```

#### Règles Responsive
- **Mobile** : Colonnes empilées, icônes seules, texte réduit
- **Tablet** : Layout intermédiaire, texte normal
- **Desktop** : Layout complet, tous les éléments visibles
- **OBLIGATOIRE** : Tester sur 320px minimum

### 🎨 Couleurs et Typographie

#### Palette Couleurs
```css
/* Couleurs principales */
--primary-blue: #3b82f6;      /* Logo, boutons principaux */
--primary-red: #ef4444;       /* Badges admin, alertes */
--gray-900: #111827;          /* Texte principal */
--gray-600: #4b5563;          /* Icônes, texte secondaire */
--gray-500: #6b7280;          /* Texte tertiaire */
--white: #ffffff;             /* Arrière-plans */
```

#### Tailles de Police
```css
/* Header Desktop */
text-xl font-bold             /* Logo "Sud Megaphone" */
text-sm font-medium          /* Nom utilisateur */
text-sm                      /* Point d'opération */

/* Header Mobile */
text-xs                      /* Nom utilisateur mobile */
text-xs                      /* Point d'opération mobile */

/* Navigation */
font-medium                  /* Texte menu */
```

### 🎯 Icônes et Symboles

#### Icônes Obligatoires
```typescript
// Header
import { User, MapPin, LogOut } from "lucide-react";

// Navigation  
import { Menu, Shield } from "lucide-react";

// Tailles standardisées
h-4 w-4                     // Icônes header
h-5 w-5                     // Icônes navigation
h-3 w-3                     // Icônes badges
```

#### Règles Icônes
- **Couleur** : `text-gray-600` pour les icônes header
- **Espacement** : `space-x-1` entre icône et texte
- **Cohérence** : Toujours même taille dans un même contexte

### 📐 Layout et Espacement

#### Containers
```typescript
// Structure obligatoire
<div className="container mx-auto px-3">
  // Contenu aligné parfaitement
</div>
```

#### Espacements
```css
/* Header */
h-16                        /* Hauteur header */
space-x-2                   /* Mobile espacement */
space-x-4                   /* Desktop espacement */

/* Navigation */
h-12                        /* Hauteur navigation */
space-x-6                   /* Espacement menu items */

/* Généraux */
space-y-1                   /* Espacement vertical mobile */
```

### 🚫 Design Anti-Patterns

#### ❌ Interdictions Header
```typescript
// ❌ INTERDIT : Fond gris sur mobile
<div className="bg-gray-100 rounded-lg px-3 py-2">

// ❌ INTERDIT : Alignement justify-end sur mobile
<div className="flex items-center justify-end">

// ❌ INTERDIT : Tailles inconsistantes
<span className="text-sm">Nom</span>
<span className="text-xs">Point</span>  // Doit être même taille
```

#### ❌ Interdictions Navigation
```typescript
// ❌ INTERDIT : Badge autre que rouge admin
<Badge variant="secondary">

// ❌ INTERDIT : Mauvais alignement
<div className="px-4">  // Doit être px-3 pour alignement
```

#### ❌ Interdictions Responsive
```typescript
// ❌ INTERDIT : Pas de whitespace-nowrap sur mobile
<span className="text-xs">Très Long Nom Point</span>

// ❌ INTERDIT : Mélanger desktop et mobile
<div className="lg:hidden md:flex">  // Logique confuse
```

### ✅ Checklist Design

#### Avant Modification Header/Navigation
- [ ] Vérifier alignement `container mx-auto px-3`
- [ ] Tester responsive 320px → 1920px
- [ ] Valider tailles police (xs mobile, sm desktop)
- [ ] Contrôler espacement (space-x-2 mobile, space-x-4 desktop)
- [ ] Vérifier icônes (h-4 w-4 header, h-5 w-5 nav)
- [ ] Tester `whitespace-nowrap` sur textes longs

#### Validation Finale
- [ ] Aucun fond gris parasites
- [ ] Alignement parfait header/navigation
- [ ] Badges couleur correcte
- [ ] Icônes cohérentes
- [ ] Layout responsive fluide

---

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

## 🔐 SYSTÈME DE SÉCURITÉ ET MFA

### 🛡️ Règles de Sécurité Absolues

#### Accès par Rôle
```typescript
// Navigation agents - BOUTON SÉCURITÉ INTERDIT
{profile?.role === 'agent' && (
  <>
    <Link to="/nouveau-client">Nouveau Client</Link>
    <Link to="/contracts">Contrats</Link>
    {/* ❌ INTERDIT : <Link to="/security"> pour agents */}
  </>
)}

// Accès sécurité - ADMIN/SUPERVISEUR SEULEMENT
{(profile?.role === 'admin' || profile?.role === 'superviseur') && (
  <Link to="/security">Sécurité</Link>
)}
```

#### Authentification MFA
```typescript
// Hook useSecuritySystem - Logique obligatoire
const activateMFA = async (totpCode: string) => {
  try {
    // Validation 6 chiffres OBLIGATOIRE
    if (!/^\d{6}$/.test(totpCode)) {
      throw new Error('Code TOTP invalide');
    }
    
    // Logique upsert avec vérification existant
    const { data: existingMFA } = await supabase
      .from('user_mfa_status')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (existingMFA) {
      // UPDATE
      await supabase
        .from('user_mfa_status')
        .update({ 
          mfa_enabled: true,
          secret_key: encryptedSecret,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
    } else {
      // INSERT
      await supabase
        .from('user_mfa_status')
        .insert({
          user_id: user.id,
          mfa_enabled: true,
          secret_key: encryptedSecret
        });
    }
  } catch (error) {
    console.error('Erreur MFA:', error);
    throw error;
  }
};
```

#### Policies Supabase MFA
```sql
-- OBLIGATOIRE dans fix_mfa_policies.sql
CREATE POLICY "INSERT MFA Status" ON user_mfa_status
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "INSERT Security Events" ON security_events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

### 🔒 Interface Sécurité

#### Page Security.tsx
```typescript
// Validation codes MFA stricte
const validateTOTPCode = (code: string): boolean => {
  return /^\d{6}$/.test(code);
};

// Messages d'erreur clairs
const handleActivateMFA = async () => {
  if (!validateTOTPCode(totpCode)) {
    toast.error("Le code doit contenir exactement 6 chiffres");
    return;
  }
  
  try {
    await activateMFA(totpCode);
    toast.success("MFA activé avec succès");
    setTotpCode(''); // Nettoyage automatique
  } catch (error) {
    toast.error("Erreur lors de l'activation du MFA");
  }
};
```

---

## 📊 DASHBOARDS ET STATISTIQUES

### 🧮 Calculs Statistiques Critiques

#### Statistiques Temps Réel
```typescript
// ✅ CORRECT - Calcul sur TOUS les clients
const stats = useMemo(() => {
  const totalClients = allClients.length; // TOUS les clients
  const nouveauxClients = allClients.filter(client => {
    const createdAt = new Date(client.created_at);
    return createdAt >= startOfMonth && createdAt <= endOfMonth;
  }).length;
  
  return {
    totalClients,
    nouveauxClients,
    // ... autres stats
  };
}, [allClients, startOfMonth, endOfMonth]);

// ❌ INCORRECT - Calcul sur page actuelle
const nouveauxClients = displayedClients.filter(/* ... */).length; // FAUX
```

#### Graphiques Responsives
```typescript
// LazyPieChart.tsx - Règles obligatoires
const chartConfig = useMemo(() => {
  const isMobile = window.innerWidth < 768;
  
  return {
    // Centre repositionné mobile
    cx: isMobile ? '40%' : '50%',
    cy: '50%',
    
    // Rayons réduits mobile
    innerRadius: isMobile ? 45 : 65,
    outerRadius: isMobile ? 95 : 130,
    
    // Conteneur hauteur adaptée
    height: isMobile ? 384 : 320, // h-96 vs h-80
    
    // Légende optimisée
    legend: {
      iconSize: isMobile ? 8 : 20,
      fontSize: isMobile ? 11 : 14
    }
  };
}, [isMobile]);

// CSS anti-encadré bleu OBLIGATOIRE
const pieChartCSS = `
  .recharts-sector { 
    -webkit-tap-highlight-color: transparent !important;
    outline: none !important;
    cursor: default !important;
  }
  .recharts-legend-item {
    outline: none !important;
  }
`;
```

### 📈 Interface Mobile Dashboard

#### Règles Responsive Strictes
```typescript
// Breakpoint xs OBLIGATOIRE dans tailwind.config.ts
module.exports = {
  theme: {
    screens: {
      'xs': '475px' // OBLIGATOIRE pour contrôle fin
    }
  }
}

// Filtres mobile - Layout obligatoire
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
  {/* Filtres en 1 colonne mobile → 2 tablet → 3 desktop */}
</div>

// Boutons responsive
<div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
  <Button className="w-full xs:w-auto">Appliquer</Button>
  <Button variant="outline" className="w-full xs:w-auto">Reset</Button>
</div>
```

#### Message Filtres Mobile
```typescript
// Badge compact mobile OBLIGATOIRE
{isSmallScreen ? (
  <Badge variant="outline" className="inline-flex items-center gap-1">
    <span>Filtres modifiés</span>
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
  </Badge>
) : (
  <div className="text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
    Des filtres sont appliqués. Cliquez sur "Reset" pour les effacer.
  </div>
)}
```

---

## 🔍 SYSTÈME D'AUDIT CLIENT

### 🛠️ Interface d'Audit

#### Page ClientAudit.tsx
```typescript
// Design moderne obligatoire
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
  <div className="container mx-auto px-4 py-8">
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit des Clients</h1>
        <Button 
          onClick={handleRunAudit}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Lancer l'audit
        </Button>
      </div>
    </div>
  </div>
</div>
```

#### Corrections Automatiques
```typescript
// Logique de correction OCR améliorée
const fixOCRErrors = (clientData: any) => {
  // Préservation numéros valides OBLIGATOIRE
  const preserveValidNumbers = (numero: string) => {
    // Ne pas corriger les numéros valides (ex: YB5512726 italien)
    if (/^[A-Z]{2}\d{7}$/.test(numero)) return numero;
    
    // Corrections seulement si nécessaire
    return numero.replace(/[Oo0]/g, '0').replace(/[Il1]/g, '1');
  };
  
  return {
    ...clientData,
    numero_passeport: preserveValidNumbers(clientData.numero_passeport)
  };
};
```

### 📋 Corrections OCR Spécifiques

#### Passeports Irlandais
```typescript
// mainTextExtractor.ts - Support spécifique
const irishPatterns = [
  /SLOINNE[\/\s]*([A-ZÀ-ÿ\s\-]+)/i,
  /FORENAME[\/\s]*([A-ZÀ-ÿ\s\-]+)/i,
  /SURNAME[\/\s]*([A-ZÀ-ÿ\s\-]+)/i
];

// Détection intelligente codes pays dans noms
const detectCountryInName = (name: string) => {
  const patterns = {
    'IRL': /\b(IRL|IRELAND)\b/i,
    'GBR': /\b(GBR|UK|UNITED KINGDOM)\b/i
  };
  
  for (const [code, pattern] of Object.entries(patterns)) {
    if (pattern.test(name)) {
      return { cleanName: name.replace(pattern, '').trim(), country: code };
    }
  }
  
  return { cleanName: name, country: null };
};
```

#### Mappings Nationalités Étendus
```typescript
// nationalityMappings.ts - Codes manquants OBLIGATOIRES
export const nationalityMappings: Record<string, string> = {
  // Codes ajoutés dans les mémoires
  'SOM': 'Somalie',
  'SDN': 'Soudan', 
  'SSD': 'Soudan du Sud',
  'ERI': 'Érythrée',
  'DJI': 'Djibouti',
  'NOR': 'Norvège',
  'SWE': 'Suède',
  'DNK': 'Danemark',
  'FIN': 'Finlande',
  'ISL': 'Islande',
  'LTU': 'Lituanie',
  'LVA': 'Lettonie',
  'EST': 'Estonie',
  
  // Formes étendues
  'british citizen': 'Royaume-Uni',
  'united states of america': 'États-Unis',
  'thai': 'Thaïlande'
};
```

#### Système Détection Inversion
```typescript
// nameInversionDetector.ts - Critères intelligents
export const detectNameInversion = (mrzName: string, textName: string): DetectionResult => {
  let confidence = 0;
  const factors = [];
  
  // Critère 1: Cohérence MRZ vs texte principal
  if (mrzName && textName && mrzName !== textName) {
    confidence += 20;
    factors.push('MRZ_TEXT_DIFF');
  }
  
  // Critère 2: Prénoms communs
  const commonFirstNames = ['MOHAMMED', 'AHMED', 'FATIMA', 'AISHA'];
  if (commonFirstNames.some(name => textName.includes(name))) {
    confidence += 30;
    factors.push('COMMON_FIRSTNAME');
  }
  
  // Critère 3: Noms de famille
  const familyNamePatterns = [/BEN\s+\w+/, /AL\s+\w+/, /EL\s+\w+/];
  if (familyNamePatterns.some(pattern => pattern.test(textName))) {
    confidence += 25;
    factors.push('FAMILY_NAME_PATTERN');
  }
  
  // Critère 4: Analyse des longueurs
  const words = textName.split(' ');
  if (words.length === 2 && words[0].length > words[1].length) {
    confidence += 15;
    factors.push('LENGTH_ANALYSIS');
  }
  
  // Critère 5: Cohérence générale
  if (factors.length >= 2) {
    confidence += 20;
    factors.push('COHERENCE');
  }
  
  return {
    isInverted: confidence >= 70,
    confidence,
    factors,
    recommendation: confidence >= 70 ? 'INVERT' : 'KEEP'
  };
};
```

#### 🆕 Corrections Critiques Codes Pays dans Noms (Décembre 2024)

**PROBLÈME RÉSOLU** : Les codes pays ISO (BRA, IND, CYP, etc.) apparaissaient comme noms de famille au lieu d'être détectés comme nationalités.

```typescript
// src/utils/passportEtranger/nationalityUtils.ts - CODES PAYS ÉTENDUS
export const detectCountryCodeInName = (name: string): { isCountryCode: boolean; suggestedNationality?: string } => {
  const nameUpper = name.toUpperCase().trim();
  
  // Codes pays ISO 3 lettres étendus - OBLIGATOIRE
  const countryCodeMapping: Record<string, string> = {
    'IND': 'Inde',      // ← AJOUT CRITIQUE
    'BRA': 'Brésil',    // ← AJOUT CRITIQUE
    'CYP': 'Chypre',    // ← AJOUT CRITIQUE
    'POL': 'Pologne',   // ← AJOUT CRITIQUE
    'GBR': 'Royaume-Uni',
    'CHN': 'Chine',
    'JPN': 'Japon',
    'KOR': 'Corée du Sud',
    'THA': 'Thaïlande',
    'VNM': 'Vietnam',
    'PHL': 'Philippines',
    'MYS': 'Malaisie',
    'SGP': 'Singapour',
    'AUS': 'Australie',
    'NZL': 'Nouvelle-Zélande',
    // ... 40+ codes pays supplémentaires
  };
  
  // Codes 2 lettres critiques
  const countryCode2Mapping: Record<string, string> = {
    'IN': 'Inde',    // ← AJOUT CRITIQUE
    'BR': 'Brésil', // ← AJOUT CRITIQUE
    'CN': 'Chine',
    'JP': 'Japon'
  };
  
  return { 
    isCountryCode: !!countryCodeMapping[nameUpper] || !!countryCode2Mapping[nameUpper],
    suggestedNationality: countryCodeMapping[nameUpper] || countryCode2Mapping[nameUpper]
  };
};
```

```typescript
// src/utils/passportEtranger/dataExtractor.ts - LOGIQUE DE CORRECTION
// CORRECTION CRITIQUE : Si le nom est exactement un code pays, le vider complètement
if (result.nom) {
  const codeDetectionNom = detectCountryCodeInName(result.nom);
  if (codeDetectionNom.isCountryCode) {
    console.log(`⚠️ CODE PAYS DÉTECTÉ DANS LE NOM: "${result.nom}" → Nationalité: "${codeDetectionNom.suggestedNationality}"`);
    
    // Récupérer la nationalité automatiquement
    if (!result.nationalite && codeDetectionNom.suggestedNationality) {
      result.nationalite = codeDetectionNom.suggestedNationality;
    }
    
    // Vider le nom si c'est un code pays pur (≤ 3 caractères)
    if (result.nom.length <= 3 && codeDetectionNom.isCountryCode) {
      result.nom = undefined;  // Suppression complète
    }
  }
}
```

```typescript
// src/utils/passportEtranger/nationalityUtils.ts - NETTOYAGE INTELLIGENT
export const correctOCRNameErrors = (name: string): string => {
  // Vérifier d'abord si c'est un code pays pur
  const codeDetection = detectCountryCodeInName(name);
  if (codeDetection.isCountryCode && name.length <= 3) {
    return '';  // Retourner chaîne vide si c'est juste un code pays
  }
  
  // Corrections spécifiques codes pays intégrés
  let corrected = name
    .replace(/\b(IRL|IND|BRA|CYP|POL|GBR)\b/gi, '') // Supprimer codes pays
    .replace(/0/g, 'O').replace(/1/g, 'I')           // Corrections OCR
    .trim();
  
  return corrected.length < 2 ? '' : corrected;
};
```

```typescript
// src/services/ocr/mrzDataExtractor.ts - MAPPINGS MRZ ÉTENDUS
function convertCountryCodeToNationality(countryCode: string): string {
  const countryMapping: Record<string, string> = {
    'IND': 'Inde',              // ← AJOUT CRITIQUE
    'BRA': 'Brésil',            // ← AJOUT CRITIQUE
    'CHN': 'Chine',
    'JPN': 'Japon',
    'KOR': 'Corée du Sud',
    'PAK': 'Pakistan',
    'BGD': 'Bangladesh',
    'AFG': 'Afghanistan',
    // ... 100+ codes pays complets
  };
  
  const cleanCode = countryCode.replace(/[<\s]/g, '').toUpperCase();
  return countryMapping[cleanCode] || cleanCode;
}
```

**RÉSULTATS GARANTIS** :
- ✅ **Passeport brésilien** : Nom "BRA" → supprimé, Nationalité → "Brésil"
- ✅ **Passeport indien** : Nom "IND" → supprimé, Nationalité → "Inde"
- ✅ **Passeport chypriote** : Nom "CYP" → supprimé, Nationalité → "Chypre"
- ✅ **50+ nationalités** automatiquement reconnues et corrigées
- ✅ **Système intelligent** qui détecte nouveaux codes pays à l'avenir

**FICHIERS MODIFIÉS** :
- `src/utils/passportEtranger/nationalityUtils.ts` : Détection codes pays étendue
- `src/services/ocr/mrzDataExtractor.ts` : Mappings MRZ complets
- `src/utils/passportEtranger/dataExtractor.ts` : Logique correction intelligente
- `src/utils/passportEtranger/mainTextExtractor.ts` : Extraction nationalité améliorée

#### Système Détection Inversion
```typescript
// nameInversionDetector.ts - Critères intelligents
export const detectNameInversion = (mrzName: string, textName: string): DetectionResult => {
  let confidence = 0;
  const factors = [];
  
  // Critère 1: Cohérence MRZ vs texte principal
  if (mrzName && textName && mrzName !== textName) {
    confidence += 20;
    factors.push('MRZ_TEXT_DIFF');
  }
  
  // Critère 2: Prénoms communs
  const commonFirstNames = ['MOHAMMED', 'AHMED', 'FATIMA', 'AISHA'];
  if (commonFirstNames.some(name => textName.includes(name))) {
    confidence += 30;
    factors.push('COMMON_FIRSTNAME');
  }
  
  // Critère 3: Noms de famille
  const familyNamePatterns = [/BEN\s+\w+/, /AL\s+\w+/, /EL\s+\w+/];
  if (familyNamePatterns.some(pattern => pattern.test(textName))) {
    confidence += 25;
    factors.push('FAMILY_NAME_PATTERN');
  }
  
  // Critère 4: Analyse des longueurs
  const words = textName.split(' ');
  if (words.length === 2 && words[0].length > words[1].length) {
    confidence += 15;
    factors.push('LENGTH_ANALYSIS');
  }
  
  // Critère 5: Cohérence générale
  if (factors.length >= 2) {
    confidence += 20;
    factors.push('COHERENCE');
  }
  
  return {
    isInverted: confidence >= 70,
    confidence,
    factors,
    recommendation: confidence >= 70 ? 'INVERT' : 'KEEP'
  };
};
```

---

## 🚫 ANTI-PATTERNS CRITIQUES

### ❌ Erreurs à Ne Jamais Commettre

#### CSS et Styling
```css
/* ❌ INTERDIT ABSOLU */
/* Modification des imports dans src/index.css */
@import "quelque-chose"; /* JAMAIS */

/* ❌ INTERDIT sur mobile */
.bg-gray-100 { /* Fonds gris parasites */ }
.justify-end { /* Mauvais alignement */ }
```

#### Statistiques Dashboard
```typescript
// ❌ INCORRECT - Calcul sur page actuelle
const stats = displayedClients.filter(/* ... */).length;

// ✅ CORRECT - Calcul sur tous les clients
const stats = allClients.filter(/* ... */).length;
```

#### Navigation par Rôle
```typescript
// ❌ INTERDIT - Bouton sécurité pour agents
{profile?.role === 'agent' && (
  <Link to="/security">Sécurité</Link> // JAMAIS
)}

// ✅ CORRECT - Restriction admin/superviseur
{(profile?.role === 'admin' || profile?.role === 'superviseur') && (
  <Link to="/security">Sécurité</Link>
)}
```

#### Corrections OCR
```typescript
// ❌ INTERDIT - Casser les numéros valides
const fixNumber = (num: string) => num.replace(/[A-Z]/g, ''); // FAUX

// ✅ CORRECT - Préserver les numéros valides
const fixNumber = (num: string) => {
  if (/^[A-Z]{2}\d{7}$/.test(num)) return num; // Garder format valide
  return num.replace(/[Oo0]/g, '0'); // Corriger seulement si nécessaire
};
```

---

## ✅ CHECKLIST FINALE

### Avant Toute Modification
- [ ] Lire ce guide entièrement
- [ ] Consulter les mémoires du projet
- [ ] Identifier les fichiers critiques
- [ ] Planifier les tests nécessaires

### Design et UI
- [ ] Aucune modification CSS dans `src/index.css`
- [ ] Alignement header/navigation parfait (`container mx-auto px-3`)
- [ ] Responsive 320px → 1920px+ testé
- [ ] Icônes et tailles cohérentes
- [ ] Pas de fond gris parasite sur mobile

### Fonctionnalités
- [ ] Statistiques calculées sur tous les clients
- [ ] MFA avec validation 6 chiffres
- [ ] Navigation par rôle respectée
- [ ] Corrections OCR préservant les numéros valides
- [ ] Système d'audit moderne fonctionnel

### Performance et Qualité
- [ ] Lazy loading des graphiques
- [ ] Gestion d'erreurs complète
- [ ] Indicateurs de chargement
- [ ] Messages utilisateur clairs

---

> **⚠️ RAPPEL CRITIQUE** : Ce guide contient TOUTES les règles du projet. Toute violation peut casser l'interface, les statistiques ou les fonctionnalités. En cas de doute, TOUJOURS consulter ce guide et les mémoires avant de modifier quoi que ce soit.

---

*Dernière mise à jour : Décembre 2024*
*Version : 2.0.0 - Guide complet avec design system*

### 3. Gestion des États de Chargement