import { IPokemon } from '@/lib/types/pokemon.types';
import { Badge } from '../ui/badge';

interface PokemonCardProps {
  schema: IPokemon;
}

export function PokemonCard({ schema }: PokemonCardProps) {
  return (
    <div className="bg-secondary rounded border p-4 shadow-md">
      <h2 className="mb-2 text-xl font-bold">{schema.name}</h2>
      <div className="flex flex-wrap gap-1">
        <Badge>{schema.types.type_1}</Badge>
        {schema.types.type_2 && <Badge>{schema.types.type_2}</Badge>}
      </div>
    </div>
  );
}
