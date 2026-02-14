import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-7xl text-center">
        <h1 className="text-foreground text-4xl font-bold">
          404 - Page non trouvée
        </h1>
        <p className="text-foreground/70 mt-4 text-lg">
          Oups ! La page que vous cherchez n&apos;existe pas.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
