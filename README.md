# Sud Megaphone - Client Management System

Système de gestion de clients avec OCR automatique pour documents d'identité. Cette application permet de scanner et traiter automatiquement les passeports étrangers et cartes de séjour pour une gestion efficace des données clients.

## Fonctionnalités

- Scanner automatique de documents d'identité (passeports étrangers et cartes de séjour)
- Reconnaissance optique de caractères (OCR) intégrée
- Interface utilisateur moderne et intuitive
- Gestion sécurisée des données clients
- Scanner de codes-barres intégré

## Technologies utilisées

- React/Next.js
- TypeScript
- Tailwind CSS
- Supabase
- OCR API
- Vite

## Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Une clé API OCR valide

## Installation

1. Clonez le repository :
```bash
git clone [URL_DU_REPO]
cd megaphone-client-hub
```

2. Installez les dépendances :
```bash
npm install
# ou
yarn install
```

3. Créez un fichier `.env.local` à la racine du projet et ajoutez vos variables d'environnement :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
OCR_API_KEY=votre_clé_api_ocr
```

4. Démarrez le serveur de développement :
```bash
npm run dev
# ou
yarn dev
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000)

## Structure du projet

```
megaphone-client-hub/
├── src/
│   ├── components/    # Composants React
│   ├── hooks/        # Hooks personnalisés
│   ├── pages/        # Pages de l'application
│   └── utils/        # Utilitaires
├── public/           # Fichiers statiques
└── ...
```

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
