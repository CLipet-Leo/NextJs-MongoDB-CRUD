import {
  CreateProjectInput,
  IProject,
  UpdateProjectInput,
} from '../../types/project.types';
import { connectToDatabase } from '../connection';
import Project from '../models/Project';

export class ProjectRepository {
  /**
   * Récupère tous les projets
   */
  async findAll(): Promise<IProject[]> {
    await connectToDatabase();
    return await Project.find()
      .sort({ createdAt: -1 }) // Plus récents en premier
      .lean() // Retourne des objets JS simples (pas des documents Mongoose)
      .exec();
  }

  /**
   * Récupère un projet par son ID
   */
  async findById(id: string): Promise<IProject | null> {
    await connectToDatabase();

    return await Project.findById(id).lean().exec();
  }

  /**
   * Créer un nouveau projet
   */
  async create(data: CreateProjectInput): Promise<IProject> {
    await connectToDatabase();

    const project = await Project.create(data);
    return project.toJSON(); // Utilise le transform défini dans le schéma
  }

  /**
   * Met à jour un projet existant
   */
  async update(id: string, data: UpdateProjectInput): Promise<IProject | null> {
    await connectToDatabase();

    const project = await Project.findByIdAndUpdate(
      id,
      { $set: data },
      {
        new: true, // Retourne le document modifié
        runValidators: true, // Exécute les validations du schéma
      },
    )
      .lean()
      .exec();

    return project;
  }

  /**
   * Supprime un projet
   */
  async delete(id: string): Promise<boolean> {
    await connectToDatabase();

    const result = await Project.findByIdAndDelete(id);
    return result !== null;
  }
}
