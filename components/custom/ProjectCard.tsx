import type { IProject } from '@/lib/types/project.types';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ProjectCardProps {
  project: IProject;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <Image
          src={project.imageURL}
          alt={project.title}
          width={400}
          height={200}
          className="rounded-md object-cover"
        />
        <CardTitle>{project.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{project.content}</p>
        <p className="mb-2">Compétences :</p>{' '}
        {project.skills.map((skill, index) => (
          <Badge variant="outline" key={index}>
            {skill}
          </Badge>
        ))}
      </CardContent>
    </Card>
  );
}
