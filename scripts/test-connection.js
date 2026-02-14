const mongoose = require('mongoose');
const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1']);
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI non trouvé dans .env.local');
  process.exit(1);
}

const clientOptions = {
  serverApi: { version: '1', strict: true, deprecationErrors: true },
};

async function testConnection() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    console.log(`📍 URI: ${uri.replace(/:[^:@]+@/, ':****@')}`); // Masque le mot de passe

    // Connexion à MongoDB
    await mongoose.connect(uri, clientOptions);
    console.log('✅ Connexion réussie!\n');

    // Ping le serveur
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log('✅ Ping réussi!\n');

    // Lister les bases de données
    const adminDb = mongoose.connection.db.admin();
    const { databases } = await adminDb.listDatabases();
    console.log('📁 Bases de données disponibles:');
    databases.forEach((db) => {
      console.log(
        `   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`,
      );
    });
    console.log('');

    // Vérifier la base pokemon_app
    const pokemonDb = mongoose.connection.useDb('pokemon_app');
    const collections = await pokemonDb.db.listCollections().toArray();

    console.log('📚 Collections dans "pokemon_app":');
    if (collections.length === 0) {
      console.log('   ⚠️  Aucune collection trouvée');
    } else {
      for (const collection of collections) {
        const count = await pokemonDb.db
          .collection(collection.name)
          .countDocuments();
        console.log(`   - ${collection.name} (${count} documents)`);
      }
    }
    console.log('');

    // Vérifier spécifiquement la collection pokedex
    const pokedexExists = collections.some((c) => c.name === 'pokedex');
    if (pokedexExists) {
      const pokedexCount = await pokemonDb.db
        .collection('pokedex')
        .countDocuments();
      console.log(
        `✅ Collection "pokedex" trouvée avec ${pokedexCount} Pokémon\n`,
      );

      // Afficher un échantillon
      if (pokedexCount > 0) {
        const sample = await pokemonDb.db.collection('pokedex').findOne();
        console.log('📄 Exemple de document:');
        console.log(JSON.stringify(sample, null, 2));
      }
    } else {
      console.log('❌ Collection "pokedex" non trouvée dans pokemon_app\n');
    }

    console.log('\n✅ Test de connexion terminé avec succès!');
  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Suggestions:');
      console.error(
        '   1. Vérifiez que votre IP est autorisée dans MongoDB Atlas (Network Access)',
      );
      console.error('   2. Vérifiez vos identifiants (username/password)');
      console.error('   3. Vérifiez que le cluster est actif');
    }
    process.exit(1);
  } finally {
    // Déconnexion
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

testConnection();
