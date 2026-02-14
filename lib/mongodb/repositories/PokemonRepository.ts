import {
  CreatePokemonInput,
  IPokemon,
  UpdatePokemonInput,
} from '@/lib/types/pokemon.types';
import { connectToDatabase } from '../connection';
import Pokemon from '../models/Pokemon';

/**
 * Repository : Abstraction de l'accès aux données
 * Avantages : Testable, réutilisable, séparation des responsabilités
 */
export class PokemonRepository {
  /**
   * Récupère tous les pokemon
   */
  async findAll(): Promise<IPokemon[]> {
    await connectToDatabase();
    return await Pokemon.find()
      // .sort({ createdAt: -1 }) // Plus récents en premier
      .lean() // Retourne des objets JS simples (pas des documents Mongoose)
      .exec();
  }

  /**
   * Récupère un pokemon par son ID
   */
  async findById(id: string): Promise<IPokemon | null> {
    await connectToDatabase();

    return await Pokemon.findById(id).lean().exec();
  }

  /**
   * Créer un nouveau pokemon
   */
  async create(data: CreatePokemonInput): Promise<IPokemon> {
    await connectToDatabase();

    const pokemon = await Pokemon.create(data);
    return pokemon.toJSON(); // Utilise le transform défini dans le schéma
  }

  /**
   * Met à jour un pokemon existant
   */
  async update(id: string, data: UpdatePokemonInput): Promise<IPokemon | null> {
    await connectToDatabase();

    const pokemon = await Pokemon.findByIdAndUpdate(
      id,
      { $set: data },
      {
        new: true, // Retourne le document modifié
        runValidators: true, // Exécute les validations du schéma
      },
    )
      .lean()
      .exec();

    return pokemon;
  }

  /**
   * Supprime un pokemon
   */
  async delete(id: string): Promise<boolean> {
    await connectToDatabase();

    const result = await Pokemon.findByIdAndDelete(id);
    return result !== null;
  }

  /**
   * Compte le nombre de pokemon
   */
  async count(): Promise<number> {
    await connectToDatabase();
    return await Pokemon.countDocuments();
  }
}
