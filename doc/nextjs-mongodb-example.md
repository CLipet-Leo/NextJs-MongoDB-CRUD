# Exemple Complet : Next.js + MongoDB + API REST

## 📋 Architecture du Projet

```
/my-saas-app
├── /app
│   ├── /api
│   │   └── /v1
│   │       ├── /posts
│   │       │   ├── route.ts          # GET & POST /api/v1/posts
│   │       │   └── /[id]
│   │       │       └── route.ts      # GET, PUT, DELETE /api/v1/posts/:id
│   ├── /posts
│   │   └── page.tsx                  # Page publique affichant les posts
│   └── layout.tsx
├── /lib
│   ├── /mongodb
│   │   ├── connection.ts             # Connexion sécurisée MongoDB
│   │   ├── /models
│   │   │   └── Post.ts               # Schéma Mongoose
│   │   └── /repositories
│   │       └── PostRepository.ts     # Logique CRUD
│   └── /types
│       └── post.types.ts             # Types TypeScript
├── /components
│   ├── PostList.tsx                  # Composant affichage liste
│   ├── PostCard.tsx                  # Composant carte individuelle
│   └── CreatePostForm.tsx            # Composant formulaire création
└── .env.local                        # Variables d'environnement
```

---

## 🔐 ÉTAPE 1 : Configuration de l'environnement

### `.env.local`
```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/myDatabase?retryWrites=true&w=majority

# Environnement
NODE_ENV=development
```

**📌 Démarche :**
- Utilisez MongoDB Atlas (gratuit) ou MongoDB local
- **Jamais** de credentials en dur dans le code
- `retryWrites=true` : réessaie automatique en cas d'échec
- `w=majority` : confirmation d'écriture sur la majorité des nœuds (sécurité)

---

## 🔌 ÉTAPE 2 : Connexion Sécurisée à MongoDB

### `/lib/mongodb/connection.ts`
```typescript
import mongoose from 'mongoose';

// Type pour le cache de connexion
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Cache global pour éviter les multiples connexions en dev
declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connexion à MongoDB avec gestion du cache
 * Évite les "too many connections" en développement avec HMR
 */
export async function connectToDatabase() {
  // Si déjà connecté, retourne la connexion existante
  if (cached.conn) {
    console.log('✅ Utilisation de la connexion MongoDB existante');
    return cached.conn;
  }

  // Si pas de promesse en cours, créer une nouvelle connexion
  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw new Error(
        '❌ Veuillez définir MONGODB_URI dans .env.local'
      );
    }

    const options = {
      bufferCommands: false, // Désactive la mise en buffer des commandes
      maxPoolSize: 10,       // Maximum 10 connexions simultanées
      minPoolSize: 2,        // Minimum 2 connexions ouvertes
      socketTimeoutMS: 45000, // Timeout après 45 secondes
      serverSelectionTimeoutMS: 10000, // Timeout sélection serveur
    };

    console.log('🔄 Connexion à MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, options);
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ Connecté à MongoDB avec succès');
  } catch (error) {
    cached.promise = null; // Reset en cas d'erreur
    console.error('❌ Erreur de connexion MongoDB:', error);
    throw error;
  }

  return cached.conn;
}

/**
 * Déconnexion propre (utile pour les tests)
 */
export async function disconnectFromDatabase() {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('🔌 Déconnecté de MongoDB');
  }
}
```

**📌 Démarche expliquée :**

1. **Cache Global** : En développement, Next.js recharge les modules (HMR). Sans cache, chaque rechargement créerait une nouvelle connexion → "too many connections"

2. **Singleton Pattern** : Une seule connexion partagée dans toute l'application

3. **Options de sécurité** :
   - `bufferCommands: false` : Échoue immédiatement si pas connecté (vs mettre en attente)
   - `maxPoolSize` : Limite les connexions simultanées
   - `socketTimeoutMS` : Évite les connexions qui pendent

4. **Gestion d'erreurs** : Reset de la promesse si échec pour retry

---

## 📊 ÉTAPE 3 : Création du Schéma MongoDB

### `/lib/types/post.types.ts`
```typescript
/**
 * Types TypeScript pour la sécurité du typage
 */

// Interface pour le document MongoDB
export interface IPost {
  _id: string;
  title: string;
  content: string;
  author: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Type pour la création (sans _id, dates auto)
export interface CreatePostInput {
  title: string;
  content: string;
  author: string;
  published?: boolean;
}

// Type pour la mise à jour (tout optionnel)
export interface UpdatePostInput {
  title?: string;
  content?: string;
  author?: string;
  published?: boolean;
}
```

### `/lib/mongodb/models/Post.ts`
```typescript
import mongoose, { Schema, Model } from 'mongoose';
import { IPost } from '@/lib/types/post.types';

/**
 * Schéma Mongoose avec validation
 */
const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, 'Le titre est obligatoire'],
      trim: true,
      minlength: [3, 'Le titre doit contenir au moins 3 caractères'],
      maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères'],
    },
    content: {
      type: String,
      required: [true, 'Le contenu est obligatoire'],
      minlength: [10, 'Le contenu doit contenir au moins 10 caractères'],
    },
    author: {
      type: String,
      required: [true, 'L\'auteur est obligatoire'],
      trim: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
    toJSON: {
      virtuals: true, // Inclut les champs virtuels dans JSON
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret.__v; // Supprime le versionKey
        return ret;
      },
    },
  }
);

// Index pour améliorer les performances de recherche
PostSchema.index({ title: 'text', content: 'text' }); // Recherche full-text
PostSchema.index({ createdAt: -1 }); // Tri par date décroissante
PostSchema.index({ published: 1 }); // Filtrage par statut

/**
 * Évite la réinitialisation du modèle en développement (HMR)
 */
const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
```

**📌 Démarche expliquée :**

1. **Validation au niveau schéma** :
   - `required` : Champs obligatoires
   - `trim` : Supprime les espaces superflus
   - `minlength/maxlength` : Validation de longueur

2. **Timestamps automatiques** : MongoDB gère `createdAt` et `updatedAt`

3. **Index** :
   - Recherche textuelle sur titre/contenu
   - Performance sur les tris par date
   - Filtrage rapide par statut published

4. **Transform toJSON** : Nettoie l'objet avant envoi au client
   - Ajoute `id` (plus standard REST que `_id`)
   - Supprime `__v` (version interne Mongoose)

5. **Protection HMR** : `mongoose.models.Post ||` évite la redéfinition

---

## 🗄️ ÉTAPE 4 : Repository Pattern (Couche d'Accès aux Données)

### `/lib/mongodb/repositories/PostRepository.ts`
```typescript
import Post from '../models/Post';
import { CreatePostInput, UpdatePostInput, IPost } from '@/lib/types/post.types';
import { connectToDatabase } from '../connection';

/**
 * Repository : Abstraction de l'accès aux données
 * Avantages : Testable, réutilisable, séparation des responsabilités
 */
export class PostRepository {
  /**
   * Récupère tous les posts
   * @param publishedOnly - Si true, ne retourne que les posts publiés
   */
  async findAll(publishedOnly: boolean = false): Promise<IPost[]> {
    await connectToDatabase();
    
    const filter = publishedOnly ? { published: true } : {};
    
    return await Post.find(filter)
      .sort({ createdAt: -1 }) // Plus récents en premier
      .lean() // Retourne des objets JS simples (pas des documents Mongoose)
      .exec();
  }

  /**
   * Récupère un post par son ID
   */
  async findById(id: string): Promise<IPost | null> {
    await connectToDatabase();
    
    return await Post.findById(id).lean().exec();
  }

  /**
   * Crée un nouveau post
   */
  async create(data: CreatePostInput): Promise<IPost> {
    await connectToDatabase();
    
    const post = await Post.create(data);
    return post.toJSON(); // Utilise le transform défini dans le schéma
  }

  /**
   * Met à jour un post existant
   */
  async update(id: string, data: UpdatePostInput): Promise<IPost | null> {
    await connectToDatabase();
    
    const post = await Post.findByIdAndUpdate(
      id,
      { $set: data },
      { 
        new: true,        // Retourne le document modifié
        runValidators: true // Exécute les validations du schéma
      }
    )
    .lean()
    .exec();
    
    return post;
  }

  /**
   * Supprime un post
   */
  async delete(id: string): Promise<boolean> {
    await connectToDatabase();
    
    const result = await Post.findByIdAndDelete(id);
    return result !== null;
  }

  /**
   * Compte le nombre de posts
   */
  async count(publishedOnly: boolean = false): Promise<number> {
    await connectToDatabase();
    
    const filter = publishedOnly ? { published: true } : {};
    return await Post.countDocuments(filter);
  }
}
```

**📌 Démarche expliquée :**

1. **Abstraction** : Si vous changez de BDD, seul ce fichier change

2. **Connexion automatique** : Chaque méthode appelle `connectToDatabase()`

3. **`.lean()`** : Performances améliorées (objets JS vs documents Mongoose)

4. **Validation** : `runValidators: true` applique les règles du schéma même en update

5. **Typage strict** : TypeScript garantit la cohérence des données

---

## 🛣️ ÉTAPE 5 : API Routes (Backend REST)

### `/app/api/v1/posts/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PostRepository } from '@/lib/mongodb/repositories/PostRepository';
import { CreatePostInput } from '@/lib/types/post.types';

const postRepo = new PostRepository();

/**
 * GET /api/v1/posts
 * Récupère tous les posts
 */
export async function GET(request: NextRequest) {
  try {
    // Paramètre optionnel : ?published=true
    const searchParams = request.nextUrl.searchParams;
    const publishedOnly = searchParams.get('published') === 'true';

    const posts = await postRepo.findAll(publishedOnly);
    
    return NextResponse.json({
      success: true,
      data: posts,
      count: posts.length,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Erreur GET /posts:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des posts',
    }, { status: 500 });
  }
}

/**
 * POST /api/v1/posts
 * Crée un nouveau post
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreatePostInput = await request.json();

    // Validation basique (ou utiliser Zod pour validation robuste)
    if (!body.title || !body.content || !body.author) {
      return NextResponse.json({
        success: false,
        error: 'Titre, contenu et auteur sont obligatoires',
      }, { status: 400 });
    }

    const post = await postRepo.create(body);
    
    return NextResponse.json({
      success: true,
      data: post,
      message: 'Post créé avec succès',
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Erreur POST /posts:', error);
    
    // Erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      return NextResponse.json({
        success: false,
        error: 'Données invalides',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création du post',
    }, { status: 500 });
  }
}
```

### `/app/api/v1/posts/[id]/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PostRepository } from '@/lib/mongodb/repositories/PostRepository';
import { UpdatePostInput } from '@/lib/types/post.types';

const postRepo = new PostRepository();

/**
 * GET /api/v1/posts/:id
 * Récupère un post spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await postRepo.findById(params.id);
    
    if (!post) {
      return NextResponse.json({
        success: false,
        error: 'Post non trouvé',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: post,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Erreur GET /posts/:id:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération du post',
    }, { status: 500 });
  }
}

/**
 * PUT /api/v1/posts/:id
 * Met à jour un post
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdatePostInput = await request.json();
    
    const post = await postRepo.update(params.id, body);
    
    if (!post) {
      return NextResponse.json({
        success: false,
        error: 'Post non trouvé',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: post,
      message: 'Post mis à jour avec succès',
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Erreur PUT /posts/:id:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la mise à jour du post',
    }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/posts/:id
 * Supprime un post
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await postRepo.delete(params.id);
    
    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Post non trouvé',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Post supprimé avec succès',
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Erreur DELETE /posts/:id:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la suppression du post',
    }, { status: 500 });
  }
}
```

**📌 Démarche expliquée :**

1. **Routes REST standard** :
   - `GET /posts` → Liste
   - `POST /posts` → Création
   - `GET /posts/:id` → Détail
   - `PUT /posts/:id` → Modification
   - `DELETE /posts/:id` → Suppression

2. **Status HTTP appropriés** :
   - 200 : OK
   - 201 : Created
   - 400 : Bad Request (validation)
   - 404 : Not Found
   - 500 : Server Error

3. **Format de réponse uniforme** :
   ```json
   {
     "success": true/false,
     "data": {...},
     "error": "message",
     "count": 10
   }
   ```

4. **Gestion d'erreurs** : Try/catch avec logs et messages clairs

---

## ⚛️ ÉTAPE 6 : Composants React (Frontend)

### `/components/PostCard.tsx`
```typescript
import { IPost } from '@/lib/types/post.types';

interface PostCardProps {
  post: IPost;
}

/**
 * Composant de carte pour afficher un post individuel
 */
export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white">
      <div className="flex items-start justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-900">{post.title}</h2>
        {post.published && (
          <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
            Publié
          </span>
        )}
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span className="font-medium">Par {post.author}</span>
        <time dateTime={post.createdAt.toString()}>
          {new Date(post.createdAt).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      </div>
    </article>
  );
}
```

### `/components/PostList.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';
import { IPost } from '@/lib/types/post.types';
import PostCard from './PostCard';

/**
 * Composant pour afficher la liste des posts
 * Fetch côté client pour démo (en production, préférer Server Components)
 */
export default function PostList() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/v1/posts?published=true');
        
        if (!response.ok) {
          throw new Error('Erreur de chargement');
        }

        const result = await response.json();
        setPosts(result.data);
      } catch (err) {
        setError('Impossible de charger les posts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Aucun post publié pour le moment</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
}
```

### `/components/CreatePostForm.tsx`
```typescript
'use client';

import { useState, FormEvent } from 'react';
import { CreatePostInput } from '@/lib/types/post.types';

/**
 * Formulaire de création de post
 */
export default function CreatePostForm() {
  const [formData, setFormData] = useState<CreatePostInput>({
    title: '',
    content: '',
    author: '',
    published: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur de création');
      }

      setMessage({ type: 'success', text: 'Post créé avec succès !' });
      
      // Reset du formulaire
      setFormData({
        title: '',
        content: '',
        author: '',
        published: false,
      });

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Créer un nouveau post</h2>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Titre *
        </label>
        <input
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Un titre accrocheur..."
        />
      </div>

      <div className="mb-4">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Contenu *
        </label>
        <textarea
          id="content"
          required
          rows={6}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Votre contenu ici..."
        />
      </div>

      <div className="mb-4">
        <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
          Auteur *
        </label>
        <input
          type="text"
          id="author"
          required
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Votre nom"
        />
      </div>

      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.published}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Publier immédiatement</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Création en cours...' : 'Créer le post'}
      </button>
    </form>
  );
}
```

### `/app/posts/page.tsx`
```typescript
import PostList from '@/components/PostList';
import CreatePostForm from '@/components/CreatePostForm';

/**
 * Page principale affichant les posts
 */
export default function PostsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">
          Blog Posts
        </h1>

        {/* Formulaire de création */}
        <section className="mb-16">
          <CreatePostForm />
        </section>

        {/* Liste des posts */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Posts publiés</h2>
          <PostList />
        </section>
      </div>
    </main>
  );
}
```

---

## 🚀 Installation et Démarrage

### 1. Installer les dépendances
```bash
npm install mongoose
npm install --save-dev @types/mongoose

# Pour validation avancée (recommandé)
npm install zod
```

### 2. Configuration `.env.local`
```env
MONGODB_URI=votre_connection_string_mongodb
NODE_ENV=development
```

### 3. Lancer le serveur
```bash
npm run dev
```

### 4. Tester l'API
```bash
# Créer un post
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mon premier post",
    "content": "Contenu du post de test",
    "author": "John Doe",
    "published": true
  }'

# Récupérer tous les posts
curl http://localhost:3000/api/v1/posts?published=true
```

---

## 📚 Résumé de la Démarche

### Flux de données :

```
USER (Browser)
    ↓
COMPOSANTS REACT (Frontend)
    ↓ fetch('/api/v1/posts')
API ROUTES (Backend REST)
    ↓
REPOSITORY (Logique CRUD)
    ↓
MONGOOSE MODEL (Schéma + Validation)
    ↓
MONGODB CONNECTION
    ↓
MONGODB DATABASE
```

### Principes appliqués :

1. **Séparation des responsabilités** :
   - Composants = Présentation
   - API Routes = Endpoints REST
   - Repository = Accès données
   - Models = Structure données

2. **Sécurité** :
   - Variables d'environnement
   - Validation des données
   - Gestion d'erreurs robuste

3. **Performance** :
   - Connexion en cache
   - Index MongoDB
   - `.lean()` pour objets légers

4. **Maintenabilité** :
   - TypeScript pour le typage
   - Code modulaire
   - Documentation inline

---

## 🎯 Prochaines Étapes

1. **Authentification** : Ajouter JWT/NextAuth pour sécuriser les routes admin
2. **Validation** : Implémenter Zod pour validation robuste
3. **Pagination** : Ajouter skip/limit dans les requêtes
4. **Tests** : Jest + React Testing Library
5. **Cache** : Redis pour améliorer les performances

Ce code est prêt à l'emploi et respecte les meilleures pratiques Next.js + MongoDB ! 🚀
