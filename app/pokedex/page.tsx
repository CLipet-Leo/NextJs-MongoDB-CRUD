import PokemonList from '@/components/custom/PokemonList';
// import CreatePostForm from '@/components/custom/CreatePokemonsForm';

/**
 * Page principale affichant les pokemons
 */
export default function PokemonsPage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-foreground mb-12 text-center text-4xl font-bold">
          Pokédex
        </h1>

        {/* Formulaire de création */}
        {/* <section className="mb-16">
          <CreatePokemonsForm />
        </section> */}

        {/* Liste des pokemons */}
        <section>
          <h2 className="text-foreground mb-6 text-2xl font-semibold">
            Pokémons enregistrés :
          </h2>
          <PokemonList />
        </section>
      </div>
    </main>
  );
}
