# Second Life Exchange
Plateforme collaborative d'échange d'objets de seconde main

## 🧩 Présentation
Second Life Exchange est une application web permettant aux utilisateurs d'échanger des objets sans argent, dans un esprit d'économie circulaire. Chaque semaine, un thème d'échange est proposé, et la plateforme met en avant des suggestions générées automatiquement via l'API d'OpenAI.
L'objectif : encourager les échanges responsables, la réparation, et sensibiliser aux enjeux écologiques.

---

## 🚀 Stack Technique

| Domaine         | Technologie |
|-----------------|-------------|
| Front-end       | Next.js     |
| Back-end        | NestJS      |
| Base de données | MongoDB     |
| IA              | OpenAI API  |
| Déploiement     | Vercel      |
| Application     | PWA         |

---

## ✨ Fonctionnalités principales

- Authentification et gestion de profil
- Publication d'objets (photo, description, état, catégorie)
- Suggestions automatiques d'objets via IA
- Thèmes hebdomadaires d'échange
- Système de matching (optionnel)
- Espace de discussion communautaire
- Section éducative : articles, vidéos, statistiques
- Système de vote sur les meilleurs échanges
- Notifications via PWA

---

## 📁 Architecture du projet

```
/frontend → Application Next.js
/backend → API NestJS
/database → Schémas, migrations
/docs → UML, spécifications
```

---

## ⚙️ Installation

### Prérequis
- Node.js 18+
- Yarn ou npm
- MongoDB Atlas ou local

### Clone du projet
```bash
git clone https://github.com/nohoariifamibelle/second-life-exchange.git
cd second-life-exchange
```

### Installation et démarrage

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir le résultat.

---

## 🔐 Variables d'environnement

### Front (Next.js)
```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_OPENAI_MODEL=
```

### Back (NestJS)
```
MONGODB_URI=
OPENAI_API_KEY=
JWT_SECRET=
```

---

## 🧪 Scripts utiles

### Front
```bash
npm run dev       # Développement
npm run build     # Build production
npm run start     # Démarrage production
```

### Back
```bash
npm run start:dev   # Développement
npm run build       # Compilation
npm run start:prod  # Production
```

---

## 📚 En savoir plus

Pour en savoir plus sur Next.js :

- [Documentation Next.js](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Dépôt GitHub Next.js](https://github.com/vercel/next.js)

## 🚀 Déploiement

Le moyen le plus simple de déployer cette application Next.js est d'utiliser la [plateforme Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Consultez la [documentation de déploiement Next.js](https://nextjs.org/docs/app/building-your-application/deploying) pour plus de détails.
