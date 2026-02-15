'use client';

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { CreateProjectInput } from '@/lib/types/project.types';
import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

const skillsOptions = [
  'UE5',
  'Unity',
  'Node.js',
  'React',
  'MongoDB',
  'TypeScript',
  'C#',
  'C++',
  'API REST',
];

export default function CreateProjectForm() {
  const [formData, setFormData] = useState<CreateProjectInput>({
    title: '',
    content: '',
    imageURL: '',
    skills: [],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur de création');
      }

      setMessage({ type: 'success', text: 'Projet créé avec succès !' });

      // Reset du formulaire
      setFormData({
        title: '',
        content: '',
        imageURL: '',
        skills: [],
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!message) return;

    if (message.type === 'success') {
      toast.success(message.text);
    } else {
      toast.error(message.text);
    }
  }, [message]);

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl rounded-lg p-8 shadow-md"
    >
      <h2 className="mb-6 text-2xl font-bold">Créer un nouveau projet</h2>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            type="text"
            placeholder="Titre du projet"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="content">Content</FieldLabel>
          <Textarea
            id="content"
            placeholder="Description du projet"
            value={formData.content}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, content: e.target.value }))
            }
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="imageURL">Image URL</FieldLabel>
          <Input
            id="imageURL"
            type="text"
            placeholder="URL de l'image du projet"
            value={formData.imageURL}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, imageURL: e.target.value }))
            }
            required
          />
        </Field>
        {/* Ne peut choisir que 3 compétences */}
        <Field>
          <FieldLabel htmlFor="skills">
            Skills
            <span className="text-sm text-gray-500">(max 3)</span>
          </FieldLabel>
          <div className="flex flex-wrap gap-2">
            {skillsOptions.map((skill) => (
              <button
                key={skill}
                type="button"
                className={`rounded-full px-3 py-1 text-sm ${
                  formData.skills.includes(skill)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
                onClick={() => {
                  setFormData((prev) => {
                    const skills = prev.skills.includes(skill)
                      ? prev.skills.filter((s) => s !== skill)
                      : [...prev.skills, skill].slice(0, 3); // Limite à 3 compétences
                    return { ...prev, skills };
                  });
                }}
              >
                {skill}
              </button>
            ))}
          </div>
          <FieldDescription>
            Choisissez les compétences requises
          </FieldDescription>
        </Field>
        <Field orientation="horizontal">
          <Button type="submit" disabled={loading}>
            {loading ? 'Création...' : 'Créer le projet'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
