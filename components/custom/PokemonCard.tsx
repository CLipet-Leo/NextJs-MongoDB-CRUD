import { IPokemon } from '@/lib/types/pokemon.types';
import { Badge } from '../ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';

interface PokemonCardProps {
  schema: IPokemon;
}

export function PokemonCard({ schema }: PokemonCardProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{schema.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2 text-sm">Types :</p>
        <div className="flex flex-wrap gap-1">
          <Badge>{schema.types.type_1}</Badge>
          {schema.types.type_2 && <Badge>{schema.types.type_2}</Badge>}
        </div>
      </CardContent>
      {isDevelopment && (
        <CardFooter>
          <p className="text-muted-foreground text-sm">ID : {schema._id}</p>
        </CardFooter>
      )}
    </Card>
  );
}
