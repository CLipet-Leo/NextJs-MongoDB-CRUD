import PokemonList from '@/components/custom/PokemonList';
// import CreatePostForm from '@/components/CreatePostForm';

/**
 * Page principale affichant les posts
 */
export default function PostsPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-12 text-center text-4xl font-bold text-gray-900">
          Pokédex
        </h1>

        {/* Formulaire de création */}
        {/* <section className="mb-16">
          <CreatePostForm />
        </section> */}

        {/* Liste des posts */}
        <section>
          <h2 className="mb-6 text-2xl font-semibold text-gray-800">
            Pokémons publiés
          </h2>
          <PokemonList />
        </section>
      </div>
    </main>
  );
}
