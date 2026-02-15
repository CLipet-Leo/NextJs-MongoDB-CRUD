import CreateProjectForm from '@/components/custom/CreateProjectForm';
import ProjectList from '@/components/custom/ProjectList';

export default function ProjectsPage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-foreground mb-12 text-center text-4xl font-bold">
          Projets
        </h1>

        {/* Formulaire de création de projet */}
        <CreateProjectForm />

        {/* Liste des projets */}
        <section>
          <h2 className="text-foreground mb-6 text-2xl font-semibold">
            Projets publiés :
          </h2>
          <ProjectList />
        </section>
      </div>
    </main>
  );
}
