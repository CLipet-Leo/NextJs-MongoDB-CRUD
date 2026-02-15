import { ProjectRepository } from '@/lib/mongodb/repositories/ProjectRepository';
import type { CreateProjectInput } from '@/lib/types/project.types';
import { NextRequest, NextResponse } from 'next/server';

const projectRepo = new ProjectRepository();

/**
 * GET /api/v1/projects
 * Récupère tous les projets
 */
export async function GET() {
  try {
    const projects = await projectRepo.findAll();

    return NextResponse.json(
      {
        success: true,
        data: projects,
        count: projects.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('❌ Erreur GET /projects:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des projets',
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/v1/projects
 * Crée un nouveau projet
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateProjectInput = await request.json();

    // Validation basique (ou utiliser Zod pour validation robuste)
    if (
      !body.title ||
      !body.content ||
      !body.imageURL ||
      !body.skills ||
      body.skills.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Tous les champs sont requis et il doit y avoir au moins une compétence',
        },
        { status: 400 },
      );
    }

    const post = await projectRepo.create(body);

    return NextResponse.json(
      {
        success: true,
        data: post,
        message: 'Projet créé avec succès',
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('❌ Erreur POST /projects:', error);

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
        error: 'Erreur lors de la création du projet',
      },
      { status: 500 },
    );
  }
}
