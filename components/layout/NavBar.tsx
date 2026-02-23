'use client';

import { SquareTerminal } from 'lucide-react';
import Link from 'next/link';

function MainVavButton({
  path,
  label,
}: Readonly<{ path: string; label: string }>) {
  return (
    <Link
      href={path}
      className="hover:bg-primary/30 text-foreground rounded-md px-3 py-2 text-sm font-medium"
    >
      <h1 className="inline-flex items-center gap-2 text-lg font-bold">
        <SquareTerminal className="text-primary/60" />
        {label}
      </h1>
    </Link>
  );
}

function NavButton({ path, label }: Readonly<{ path: string; label: string }>) {
  return (
    <Link
      href={path}
      className="hover:bg-primary/30 text-foreground rounded-md px-3 py-2 text-sm font-medium"
    >
      {label}
    </Link>
  );
}

export function NavBar() {
  return (
    <nav className="bg-background/80 border-border border-b py-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <MainVavButton path="/" label="NextJS MongoDB CRUD" />
        <div className="flex space-x-4">
          {/* <NavButton path="/pokedex" label="Pokédex" /> */}
          <NavButton path="/projects" label="Projets" />
        </div>
      </div>
    </nav>
  );
}
