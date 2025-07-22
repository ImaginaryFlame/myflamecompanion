# Initialisation du projet

1. Cloner le dépôt
2. Installer les dépendances :
   ```sh
   npm install
   ```
3. Copier le fichier d'exemple des variables d'environnement :
   ```sh
   cp config/.env.example .env
   ```
4. Remplir les variables d'environnement dans `.env`
5. Lancer le projet en développement :
   ```sh
   npm run dev
   ```

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Companion Webnovel - Architecture du projet

## Structure générale des dossiers

```
myflamecompanion/
│
├── app/                # Frontend Next.js (pages, layouts, styles)
├── components/         # Composants React réutilisables (UI, widgets, etc.)
├── lib/                # Fonctions utilitaires, hooks, helpers
├── public/             # Fichiers statiques (images, icônes, etc.)
├── scraping/           # Scripts de scraping (Wattpad, Webnovel, Yume-Arts)
├── api/                # Backend (routes API, logique serveur, notifications)
├── database/           # Modèles, schémas et scripts de migration de la base de données
├── config/             # Fichiers de configuration (environnements, clés API, etc.)
├── tests/              # Tests unitaires et d'intégration
├── cursorrules         # Règles et objectifs du projet
├── package.json        # Dépendances et scripts npm
├── README.md           # Documentation du projet
└── ...
```

## Description des dossiers principaux

- **app/** : Contient le code du frontend (Next.js), les pages, layouts et styles globaux.
- **components/** : Composants React réutilisables (cartes, listes, boutons, etc.).
- **lib/** : Fonctions utilitaires, hooks personnalisés, helpers pour le frontend et backend.
- **public/** : Images, icônes, fichiers statiques accessibles publiquement.
- **scraping/** : Scripts pour extraire les données des plateformes externes (Wattpad, Webnovel, Yume-Arts).
- **api/** : Endpoints API, logique serveur, gestion des notifications, authentification, etc.
- **database/** : Modèles de données, schémas, scripts de migration, seeders.
- **config/** : Fichiers de configuration (variables d'environnement, clés API, etc.).
- **tests/** : Tous les tests automatisés du projet.

## Technologies principales
- **Frontend** : Next.js, React, CSS/SCSS
- **Backend/API** : Node.js (Next.js API routes ou Express), notifications (email/push)
- **Scraping** : Puppeteer, Cheerio ou Playwright
- **Base de données** : PostgreSQL, MongoDB ou SQLite (selon besoins)
- **Authentification** : Auth.js, JWT ou OAuth (Google, Discord, etc.)

---

> Cette structure est évolutive et pourra être adaptée selon les besoins du projet.
