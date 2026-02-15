/**
 * Project types
 */

export interface IProject {
  _id: string; // ID généré par MongoDB
  title: string;
  content: string;
  imageURL: string; // URLs des images du projet
  skills: string[]; // Compétences utilisées dans le projet
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  title: string;
  content: string;
  imageURL: string;
  skills: string[];
}

export interface UpdateProjectInput {
  title?: string;
  content?: string;
  imageURL?: string;
  skills?: string[];
}
