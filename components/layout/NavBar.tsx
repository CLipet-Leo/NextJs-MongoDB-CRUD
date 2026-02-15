'use client';

import Link from 'next/link';

function MainVavButton({
  path,
  label,
}: Readonly<{ path: string; label: string }>) {
  return (
    <Link
      href={path}
      className="rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
    >
      <h1 className="text-lg font-bold">{label}</h1>
    </Link>
  );
}

function NavButton({ path, label }: Readonly<{ path: string; label: string }>) {
  return (
    <Link
      href={path}
      className="rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
    >
      {label}
    </Link>
  );
}

export function NavBar() {
  return (
    <nav className="bg-gray-800 p-4 text-white">
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
