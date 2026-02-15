import { ProjectRepository } from '@/lib/mongodb/repositories/ProjectRepository';
import { UpdateProjectInput } from '@/lib/types/project.types';
import { NextRequest, NextResponse } from 'next/server';

const projectRepo = new ProjectRepository();

/**
 * GET /api/v1/projects/:id
 * Récupère un projet spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const project = await projectRepo.findById(params.id);

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Projet non trouvé',
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: project,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('❌ Erreur GET /projects/:id:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération du projet',
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/v1/projects/:id
 * Met à jour un projet existant
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body: UpdateProjectInput = await request.json();

    const project = await projectRepo.update(params.id, body);

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Projet non trouvé',
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: project,
        message: 'Projet mis à jour avec succès',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('❌ Erreur PUT /projects/:id:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour du projet',
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/v1/projects/:id
 * Supprime un projet
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const deleted = await projectRepo.delete(params.id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Projet non trouvé',
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Projet supprimé avec succès',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('❌ Erreur DELETE /projects/:id:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression du projet',
      },
      { status: 500 },
    );
  }
}
