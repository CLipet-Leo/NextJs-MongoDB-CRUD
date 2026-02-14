import mongoose from 'mongoose';
import dns from 'node:dns/promises';

// Forcer l'utilisation de Cloudflare DNS pour éviter les problèmes de résolution
dns.setServers(['1.1.1.1']);

// Type pour le cache de connexion
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Cache global pour éviter les multiples connexions en dev
declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
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
      throw new Error('❌ Veuillez définir MONGODB_URI dans .env.local');
    }

    const options = {
      bufferCommands: false, // Désactive la mise en buffer des commandes
      maxPoolSize: 10, // Maximum 10 connexions simultanées
      minPoolSize: 2, // Minimum 2 connexions ouvertes
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
