'use client';

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { CreateProjectInput } from '@/lib/types/project.types';
import { Fragment, useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '../ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
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
] as const;

export default function CreateProjectDialog() {
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
  const anchor = useComboboxAnchor();

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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="mb-8">
          Créer un projet
        </Button>
      </DialogTrigger>
      <form onSubmit={handleSubmit}>
        <DialogContent className="sm:max-w-sm md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Créer un nouveau projet</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Titre</FieldLabel>
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
              <FieldLabel htmlFor="content">Contenus</FieldLabel>
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
                Compétences
                <span className="text-sm text-gray-500">(max 3)</span>
              </FieldLabel>
              <Combobox
                multiple
                autoHighlight
                items={skillsOptions}
                defaultValue={formData.skills}
                value={formData.skills}
                onValueChange={(value) => {
                  const skills = Array.isArray(value) ? value : [value];
                  if (skills.length > 3) return;
                  setFormData((prev) => ({ ...prev, skills }));
                }}
              >
                <ComboboxChips ref={anchor} className="w-full max-w-xs">
                  <ComboboxValue>
                    {(values) => (
                      <Fragment>
                        {values.map((value: string) => (
                          <ComboboxChip key={value}>{value}</ComboboxChip>
                        ))}
                        <ComboboxChipsInput />
                      </Fragment>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent anchor={anchor}>
                  <ComboboxEmpty>No items found.</ComboboxEmpty>
                  <ComboboxList
                    className="pointer-events-auto"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    {(item) => (
                      <ComboboxItem
                        key={item}
                        value={item}
                        disabled={
                          formData.skills.length >= 3 &&
                          !formData.skills.includes(item)
                        }
                      >
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
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
        </DialogContent>
      </form>
    </Dialog>
  );
}
