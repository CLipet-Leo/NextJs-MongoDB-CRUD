'use client';

import { IPokemon } from '@/lib/types/pokemon.types';
import { useEffect, useState } from 'react';
import { PokemonCard } from './PokemonCard';

/**
 * Composant pour afficher la liste des posts
 * Fetch côté client pour démo (en production, préférer Server Components)
 */
export default function PostList() {
  const [pokemons, setPokemons] = useState<IPokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPokemons() {
      try {
        const response = await fetch('/api/v1/pokedex');

        if (!response.ok) {
          throw new Error('Erreur de chargement');
        }

        const result = await response.json();
        setPokemons(result.data);
      } catch (err) {
        setError('Impossible de charger les pokemons');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPokemons();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (pokemons.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-gray-500">
          Aucun pokémon publié pour le moment
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {pokemons.map((pokemon) => (
        <PokemonCard key={pokemon._id} schema={pokemon} />
      ))}
    </div>
  );
}
