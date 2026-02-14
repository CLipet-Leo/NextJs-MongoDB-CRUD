# Exemple Complet : Next.js + MongoDB + API REST

## Architecture du Projet

Cette architecture respecte la séparation Front/Back même dans un monorepo :

- Backend = `/app/api` (API Routes pures)
- Frontend = `/app` et `/components` (React)
- Business Logic = `/lib` (réutilisable, testable)

---

## ÉTAPE 1 : Configuration de l'environnement

### `.env.local`

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/myDatabase?retryWrites=true&w=majority

# Environnement
NODE_ENV=development
```

**Démarche :**

- Utilisez MongoDB Atlas (gratuit) ou MongoDB local
- **Jamais** de credentials en dur dans le code
- `retryWrites=true` : réessaie automatique en cas d'échec
- `w=majority` : confirmation d'écriture sur la majorité des nœuds (sécurité)

---

## Apprentissage par IA

Cet exemple à été créer avec l'aide d'un [Markdown](doc/nextjs-mongodb-example.md) générer par Claude AI modèle Sonnet 4.5 avec réflexion approfondie dans un but d'apprentissage avec les prompt suivant :

**Prompt 1 :**

```md
J'aimerais créer un saas Next.js avec comme base de donnée MongoDB afin de me  former sur l'utilisation et la conception d'API Rest.
Mes cas d'utilisation seront les suivants :
Client anonyme : Peut consulté les différentes pages du site et afficher les données enregistrer sur Mongo.
Administrateur : Peut se connecter à l'environnement mongo directement depuis le site afin de gérer la base de données (Post, Update, Delete, etc.) et avoir une page de compte rendu avec les informations récentes, comme les dernières actions effectué.
Pourrais-tu me proposer un ou plusieurs designs pattern qui serait efficace pour ce genre d'application, en me donnant les points fort et les points faible, si il y en a.
Le but est d'avoir un environnement Front qui soit bien différencié de l'envronnement Back dans un context Full-Stack.
```

**Prompt 2 :**

```md
Montre moi un exemple simple avec connexion sécurisé à la db, récupération et création de schéma et affichage dans des composants React tout en expliquant la démarche suivis.
```
