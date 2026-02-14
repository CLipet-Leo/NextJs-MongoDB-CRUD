import { PokemonRepository } from '@/lib/mongodb/repositories/PokemonRepository';
import type { CreatePokemonInput } from '@/lib/types/pokemon.types';
import { NextRequest, NextResponse } from 'next/server';

const pokemonRepo = new PokemonRepository();

/**
 * GET /api/v1/pokemons
 * Récupère tous les pokemons
 */
export async function GET() {
  try {
    const pokemons = await pokemonRepo.findAll();

    return NextResponse.json(
      {
        success: true,
        data: pokemons,
        count: pokemons.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('❌ Erreur GET /pokemons:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des pokemons',
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/v1/pokemons
 * Crée un nouveau pokemon
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreatePokemonInput = await request.json();

    // Validation basique (ou utiliser Zod pour validation robuste)
    if (!body.name || !body.types || !body.types.type_1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le nom et le type principal sont requis',
        },
        { status: 400 },
      );
    }

    const post = await pokemonRepo.create(body);

    return NextResponse.json(
      {
        success: true,
        data: post,
        message: 'Pokemon créé avec succès',
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('❌ Erreur POST /pokemons:', error);

    // Erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création du pokemon',
      },
      { status: 500 },
    );
  }
}
