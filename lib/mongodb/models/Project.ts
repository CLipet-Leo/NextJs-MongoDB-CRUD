import { IProject } from '@/lib/types/project.types';
import mongoose, { Schema, type Model } from 'mongoose';

/**
 * Schéma Mongoose avec validation
 */
const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, 'Le titre du projet est requis'],
      trim: true,
      minlength: [3, 'Le titre doit contenir au moins 3 caractères'],
      maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères'],
    },
    content: {
      type: String,
      required: [true, 'Le contenu du projet est requis'],
      trim: true,
      minlength: [10, 'Le contenu doit contenir au moins 10 caractères'],
    },
    imageURL: {
      type: String,
      required: [true, "L'URL de l'image est requise"],
      trim: true,
    },
    skills: {
      type: [String],
      required: [true, 'Les compétences sont requises'],
      validate: {
        validator: function (skills: string[]) {
          return skills.length > 0;
        },
        message: 'Il doit y avoir au moins une compétence',
      },
    },
  },
  {
    collection: 'projects',
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
ProjectSchema.index({ title: 'text', content: 'text' }); // Recherche full-text

/**
 * Évite la réinitialisation du modèle en développement (HMR)
 */
const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
