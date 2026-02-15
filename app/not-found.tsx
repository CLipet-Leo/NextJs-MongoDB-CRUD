import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center text-center">
        <h1 className="text-foreground text-4xl font-bold">
          404 - Page non trouvée
        </h1>
        <p className="text-foreground/70 mt-4 text-lg">
          Oups ! La page que vous cherchez n&apos;existe pas.
        </p>
        <Button variant="secondary" className="mt-6">
          <Undo2 />
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </main>
  );
}
