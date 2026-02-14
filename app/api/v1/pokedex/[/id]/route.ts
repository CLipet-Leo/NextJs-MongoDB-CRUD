import { PokemonRepository } from '@/lib/mongodb/repositories/PokemonRepository';
import { UpdatePokemonInput } from '@/lib/types/pokemon.types';
import { NextRequest, NextResponse } from 'next/server';

const pokemonRepo = new PokemonRepository();

/**
 * GET /api/v1/pokemons/:id
 * Récupère un pokemon spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const pokemon = await pokemonRepo.findById(params.id);

    if (!pokemon) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pokemon non trouvé',
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: pokemon,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('❌ Erreur GET /pokemons/:id:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération du pokemon',
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/v1/pokemons/:id
 * Met à jour un pokemon
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body: UpdatePokemonInput = await request.json();

    const pokemon = await pokemonRepo.update(params.id, body);

    if (!pokemon) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pokemon non trouvé',
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: pokemon,
        message: 'Pokemon mis à jour avec succès',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('❌ Erreur PUT /pokemons/:id:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour du pokemon',
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/v1/pokemons/:id
 * Supprime un pokemon
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const deleted = await pokemonRepo.delete(params.id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pokemon non trouvé',
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Pokemon supprimé avec succès',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('❌ Erreur DELETE /pokemons/:id:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression du pokemon',
      },
      { status: 500 },
    );
  }
}
