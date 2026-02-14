import { IPokemon } from '@/lib/types/pokemon.types';
import mongoose, { Schema, type Model } from 'mongoose';

/**
 * Schéma Mongoose avec validation
 */
const PokemonSchema = new Schema<IPokemon>(
  {
    name: {
      type: String,
      required: [true, 'Le nom du Pokémon est requis'],
      trim: true,
      minlength: [3, 'Le nom doit contenir au moins 3 caractères'],
      maxlength: [25, 'Le nom ne peut pas dépasser 25 caractères'],
    },
    types: {
      type_1: {
        type: String,
        required: [true, 'Le type principal est requis'],
        trim: true,
        minlength: [3, 'Le type doit contenir au moins 3 caractères'],
        maxlength: [20, 'Le type ne peut pas dépasser 20 caractères'],
      },
      type_2: {
        type: String,
        trim: true,
        minlength: [3, 'Le type doit contenir au moins 3 caractères'],
        maxlength: [20, 'Le type ne peut pas dépasser 20 caractères'],
      },
    },
  },
  {
    collection: 'pokedex',
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
    toJSON: {
      virtuals: true, // Inclut les champs virtuels dans JSON
      transform: function (doc, ret) {
        ret._id = ret._id.toString();
        return ret;
      },
    },
  },
);

// Index pour améliorer les performances de recherche
PokemonSchema.index({ name: 'text' }); // Recherche full-text
// PokemonSchema.index({ createdAt: -1 }); // Tri par date décroissante
// PokemonSchema.index({ published: 1 }); // Filtrage par statut

/**
 * Évite la réinitialisation du modèle en développement (HMR)
 */
const Pokemon: Model<IPokemon> =
  mongoose.models.Pokemon || mongoose.model<IPokemon>('Pokemon', PokemonSchema);

export default Pokemon;
