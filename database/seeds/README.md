# 🌱 Database Seeds

Ce dossier contient les données de seed pour peupler la base de données de développement.

## Fichiers de seed

### `users.seed.ts`

Contient 5 utilisateurs de test avec des mots de passe pré-hachés :

| Email | Mot de passe | Rôle | Prénom | Nom |
|-------|--------------|------|--------|-----|
| `admin@secondlife.com` | `Admin123!` | Admin | Admin | Second Life |
| `john.doe@example.com` | `Password123!` | User | John | Doe |
| `jane.smith@example.com` | `Password123!` | User | Jane | Smith |
| `alice.martin@example.com` | `Password123!` | User | Alice | Martin |
| `bob.wilson@example.com` | `Password123!` | User | Bob | Wilson |

## Utilisation

### Exécuter le script de seed

```bash
cd backend
npm run seed
```

### Ce que fait le script

1. ✅ Se connecte à MongoDB
2. ✅ Vérifie si les utilisateurs existent déjà
3. ✅ Crée uniquement les utilisateurs qui n'existent pas
4. ✅ Affiche un résumé des opérations
5. ✅ Ferme proprement la connexion

### Exemple de sortie

```
🌱 Starting database seeding...

📊 Existing users in database: 0

✅ User created: admin@secondlife.com (Admin Second Life)
✅ User created: john.doe@example.com (John Doe)
✅ User created: jane.smith@example.com (Jane Smith)
✅ User created: alice.martin@example.com (Alice Martin)
✅ User created: bob.wilson@example.com (Bob Wilson)

📈 Seeding Summary:
   ✅ Created: 5 user(s)
   ⚠️  Skipped: 0 user(s) (already exist)
   📊 Total in database: 5

✅ Seeding completed successfully!
```

## Ajouter de nouveaux seeds

Pour ajouter de nouveaux utilisateurs, modifiez `users.seed.ts` :

```typescript
export const userSeeds = [
  {
    email: 'newuser@example.com',
    password: bcrypt.hashSync('YourPassword123!', 10),
    firstName: 'New',
    lastName: 'User',
    isActive: true,
  },
  // ... autres utilisateurs
];
```

## Sécurité

⚠️ **IMPORTANT** : Ces seeds sont **uniquement pour le développement**.

- ❌ NE JAMAIS utiliser ces données en production
- ❌ NE JAMAIS commiter de vrais mots de passe
- ✅ Utiliser des variables d'environnement en production
- ✅ Changer tous les mots de passe par défaut

## Réinitialiser la base de données

Pour vider complètement la base de données :

```bash
# Via MongoDB shell
mongo
use second-life-exchange
db.users.deleteMany({})

# Ou via Compass / MongoDB Atlas
```

Puis relancer le seed :

```bash
npm run seed
```
